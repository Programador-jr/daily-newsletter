'use strict';

/**
 * Impostômetro em tempo real.
 *
 * Normaliza duas fontes públicas que medem coisas diferentes:
 *
 * - "acsp": impostometro.com.br (Associação Comercial de São Paulo / IBPT).
 *   Soma tributos federais, estaduais e municipais. O site expõe endpoints
 *   JSON internos (/Contador/*) que devolvem o valor acumulado até a meia-noite
 *   (horário de Brasília) e o incremento estimado por segundo.
 * - "org": impostometro.org (projeto independente, dados da Receita Federal).
 *   Estima apenas a arrecadação federal. Não há API: os parâmetros do contador
 *   (valor inicial, incremento por segundo e data-base) ficam no HTML da home.
 *
 * Toda resposta de contador segue o mesmo formato, de modo que o navegador só
 * precisa projetar `valor + incrementoPorSegundo * segundosDesde(referencia)`.
 */

const { setPublicCache } = require('../../public-cache');
const readResponseLimited = require('../../read-response-limited');
const { HttpError, createUpstreamCache } = require('../../upstream-cache');

const ACSP_BASE = 'https://impostometro.com.br';
const ORG_URL = 'https://impostometro.org/';
const USER_AGENT = 'KingsNewsletter/1.2 (+https://github.com/Programador-jr/daily-newsletter)';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_JSON_BYTES = 512 * 1024;
const MAX_HTML_BYTES = 1024 * 1024;
const BRASILIA_OFFSET = '-03:00';
const FIRST_YEAR = 2010;
const HISTORY_FIRST_YEAR = 2015;

const COUNTER_TTL_MS = 10 * 60 * 1000;
const CLOSED_PERIOD_TTL_MS = 24 * 60 * 60 * 1000;
const LIST_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;

const UFS = [
  'ac', 'al', 'am', 'ap', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mg', 'ms', 'mt', 'pa',
  'pb', 'pe', 'pi', 'pr', 'rj', 'rn', 'ro', 'rr', 'rs', 'sc', 'se', 'sp', 'to'
];
const ESFERAS = ['federal', 'estadual', 'municipal'];
const ESCOPOS = ['brasil', 'estado', 'municipio', 'tributo'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SOURCES = {
  acsp: {
    id: 'acsp',
    nome: 'Impostômetro — ACSP/IBPT',
    site: 'https://impostometro.com.br/',
    metodologia: 'https://impostometro.com.br/home/metodologiaimpostometro',
    abrangencia: 'Tributos federais, estaduais e municipais'
  },
  org: {
    id: 'org',
    nome: 'Impostômetro.org',
    site: 'https://impostometro.org/',
    metodologia: 'https://impostometro.org/sobre/',
    abrangencia: 'Arrecadação federal (Receita Federal)'
  }
};

const upstreamCache = createUpstreamCache({ maxEntries: MAX_CACHE_ENTRIES });
const cached = upstreamCache.cached;

/* ------------------------------------------------------------------ datas */

function brasiliaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const get = type => parts.find(part => part.type === type).value;
  return { year: Number(get('year')), month: get('month'), day: get('day') };
}

/** "2026-11-07T21:58:12.0810000" (horário de Brasília, sem fuso) → Date. */
function parseBrasiliaDateTime(value) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.(\d+))?$/.exec(String(value || ''));
  if (!match) return null;
  const millis = (match[3] || '0').padEnd(3, '0').slice(0, 3);
  const date = new Date(`${match[1]}T${match[2]}.${millis}${BRASILIA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function periodFor(year, now = new Date()) {
  const today = brasiliaToday(now);
  const isCurrent = year === today.year;
  return {
    ano: year,
    inicio: `${year}-01-01`,
    fim: isCurrent ? `${year}-${today.month}-${today.day}` : `${year}-12-31`,
    emAndamento: isCurrent,
    // Formato aceito pelo impostometro.com.br: dd/mm/aaaa.
    dataInicial: `01/01/${year}`,
    dataFinal: isCurrent ? `${today.day}/${today.month}/${year}` : `31/12/${year}`
  };
}

/* --------------------------------------------------------------- parsers */

/**
 * Converte a resposta de /Contador/* no formato comum. O campo Valor é o
 * acumulado até `Midnight`; o valor no instante `Data` soma o incremento.
 */
function normalizeAcspCounter(payload) {
  const valor = Number(payload?.Valor);
  const incremento = Number(payload?.Incremento);
  const data = parseBrasiliaDateTime(payload?.Data);
  const meiaNoite = parseBrasiliaDateTime(payload?.Midnight);

  if (!Number.isFinite(valor) || !Number.isFinite(incremento) || !data || !meiaNoite) {
    throw new HttpError(502, 'Resposta inesperada do impostometro.com.br.');
  }
  // A fonte responde Valor 0 (e datas "0001-01-01") quando o filtro não existe.
  if (valor <= 0) throw new HttpError(404, 'Não há dados do Impostômetro para esse filtro.');

  const segundosDesdeMeiaNoite = Math.max(0, (data.getTime() - meiaNoite.getTime()) / 1000);
  return {
    valor: round2(valor + incremento * segundosDesdeMeiaNoite),
    incrementoPorSegundo: round2(incremento),
    referencia: data.toISOString()
  };
}

/** Extrai os parâmetros do contador inline da home do impostometro.org. */
function parseOrgCounter(html, now = Date.now()) {
  const text = String(html || '');
  const number = name => {
    const match = new RegExp(`const\\s+${name}\\s*=\\s*([\\d_.]+)\\s*;`).exec(text);
    return match ? Number(match[1].replace(/_/g, '')) : NaN;
  };
  const initialValue = number('initialValue');
  const incrementPerSecond = number('incrementPerSecond');
  const baseDateMatch = /const\s+baseDate\s*=\s*["']([^"']+)["']/.exec(text);
  const baseDate = baseDateMatch ? new Date(baseDateMatch[1]) : null;

  if (!Number.isFinite(initialValue) || !Number.isFinite(incrementPerSecond) || !baseDate || Number.isNaN(baseDate.getTime())) {
    throw new HttpError(502, 'Não foi possível ler o contador do impostometro.org.');
  }

  const yearMatch = /Arrecada[çc][ãa]o\s+Federal\s+em\s+(\d{4})/i.exec(text);
  const elapsedSeconds = Math.max(0, Math.floor((now - baseDate.getTime()) / 1000));
  return {
    valor: round2(initialValue + elapsedSeconds * incrementPerSecond),
    incrementoPorSegundo: incrementPerSecond,
    referencia: new Date(now).toISOString(),
    ano: yearMatch ? Number(yearMatch[1]) : new Date(now).getUTCFullYear(),
    parametros: {
      valorInicial: initialValue,
      dataBase: baseDate.toISOString()
    }
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/* ------------------------------------------------------------- upstream */

/**
 * Resume um erro de rede do fetch para log. O undici devolve só "fetch failed"
 * em `message`; o motivo real (ECONNRESET, ENOTFOUND, erro de TLS...) fica em
 * `cause`.
 */
function describeNetworkError(error) {
  const cause = error?.cause;
  return {
    name: error?.name || 'UnknownError',
    message: error?.message || String(error),
    ...(cause ? {
      cause: {
        name: cause.name,
        code: cause.code,
        message: cause.message
      }
    } : {})
  };
}

async function fetchUpstream(url, { json, maxBytes }) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: json ? 'application/json' : 'text/html',
        'User-Agent': USER_AGENT,
        // Sem este cabeçalho os endpoints /Contador/* redirecionam para a página de erro.
        ...(json ? { 'X-Requested-With': 'XMLHttpRequest' } : {})
      },
      redirect: json ? 'manual' : 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (error) {
    // Falha antes de qualquer resposta HTTP (conexão recusada/derrubada, DNS,
    // TLS, timeout). Vira 502 para que o cache possa servir o último valor bom.
    const { host, pathname } = new URL(url);
    console.error(JSON.stringify({
      event: 'impostometro.fetch_failed',
      upstream: `${host}${pathname}`,
      error: describeNetworkError(error)
    }));
    throw new HttpError(502, 'A fonte do Impostômetro está indisponível no momento.');
  }

  if (!response.ok) {
    const notFound = response.status === 404 || (response.status >= 300 && response.status < 400);
    throw new HttpError(notFound ? 404 : 502, notFound
      ? 'A fonte não encontrou dados para esse filtro.'
      : 'A fonte do Impostômetro está indisponível no momento.');
  }

  const body = (await readResponseLimited(response, maxBytes, 'A resposta da fonte excede o limite de tamanho.')).toString('utf8');
  if (!json) return body;
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(502, 'Resposta inesperada do impostometro.com.br.');
  }
}

/* ------------------------------------------------------------ validação */

function readYear(raw, currentYear) {
  if (raw === undefined || raw === '') return currentYear;
  const year = Number(raw);
  if (!Number.isInteger(year) || year < FIRST_YEAR || year > currentYear) {
    throw new HttpError(400, `O parâmetro ano deve estar entre ${FIRST_YEAR} e ${currentYear}.`);
  }
  return year;
}

function readChoice(raw, options, name, fallback) {
  const value = raw === undefined || raw === '' ? fallback : String(raw).toLowerCase();
  if (!options.includes(value)) throw new HttpError(400, `Parâmetro ${name} inválido.`);
  return value;
}

function readSlug(raw, name) {
  const value = String(raw || '').toLowerCase();
  if (!value || value.length > 80 || !SLUG_PATTERN.test(value)) throw new HttpError(400, `Parâmetro ${name} inválido.`);
  return value;
}

function buildAcspRequest(query, now = new Date()) {
  const currentYear = brasiliaToday(now).year;
  const escopo = readChoice(query.escopo, ESCOPOS, 'escopo', 'brasil');
  const periodo = periodFor(readYear(query.ano, currentYear), now);
  const params = new URLSearchParams();
  const filtros = {};
  let path;

  if (escopo === 'brasil') {
    path = '/Contador/Brasil';
  } else if (escopo === 'estado') {
    filtros.uf = readChoice(query.uf, UFS, 'uf');
    path = '/Contador/Estado';
    params.set('estado', filtros.uf);
  } else if (escopo === 'municipio') {
    filtros.uf = readChoice(query.uf, UFS, 'uf');
    filtros.municipio = readSlug(query.municipio, 'municipio');
    path = '/Contador/Municipios';
    params.set('estado', filtros.uf);
    params.set('municipio', filtros.municipio);
  } else {
    filtros.esfera = readChoice(query.esfera, ESFERAS, 'esfera');
    filtros.tributo = readSlug(query.tributo, 'tributo');
    path = '/Contador/Tributo';
    params.set('esfera', filtros.esfera);
    params.set('tributo', filtros.tributo);
  }

  params.set('dataInicial', periodo.dataInicial);
  params.set('dataFinal', periodo.dataFinal);
  return { escopo, filtros, periodo, url: `${ACSP_BASE}${path}?${params}` };
}

/* --------------------------------------------------------------- recursos */

async function getAcspCounter(query, now = new Date()) {
  const request = buildAcspRequest(query, now);
  const { ano, inicio, fim, emAndamento } = request.periodo;
  const periodo = { ano, inicio, fim, emAndamento };
  const ttl = periodo.emAndamento ? COUNTER_TTL_MS : CLOSED_PERIOD_TTL_MS;
  const counter = await cached(`acsp:${request.url}`, ttl, async () =>
    normalizeAcspCounter(await fetchUpstream(request.url, { json: true, maxBytes: MAX_JSON_BYTES })));

  return {
    fonte: SOURCES.acsp,
    escopo: { tipo: request.escopo, ...request.filtros },
    periodo,
    ...counter,
    // Em períodos fechados a fonte devolve incremento 0; mantém a semântica.
    emAndamento: periodo.emAndamento && counter.incrementoPorSegundo > 0
  };
}

async function getOrgCounter() {
  const counter = await cached('org:home', COUNTER_TTL_MS, async () =>
    parseOrgCounter(await fetchUpstream(ORG_URL, { json: false, maxBytes: MAX_HTML_BYTES })));

  // O valor em cache é projetado para o instante da resposta.
  const elapsed = Math.max(0, (Date.now() - Date.parse(counter.referencia)) / 1000);
  return {
    fonte: SOURCES.org,
    escopo: { tipo: 'brasil', esfera: 'federal' },
    periodo: { ano: counter.ano, inicio: `${counter.ano}-01-01`, emAndamento: true },
    valor: round2(counter.valor + counter.incrementoPorSegundo * elapsed),
    incrementoPorSegundo: counter.incrementoPorSegundo,
    referencia: new Date().toISOString(),
    emAndamento: true,
    parametros: counter.parametros,
    ...(counter.desatualizado ? { desatualizado: true } : {})
  };
}

/** Totais anuais fechados do Brasil (ACSP), em valores nominais. */
async function getHistory(now = new Date()) {
  const currentYear = brasiliaToday(now).year;
  const years = [];
  for (let year = HISTORY_FIRST_YEAR; year < currentYear; year += 1) years.push(year);

  const results = await Promise.allSettled(years.map(year => getAcspCounter({ escopo: 'brasil', ano: String(year) }, now)));
  const serie = results
    .map((result, index) => result.status === 'fulfilled' ? { ano: years[index], valor: result.value.valor } : null)
    .filter(Boolean);
  if (!serie.length) throw new HttpError(502, 'Não foi possível consultar o histórico do Impostômetro.');

  return { fonte: SOURCES.acsp, escopo: { tipo: 'brasil' }, valores: 'nominais', serie };
}

async function getTaxList(query) {
  const esfera = readChoice(query.esfera, ESFERAS, 'esfera');
  const url = `${ACSP_BASE}/Contador/ObterTributoEsfera?esfera=${esfera}`;
  const items = await cached(`list:${url}`, LIST_TTL_MS, () => fetchUpstream(url, { json: true, maxBytes: MAX_JSON_BYTES }));
  if (!Array.isArray(items)) throw new HttpError(502, 'Resposta inesperada do impostometro.com.br.');
  return {
    esfera,
    tributos: items
      .filter(item => item && typeof item.Parametro === 'string' && SLUG_PATTERN.test(item.Parametro))
      .map(item => ({ id: item.Parametro, nome: String(item.Nome || item.Parametro) }))
  };
}

async function getCityList(query) {
  const uf = readChoice(query.uf, UFS, 'uf');
  const url = `${ACSP_BASE}/Contador/ObterNomeCidades?estado=${uf}`;
  const items = await cached(`list:${url}`, LIST_TTL_MS, () => fetchUpstream(url, { json: true, maxBytes: MAX_JSON_BYTES }));
  if (!Array.isArray(items)) throw new HttpError(502, 'Resposta inesperada do impostometro.com.br.');
  return {
    uf,
    municipios: items
      .filter(item => item && typeof item.Parametro === 'string' && SLUG_PATTERN.test(item.Parametro))
      .map(item => ({ id: item.Parametro, nome: String(item.Nome || item.Parametro) }))
  };
}

/* ---------------------------------------------------------------- handler */

async function impostometroHandler(req, res) {
  const query = req.query || {};
  try {
    let body;
    let maxAge = 300;
    let stale = 3600;

    if (query.lista === 'tributos') {
      body = await getTaxList(query);
      maxAge = 86400;
      stale = 604800;
    } else if (query.lista === 'municipios') {
      body = await getCityList(query);
      maxAge = 86400;
      stale = 604800;
    } else if (query.lista === 'historico') {
      body = await getHistory();
      maxAge = 43200;
      stale = 604800;
    } else if (query.lista !== undefined) {
      throw new HttpError(400, 'Parâmetro lista inválido.');
    } else {
      const fonte = readChoice(query.fonte, ['acsp', 'org'], 'fonte', 'acsp');
      body = fonte === 'org' ? await getOrgCounter() : await getAcspCounter(query);
      if (body.periodo && body.periodo.emAndamento === false) {
        maxAge = 43200;
        stale = 604800;
      }
    }

    body.consultadoEm = new Date().toISOString();
    setPublicCache(res, maxAge, stale);
    return res.status(200).json(body);
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error(JSON.stringify({
        event: 'impostometro.upstream_failed',
        fonte: typeof query.fonte === 'string' ? query.fonte : 'acsp',
        lista: typeof query.lista === 'string' ? query.lista : undefined,
        escopo: typeof query.escopo === 'string' ? query.escopo : undefined,
        error: describeNetworkError(error)
      }));
    }
    const status = error instanceof HttpError ? error.status : 502;
    const message = error instanceof HttpError ? error.message : 'Não foi possível consultar o Impostômetro.';
    return res.status(status).json({ erro: message });
  }
}

module.exports = impostometroHandler;
module.exports._internal = {
  buildAcspRequest,
  normalizeAcspCounter,
  parseBrasiliaDateTime,
  parseOrgCounter,
  periodFor,
  clearCache: () => upstreamCache.clear()
};
