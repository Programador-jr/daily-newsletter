(() => {
  const yearSelect = document.getElementById('pix-year');
  const stateSelect = document.getElementById('pix-uf');
  const parliamentarianSelect = document.getElementById('pix-parliamentarian');
  const termInput = document.getElementById('pix-search-term');
  const searchButton = document.getElementById('pix-search');
  const status = document.getElementById('pix-status');
  const summary = document.getElementById('pix-summary');
  const count = document.getElementById('pix-count');
  const total = document.getElementById('pix-total');
  const tableWrap = document.getElementById('pix-table-wrap');
  const resultsAccordion = document.getElementById('pix-results-accordion');
  const tableBody = document.getElementById('pix-table-body');
  const pagination = document.getElementById('pix-pagination');
  const previousButton = document.getElementById('pix-previous');
  const nextButton = document.getElementById('pix-next');
  const pageLabel = document.getElementById('pix-page-label');

  if (!yearSelect || !searchButton || !status || !tableBody) return;

  const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  let currentPage = 1;
  let latestRequest = 0;
  let availableParliamentarians = [];

  const updateParliamentarians = names => {
    if (!parliamentarianSelect) return;
    const selected = parliamentarianSelect.value;
    availableParliamentarians = Array.isArray(names) ? names : [];
    parliamentarianSelect.replaceChildren(new Option('Todos os parlamentares', ''));
    availableParliamentarians.forEach(name => {
      parliamentarianSelect.add(new Option(name, name));
    });
    parliamentarianSelect.disabled = availableParliamentarians.length === 0;
    parliamentarianSelect.value = availableParliamentarians.includes(selected) ? selected : '';
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const renderRows = rows => {
    tableBody.innerHTML = rows.length
      ? rows.map(row => `<tr>
          <td data-label="Parlamentar">${escapeHtml(row.parlamentar)}</td>
          <td data-label="Beneficiário">${escapeHtml(row.beneficiario)}${row.cnpj ? `<small>CNPJ ${escapeHtml(row.cnpj)}</small>` : ''}</td>
          <td data-label="UF">${escapeHtml(row.uf || '—')}</td>
          <td data-label="Emenda">${escapeHtml(row.codigo || row.numero || '—')}</td>
          <td data-label="Objeto">${escapeHtml(row.objeto)}</td>
          <td data-label="Situação"><span class="pix-situation">${escapeHtml(row.situacao)}</span></td>
          <td data-label="Valor previsto" class="pix-value-cell">${currency.format(Number(row.totalPrevisto) || 0)}<small>Custeio ${currency.format(Number(row.custeio) || 0)} · Investimento ${currency.format(Number(row.investimento) || 0)}</small></td>
        </tr>`).join('')
      : '<tr><td colspan="7">Nenhum plano de ação encontrado com esses filtros.</td></tr>';
  };

  const search = async (page = 1) => {
    const requestId = ++latestRequest;
    currentPage = page;
    searchButton.disabled = true;
    status.textContent = 'Consultando a base pública do Transferegov…';
    window.searchFeedback?.loading('pix', 'Buscando planos de ação no Transferegov.');
    summary.hidden = true;
    tableWrap.hidden = true;
    pagination.hidden = true;
    resultsAccordion.hidden = true;

    const params = new URLSearchParams({
      ano: yearSelect.value,
      pagina: String(page)
    });
    if (stateSelect?.value) params.set('uf', stateSelect.value);
    if (parliamentarianSelect?.value) params.set('parlamentar', parliamentarianSelect.value);
    if (termInput?.value.trim()) params.set('busca', termInput.value.trim());

    try {
      const response = await fetch(`/api/transferegov-emendas?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Falha ao consultar as emendas Pix.');
      if (requestId !== latestRequest) return;

      updateParliamentarians(data.parlamentares);
      renderRows(Array.isArray(data.dados) ? data.dados : []);
      count.textContent = `${Number(data.total || 0).toLocaleString('pt-BR')} planos de ação encontrados`;
      total.textContent = `Valor previsto no filtro: ${currency.format(Number(data.totalPrevisto) || 0)}`;
      summary.hidden = false;
      tableWrap.hidden = false;
      resultsAccordion.open = true;
      resultsAccordion.hidden = false;

      const totalPages = Number(data.totalPaginas) || 0;
      pagination.hidden = totalPages <= 1;
      pageLabel.textContent = `Página ${data.pagina} de ${totalPages}`;
      previousButton.disabled = data.pagina <= 1;
      nextButton.disabled = data.pagina >= totalPages;
      status.textContent = data.total
        ? 'Resultados ordenados pelo maior valor previsto no plano.'
        : 'A consulta não encontrou registros para os filtros selecionados.';
      window.searchFeedback?.clear('pix');
    } catch (error) {
      if (requestId !== latestRequest) return;
      status.textContent = error.message || 'Não foi possível consultar os dados agora.';
      window.searchFeedback?.error('pix', status.textContent);
      tableBody.replaceChildren();
    } finally {
      if (requestId === latestRequest) searchButton.disabled = false;
    }
  };

  resultsAccordion.addEventListener('toggle', () => {
    resultsAccordion.querySelector(':scope > summary').textContent =
      resultsAccordion.open ? 'Recolher resultados' : 'Expandir resultados';
  });

  searchButton.addEventListener('click', () => search(1));
  stateSelect?.addEventListener('change', () => {
    updateParliamentarians([]);
    search(1);
  });
  yearSelect.addEventListener('change', () => {
    updateParliamentarians([]);
    search(1);
  });
  termInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') search(1);
  });
  previousButton?.addEventListener('click', () => {
    if (currentPage > 1) search(currentPage - 1);
  });
  nextButton?.addEventListener('click', () => search(currentPage + 1));
})();
