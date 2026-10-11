const API_BASE = 'https://api-publica.transferegov.gestao.gov.br/especiais';
const PAGE_SIZE = 200;
const UPSTREAM_TIMEOUT_MS = 60000;
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();
const validStates = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
]);

const cached = (key, loader) => {
  const current = cache.get(key);
  if (current && current.expiresAt > Date.now()) return current.promise;

  const promise = loader().catch(error => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { promise, expiresAt: Date.now() + CACHE_TTL });
  return promise;
};

const requestPage = async (resource, filters, page) => {
  const url = new URL(`${API_BASE}/${resource}`);
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set('pagina', String(page));
  url.searchParams.set('tamanho_da_pagina', String(PAGE_SIZE));

  let response;
  try {
    response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(`Tempo esgotado ao consultar ${resource}, página ${page}.`, { cause: error });
    }
    throw error;
  }
  if (!response.ok) throw new Error(`Transferegov respondeu com HTTP ${response.status}.`);

  const payload = await response.json();
  if (!Array.isArray(payload.data) || !Number.isInteger(payload.total_pages)) {
    throw new Error('A resposta do Transferegov veio em um formato inesperado.');
  }
  return payload;
};

const fetchAllPages = async (resource, filters) => {
  const firstPage = await requestPage(resource, filters, 1);
  if (firstPage.total_pages > 250) {
    throw new Error('O período selecionado excede o limite de consulta disponível.');
  }

  const rows = [...firstPage.data];
  for (let start = 2; start <= firstPage.total_pages; start += 5) {
    const pages = Array.from(
      { length: Math.min(5, firstPage.total_pages - start + 1) },
      (_, index) => start + index
    );
    const results = await Promise.all(pages.map(page => requestPage(resource, filters, page)));
    results.forEach(result => rows.push(...result.data));
  }
  return rows;
};

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR')
  .trim();

const loadYear = year => cached(`year:${year}`, async () => {
  const [plans, beneficiaries] = await Promise.all([
    fetchAllPages('planos-acao-especiais', {
      ano_emenda_parlamentar_plano_acao: year
    }),
    cached('beneficiaries', () => fetchAllPages('beneficiarios-especiais', {}))
  ]);
  const beneficiaryById = new Map(
    beneficiaries.map(beneficiary => [Number(beneficiary.id_beneficiario), beneficiary])
  );

  return plans.map(plan => {
    const beneficiary = beneficiaryById.get(Number(plan.id_beneficiario));
    const custeio = Number(plan.valor_custeio_plano_acao) || 0;
    const investment = Number(plan.valor_investimento_plano_acao) || 0;
    return {
      id: plan.id_plano_acao,
      codigo: plan.codigo_emenda_parlamentar_formatado_plano_acao || plan.codigo_plano_acao,
      numero: plan.numero_emenda_parlamentar_plano_acao,
      ano: plan.ano_emenda_parlamentar_plano_acao || plan.ano_plano_acao,
      parlamentar: plan.nome_parlamentar_emenda_plano_acao || 'Não informado',
      beneficiario: beneficiary?.nome_beneficiario || 'Beneficiário não identificado',
      cnpj: beneficiary?.cnpj_beneficiario || '',
      uf: beneficiary?.uf_beneficiario || '',
      objeto: plan.detalhamento_objeto || plan.nome_objeto || 'Objeto não informado',
      situacao: plan.situacao_plano_acao || 'Não informada',
      categoria: plan.categoria_despesa_plano_acao || '',
      custeio,
      investimento: investment,
      totalPrevisto: custeio + investment
    };
  });
});

module.exports = async (req, res) => {
  const currentYear = new Date().getUTCFullYear();
  const year = Number.parseInt(req.query.ano, 10);
  const page = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1);
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(req.query.limite, 10) || 25));
  const uf = String(req.query.uf || '').trim().toUpperCase();
  const parliamentarian = normalize(req.query.parlamentar);
  const query = normalize(req.query.busca);

  if (!Number.isInteger(year) || year < 2020 || year > currentYear) {
    return res.status(400).json({ erro: `Informe um ano entre 2020 e ${currentYear}.` });
  }
  if (uf && !validStates.has(uf)) {
    return res.status(400).json({ erro: 'Informe uma UF válida.' });
  }

  try {
    const allRows = await loadYear(year);
    const availableParliamentarians = [...new Set(allRows
      .filter(row => !uf || row.uf === uf)
      .map(row => row.parlamentar)
      .filter(name => name && normalize(name) !== 'nao informado'))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const filtered = allRows.filter(row => {
      if (uf && row.uf !== uf) return false;
      if (parliamentarian && normalize(row.parlamentar) !== parliamentarian) return false;
      if (!query) return true;
      return normalize([
        row.parlamentar, row.beneficiario, row.cnpj, row.codigo, row.numero,
        row.objeto, row.situacao
      ].join(' ')).includes(query);
    }).sort((a, b) => b.totalPrevisto - a.totalPrevisto);

    const totalPrevisto = filtered.reduce((sum, row) => sum + row.totalPrevisto, 0);
    const totalPages = Math.ceil(filtered.length / pageSize);
    const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

    return res.json({
      dados: rows,
      total: filtered.length,
      totalPrevisto,
      pagina: page,
      limite: pageSize,
      totalPaginas: totalPages,
      ano: year,
      uf: uf || null,
      parlamentares: availableParliamentarians
    });
  } catch (error) {
    console.error('[transferegov-emendas]', error.message);
    return res.status(502).json({
      erro: 'Não foi possível consultar as emendas Pix no Transferegov agora. Tente novamente em instantes.'
    });
  }
};
