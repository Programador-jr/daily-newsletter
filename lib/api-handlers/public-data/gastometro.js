'use strict';

/**
 * Gastômetro em tempo real.
 *
 * Fonte: Ga$to Brasil (gastobrasil.com.br). O site expõe uma API tRPC pública
 * (/api/trpc/<procedimento>) com contadores de despesa primária paga, por ente:
 *
 *   cod_ente 0 → Governo Geral (soma das esferas)   1 → União
 *            2 → Estados (soma)                      3 → Municípios (soma)
 *            2 dígitos → estado (código IBGE da UF)  7 dígitos → município (IBGE)
 *
 * Cada contador traz `base_value` no instante `as_of` e `rate_per_second`;
 * o valor em qualquer instante é base_value + rate_per_second × segundos.
 */

const { setPublicCache } = require('../../public-cache');
const readResponseLimited = require('../../read-response-limited');
const { HttpError, createUpstreamCache } = require('../../upstream-cache');

const TRPC_BASE = 'https://www.gastobrasil.com.br/api/trpc';
const USER_AGENT = 'KingsNewsletter/1.2 (+https://github.com/Programador-jr/daily-newsletter)';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_RESPONSE_BYTES = 512 * 1024;
const COUNTER_TTL_MS = 10 * 60 * 1000;
const LIST_TTL_MS = 24 * 60 * 60 * 1000;

const SOURCE = {
  id: 'gastobrasil',
  nome: 'Ga$to Brasil',
  site: 'https://www.gastobrasil.com.br/',
  abrangencia: 'Despesa primária paga pela União, estados e municípios'
};

// Códigos IBGE das 27 unidades da federação.
const UF_CODES = {
  11: 'ro', 12: 'ac', 13: 'am', 14: 'rr', 15: 'pa', 16: 'ap', 17: 'to',
  21: 'ma', 22: 'pi', 23: 'ce', 24: 'rn', 25: 'pb', 26: 'pe', 27: 'al', 28: 'se', 29: 'ba',
  31: 'mg', 32: 'es', 33: 'rj', 35: 'sp',
  41: 'pr', 42: 'sc', 43: 'rs',
  50: 'ms', 51: 'mt', 52: 'go', 53: 'df'
};

const AGGREGATES = {
  0: { id: 'geral', tipo: 'brasil' },
  1: { id: 'uniao', tipo: 'uniao' },
  2: { id: 'estados', tipo: 'estados' },
  3: { id: 'municipios', tipo: 'municipios' }
};

const upstreamCache = createUpstreamCache();
const { cached } = upstreamCache;

/* --------------------------------------------------------------- upstream */

async function trpcQuery(procedure, input) {
  const url = new URL(`${TRPC_BASE}/${procedure}`);
  if (input !== undefined) url.searchParams.set('input', JSON.stringify(input));

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  const body = (await readResponseLimited(response, MAX_RESPONSE_BYTES, 'A resposta do Gasto Brasil excede o limite de tamanho.')).toString('utf8');

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new HttpError(502, 'Resposta inesperada do Gasto Brasil.');
  }

  if (payload?.error) {
    // A fonte responde 500 "no counter data for entity" para códigos sem dados.
    const message = String(payload.error.message || '');
    if (/no counter data|not found/i.test(message) || payload.error.data?.httpStatus === 404) {
      throw new HttpError(404, 'O Gasto Brasil não tem dados para esse ente.');
    }
    throw new HttpError(502, 'O Gasto Brasil está indisponível no momento.');
  }
  if (!response.ok || !payload || !('result' in payload)) {
    throw new HttpError(502, 'O Gasto Brasil está indisponível no momento.');
  }
  return payload.result.data;
}

/* ---------------------------------------------------------------- parsers */

function readCounter(raw, now = Date.now()) {
  const base = Number(raw?.base_value);
  const rate = Number(raw?.rate_per_second);
  const asOf = Date.parse(raw?.as_of);
  if (!Number.isFinite(base) || !Number.isFinite(rate) || !Number.isFinite(asOf)) {
    throw new HttpError(502, 'Resposta inesperada do Gasto Brasil.');
  }
  return projectCounter({ base, rate, asOf }, now);
}

/** Leva o contador ao instante `now` para que todos tenham a mesma referência. */
function projectCounter({ base, rate, asOf }, now = Date.now()) {
  const elapsed = Math.max(0, (now - asOf) / 1000);
  return {
    valor: round2(base + rate * elapsed),
    incrementoPorSegundo: round4(rate)
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function round4(value) {
  return Math.round(value * 10000) / 10000;
}

function describeEntity(code) {
  if (AGGREGATES[code]) return { codigo: code, ...AGGREGATES[code] };
  if (UF_CODES[code]) return { codigo: code, id: UF_CODES[code], tipo: 'estado' };
  return { codigo: code, id: String(code), tipo: 'municipio', uf: UF_CODES[Math.floor(code / 100000)] };
}

/* ------------------------------------------------------------- validação */

function readEntityCode(raw) {
  const text = String(raw ?? '').trim();
  if (!/^\d{1,7}$/.test(text)) throw new HttpError(400, 'Parâmetro ente inválido.');
  const code = Number(text);
  if (AGGREGATES[code] || UF_CODES[code]) return code;
  if (text.length === 7 && UF_CODES[Math.floor(code / 100000)]) return code;
  throw new HttpError(400, 'Parâmetro ente inválido. Use 0 a 3, o código IBGE da UF ou do município.');
}

function readUfCode(raw) {
  const text = String(raw ?? '').trim().toLowerCase();
  const byCode = UF_CODES[Number(text)] ? Number(text) : null;
  const bySigla = Object.entries(UF_CODES).find(([, sigla]) => sigla === text);
  const code = byCode ?? (bySigla ? Number(bySigla[0]) : null);
  if (!code) throw new HttpError(400, 'Parâmetro uf inválido.');
  return code;
}

/* --------------------------------------------------------------- recursos */

async function getOverview() {
  const data = await cached('spending', COUNTER_TTL_MS, () => trpcQuery('counters.spending'));
  if (!data || !Array.isArray(data.entities)) throw new HttpError(502, 'Resposta inesperada do Gasto Brasil.');

  const now = Date.now();
  const asOf = Date.parse(data.as_of);
  const entes = data.entities
    .filter(entity => AGGREGATES[entity.cod_ente])
    .map(entity => ({
      ...describeEntity(entity.cod_ente),
      nome: String(entity.label || ''),
      ...readCounter({ ...entity, as_of: data.as_of }, now)
    }));
  const total = entes.find(ente => ente.codigo === 0);
  if (!total) throw new HttpError(502, 'Resposta inesperada do Gasto Brasil.');

  let previdencia = null;
  if (data.previdencia && Number.isFinite(asOf)) {
    const counter = readCounter({ ...data.previdencia, as_of: data.as_of }, now);
    previdencia = { ...counter, participacao: total.valor > 0 ? round4(counter.valor / total.valor) : null };
  }

  return {
    fonte: SOURCE,
    periodo: { ano: Number(data.year), emAndamento: true },
    referencia: new Date(now).toISOString(),
    emAndamento: true,
    entes,
    previdencia,
    ...(data.desatualizado ? { desatualizado: true } : {})
  };
}

async function getEntity(query) {
  const code = readEntityCode(query.ente);
  const input = { cod_ente: code };
  const [counter, pension, branches] = await Promise.allSettled([
    cached(`entity:${code}`, COUNTER_TTL_MS, () => trpcQuery('counters.entity', input)),
    cached(`previdencia:${code}`, COUNTER_TTL_MS, () => trpcQuery('previdencia.current', input)),
    cached(`poderes:${code}`, COUNTER_TTL_MS, () => trpcQuery('poderes.current', input))
  ]);
  if (counter.status === 'rejected') throw counter.reason;

  const now = Date.now();
  const data = counter.value;
  const main = readCounter(data, now);
  const body = {
    fonte: SOURCE,
    ente: { ...describeEntity(code), nome: String(data.label || '') },
    periodo: { ano: Number(data.year), emAndamento: true },
    referencia: new Date(now).toISOString(),
    emAndamento: true,
    ...main
  };

  // Detalhes são complementares: a falha de um deles não derruba o contador.
  if (pension.status === 'fulfilled') {
    try {
      const value = readCounter(pension.value, now);
      body.previdencia = { ...value, participacao: main.valor > 0 ? round4(value.valor / main.valor) : null };
    } catch { /* sem detalhe de previdência */ }
  }

  if (branches.status === 'fulfilled' && Array.isArray(branches.value?.branches)) {
    try {
      body.pessoalPorPoder = branches.value.branches
        .map(branch => ({
          id: String(branch.esfera || ''),
          nome: String(branch.label || branch.esfera || ''),
          ...readCounter({ ...branch, as_of: branches.value.as_of }, now)
        }))
        .filter(branch => branch.valor > 0)
        .sort((a, b) => b.valor - a.valor);
    } catch { /* sem detalhe por Poder */ }
  }

  if (data.desatualizado) body.desatualizado = true;
  return body;
}

async function getCityList(query) {
  const uf = readUfCode(query.uf);
  const items = await cached(`municipios:${uf}`, LIST_TTL_MS, () => trpcQuery('municipios.list', { uf: String(uf) }));
  if (!Array.isArray(items)) throw new HttpError(502, 'Resposta inesperada do Gasto Brasil.');
  return {
    uf: UF_CODES[uf],
    codigoUf: uf,
    municipios: items
      .filter(item => Number.isInteger(item?.cod_ibge) && Math.floor(item.cod_ibge / 100000) === uf)
      .map(item => ({ codigo: item.cod_ibge, nome: String(item.nome_municipio || item.cod_ibge) }))
  };
}

/* ---------------------------------------------------------------- handler */

async function gastometroHandler(req, res) {
  const query = req.query || {};
  try {
    let body;
    let maxAge = 300;
    let stale = 3600;

    if (query.lista === 'municipios') {
      body = await getCityList(query);
      maxAge = 86400;
      stale = 604800;
    } else if (query.lista !== undefined) {
      throw new HttpError(400, 'Parâmetro lista inválido.');
    } else if (query.ente !== undefined) {
      body = await getEntity(query);
    } else {
      body = await getOverview();
    }

    body.consultadoEm = new Date().toISOString();
    setPublicCache(res, maxAge, stale);
    return res.status(200).json(body);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 502;
    const message = error instanceof HttpError ? error.message : 'Não foi possível consultar o Gastômetro.';
    return res.status(status).json({ erro: message });
  }
}

module.exports = gastometroHandler;
module.exports._internal = {
  projectCounter,
  readCounter,
  readEntityCode,
  readUfCode,
  clearCache: () => upstreamCache.clear()
};
