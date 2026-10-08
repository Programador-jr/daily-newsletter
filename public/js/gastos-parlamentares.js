const CAMARA_DEPUTADOS_API='/api/camara-deputados';

const deputyPicker=document.getElementById('deputy-picker');
const deputySearch=document.getElementById('deputy-search');
const deputyToggle=document.getElementById('deputy-toggle');
const deputyHidden=document.getElementById('deputy-select');
const deputySelected=document.getElementById('deputy-selected');
const deputyOptions=document.getElementById('deputy-options');
const deputyOptionsList=document.getElementById('deputy-options-list');
const yearSelect=document.getElementById('expense-year');
const deputyUfSelect=document.getElementById('expense-uf');
const typeSelect=document.getElementById('expense-type');
const searchButton=document.getElementById('expense-search');
const statusEl=document.getElementById('expense-status');
const summaryEl=document.getElementById('expense-summary');
const tableWrap=document.getElementById('expense-table-wrap');
const tbody=document.getElementById('expense-table-body');
const expenseResultsAccordion=document.getElementById('expense-results-accordion');
const annualResultsAccordion=document.getElementById('annual-results-accordion');

const annualYear=document.getElementById('annual-year');
const annualUf=document.getElementById('annual-uf');
const annualSearch=document.getElementById('annual-search');
const annualStatus=document.getElementById('annual-status');
const annualSummary=document.getElementById('annual-summary');
const annualRankings=document.getElementById('annual-rankings');
const annualHighestList=document.getElementById('annual-highest-list');
const annualLowestList=document.getElementById('annual-lowest-list');
const annualTableWrap=document.getElementById('annual-table-wrap');
const annualTableBody=document.getElementById('annual-table-body');

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let expenseCache=[];
let deputies=[];
let deputiesPromise=null;
let searchTimer=null;
let searchRequest=0;

async function getJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json'}});
  let data=null;
  try{data=await response.json();}catch{/* Use the generic error below for a non-JSON response. */}
  if(!response.ok){
    throw new Error(data?.erro||data?.message||'Não foi possível consultar os dados oficiais da Câmara.');
  }
  return data;
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function formatDate(value){
  const raw=String(value||'').split('T')[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(raw)?raw.split('-').reverse().join('/'): '—';
}

function expenseValue(item){
  return Number(item.valorLiquido??item.vlrLiquido)||0;
}

function pageCount(response){
  const lastLink=(response?.links||[]).find(link=>['last','ultima'].includes(normalizeSearch(link.rel)));
  if(lastLink?.href){
    let lastPage=NaN;
    try{
      lastPage=Number(new URL(lastLink.href,window.location.origin).searchParams.get('pagina'));
    }catch{/* Fall back to the pagination metadata when the URL is malformed. */}
    if(Number.isInteger(lastPage)&&lastPage>0)return lastPage;
  }
  const pagination=response?.paginacao||{};
  const explicit=Number(pagination.totalPaginas);
  if(Number.isInteger(explicit)&&explicit>0)return explicit;
  const total=Number(pagination.totalRegistros);
  const perPage=Number(pagination.itensPorPagina)||100;
  return Number.isFinite(total)&&total>0?Math.ceil(total/perPage):1;
}

function normalizeSearch(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim();
}

function expenseType(item){
  return String(item.tipoDespesa||item.txtDescricao||item.descricaoTipoDespesa||'').trim();
}

function setStatus(text){statusEl.textContent=text;}
function setAnnualStatus(text){annualStatus.textContent=text;}

function deputyLabel(deputy){
  return deputy.nome+' — '+(deputy.siglaPartido||'Sem partido')+'/'+(deputy.siglaUf||'—');
}

function openDeputyOptions(){
  deputyOptions.hidden=false;
  deputyToggle.setAttribute('aria-expanded','true');
  deputySearch.focus();
  if(!deputies.length) searchDeputies('');
}

function closeDeputyOptions(){
  deputyOptions.hidden=true;
  deputyToggle.setAttribute('aria-expanded','false');
}

function renderDeputyOptions(items){
  deputyOptionsList.innerHTML='';
  if(!items.length){
    deputyOptionsList.innerHTML='<div class="deputy-empty">Nenhum deputado encontrado.</div>';
    return;
  }

  items.forEach(deputy=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='deputy-option';
    button.setAttribute('role','option');
    button.setAttribute('aria-selected',String(String(deputy.id)===deputyHidden.value));
    button.dataset.id=deputy.id;
    button.innerHTML='<span class="deputy-option-copy"><strong>'+escapeHtml(deputy.nome)+'</strong><span>'+escapeHtml((deputy.siglaPartido||'Sem partido')+' · '+(deputy.siglaUf||'—'))+'</span></span><i class="fas fa-check deputy-option-check" aria-hidden="true"></i>';
    deputyOptionsList.appendChild(button);
  });
}

async function searchDeputies(query){
  const requestId=++searchRequest;
  deputyOptionsList.innerHTML='<div class="deputy-empty">Buscando deputados...</div>';

  try{
    if(!deputies.length){
      if(!deputiesPromise)deputiesPromise=(async()=>{
        const firstParams=new URLSearchParams({itens:'100',pagina:'1',ordem:'ASC',ordenarPor:'nome'});
        const first=await getJson(CAMARA_DEPUTADOS_API+'?'+firstParams);
        const totalPages=pageCount(first);
        const rest=await Promise.all(Array.from({length:totalPages-1},(_,index)=>{
          const params=new URLSearchParams({itens:'100',pagina:String(index+2),ordem:'ASC',ordenarPor:'nome'});
          return getJson(CAMARA_DEPUTADOS_API+'?'+params);
        }));
        return [...(first.dados||[]),...rest.flatMap(page=>page.dados||[])];
      })();
      try{deputies=await deputiesPromise;}catch(error){deputiesPromise=null;throw error;}
    }
    if(requestId!==searchRequest)return;
    const terms=normalizeSearch(query).split(/\s+/).filter(Boolean);
    const results=deputies.filter(deputy=>
      (!deputyUfSelect.value||deputy.siglaUf===deputyUfSelect.value)&&
      terms.every(term=>normalizeSearch([deputy.nome,deputy.siglaPartido,deputy.siglaUf].join(' ')).includes(term))
    );
    renderDeputyOptions(results.slice(0,100));
  }catch(error){
    if(requestId!==searchRequest)return;
    deputyOptionsList.innerHTML='<div class="deputy-empty">'+escapeHtml(error.message)+'</div>';
    window.searchFeedback?.error('deputy-list',error.message);
  }
}

function selectDeputy(deputy){
  deputyHidden.value=String(deputy.id);
  deputySelected.innerHTML='<strong>'+escapeHtml(deputy.nome)+'</strong><small>'+escapeHtml((deputy.siglaPartido||'Sem partido')+' · '+(deputy.siglaUf||'—'))+'</small>';
  deputyToggle.setAttribute('aria-label','Deputado selecionado: '+deputyLabel(deputy)+'. Alterar seleção');
  deputySearch.value='';
  closeDeputyOptions();
  setStatus('Deputado selecionado. Clique em Consultar.');
}

function fillTypes(items){
  const selected=typeSelect.value;
  const types=[...new Set(items.map(expenseType).filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,'pt-BR'));

  typeSelect.innerHTML='<option value="">Todas as categorias</option>'+
    types.map(type=>'<option value="'+escapeHtml(type)+'">'+escapeHtml(type)+'</option>').join('');
  if(types.includes(selected))typeSelect.value=selected;
}

function renderExpenses(items){
  const selected=typeSelect.value;
  const filtered=selected?items.filter(item=>expenseType(item)===selected):items;
  const total=filtered.reduce((sum,item)=>sum+expenseValue(item),0);

  summaryEl.hidden=false;
  summaryEl.innerHTML=
    '<div><span>Registros</span><strong>'+filtered.length+'</strong></div>'+
    '<div><span>Total líquido</span><strong>'+money.format(total)+'</strong></div>'+
    '<div><span>Ano</span><strong>'+yearSelect.value+'</strong></div>';

  tbody.innerHTML=filtered.length?filtered.map(item=>
    '<tr><td>'+formatDate(item.dataDocumento)+'</td>'+
    '<td>'+escapeHtml(expenseType(item)||'Não informado')+'</td>'+
    '<td>'+escapeHtml(item.nomeFornecedor||'Não informado')+'</td>'+
    '<td>'+escapeHtml(item.numDocumento||'—')+'</td>'+
    '<td>'+money.format(expenseValue(item))+'</td></tr>'
  ).join(''):'<tr><td colspan="5">Nenhuma despesa encontrada para os filtros selecionados.</td></tr>';

  tableWrap.hidden=false;
  expenseResultsAccordion.open=true;
  expenseResultsAccordion.hidden=false;
}

async function loadExpenses(){
  const id=deputyHidden.value;
  if(!id){
    setStatus('Selecione um deputado antes de consultar.');
    window.searchFeedback?.error('expense', 'Selecione um deputado antes de iniciar a consulta.');
    openDeputyOptions();
    return;
  }

  searchButton.disabled=true;
  window.searchFeedback?.loading('expense', 'Carregando as despesas do parlamentar.');
  summaryEl.hidden=true;
  tableWrap.hidden=true;
  expenseResultsAccordion.hidden=true;
  typeSelect.innerHTML='<option value="">Todas as categorias</option>';
  setStatus('Consultando os registros anuais oficiais de '+yearSelect.value+'...');

  try{
    let source='API de Dados Abertos';
    try{
      const params=new URLSearchParams({ano:yearSelect.value,id,itens:'100',pagina:'1'});
      const first=await getJson('/api/camara-despesas?'+params);
      const pages=pageCount(first);
      const rest=await Promise.all(Array.from({length:pages-1},(_,index)=>{
        const pageParams=new URLSearchParams({ano:yearSelect.value,id,itens:'100',pagina:String(index+2)});
        return getJson('/api/camara-despesas?'+pageParams);
      }));
      expenseCache=[...(first.dados||[]),...rest.flatMap(page=>page.dados||[])];
    }catch{
      expenseCache=[];
      source='arquivo anual da CEAP';
    }

    if(!expenseCache.length){
      const fallbackParams=new URLSearchParams({ano:yearSelect.value,id});
      const fallback=await getJson('/api/camara-ceap?'+fallbackParams);
      expenseCache=Array.isArray(fallback.despesas)?fallback.despesas:[];
      source='arquivo anual da CEAP';
    }

    expenseCache.sort((a,b)=>String(b.dataDocumento||'').localeCompare(String(a.dataDocumento||'')));
    fillTypes(expenseCache);
    renderExpenses(expenseCache);
    setStatus(expenseCache.length?
      expenseCache.length+' registros carregados da '+source+' em '+yearSelect.value+'.':
      'Nenhuma despesa registrada para este parlamentar em '+yearSelect.value+'.');
    window.searchFeedback?.clear('expense');
  }catch(error){
    expenseCache=[];
    summaryEl.hidden=true;
    tableWrap.hidden=true;
    expenseResultsAccordion.hidden=true;
    setStatus(error.message);
    window.searchFeedback?.error('expense', error.message);
  }finally{
    searchButton.disabled=false;
  }
}

function renderAnnualRows(rows){
  annualTableBody.innerHTML=rows.length?rows.map(row=>
    '<tr><td>'+escapeHtml(row.nome)+'</td>'+
    '<td>'+escapeHtml(row.partido||'—')+'</td>'+
    '<td>'+escapeHtml(row.uf||'—')+'</td>'+
    '<td>'+money.format(Number(row.total)||0)+'</td></tr>'
  ).join(''):'<tr><td colspan="4">Nenhum registro encontrado para os filtros selecionados.</td></tr>';

  annualTableWrap.hidden=false;
}

expenseResultsAccordion.addEventListener('toggle',()=>{
  expenseResultsAccordion.querySelector(':scope > summary').textContent=
    expenseResultsAccordion.open?'Recolher resultados':'Expandir resultados';
});

annualResultsAccordion.addEventListener('toggle',()=>{
  annualResultsAccordion.querySelector(':scope > summary').textContent=
    annualResultsAccordion.open?'Recolher dados anuais':'Expandir dados anuais';
});

function renderAnnualRankings(rows){
  const ordered=rows.slice().sort((a,b)=>(Number(b.total)||0)-(Number(a.total)||0));
  const highest=ordered.slice(0,10);
  const lowest=ordered.slice(-10).reverse();
  const render=items=>items.map(row=>
    '<li><span class="annual-ranking-name">'+escapeHtml(row.nome)+
    '<span class="annual-ranking-meta">'+escapeHtml((row.partido||'Sem partido')+'/'+(row.uf||'—'))+'</span></span>'+
    '<strong class="annual-ranking-value">'+money.format(Number(row.total)||0)+'</strong></li>'
  ).join('');
  annualHighestList.innerHTML=render(highest);
  annualLowestList.innerHTML=render(lowest);
  annualRankings.hidden=rows.length===0;
}

async function loadAnnualData(){
  annualSearch.disabled=true;
  window.searchFeedback?.loading('annual-expenses', 'Carregando os dados anuais da CEAP.');
  annualTableWrap.hidden=true;
  annualSummary.hidden=true;
  annualRankings.hidden=true;
  annualResultsAccordion.hidden=true;
  setAnnualStatus('Carregando os dados anuais oficiais da Câmara...');

  try{
    const params=new URLSearchParams({ano:annualYear.value});
    if(annualUf.value) params.set('uf',annualUf.value);

    const data=await getJson('/api/camara-ceap?'+params);
    const rows=Array.isArray(data.deputados)?data.deputados:[];
    const total=Number(data.total)||0;

    annualSummary.hidden=false;
    annualSummary.innerHTML=
      '<div><span>Parlamentares com registros</span><strong>'+rows.length+'</strong></div>'+
      '<div><span>Total CEAP filtrado</span><strong>'+money.format(total)+'</strong></div>'+
      '<div><span>Período</span><strong>'+annualYear.value+'</strong></div>';

    renderAnnualRows(rows);
    renderAnnualRankings(rows);
    annualResultsAccordion.open=true;
    annualResultsAccordion.hidden=false;
    setAnnualStatus(rows.length+' parlamentares encontrados no período anual selecionado.');
    window.searchFeedback?.clear('annual-expenses');
  }catch(error){
    setAnnualStatus(error.message);
    window.searchFeedback?.error('annual-expenses', error.message);
  }finally{
    annualSearch.disabled=false;
  }
}

deputyToggle.addEventListener('click',()=>{
  if(deputyOptions.hidden) openDeputyOptions();
  else closeDeputyOptions();
});

deputySearch.addEventListener('input',()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>searchDeputies(deputySearch.value),250);
});

deputySearch.addEventListener('keydown',event=>{
  if(event.key==='Escape') closeDeputyOptions();
  if(event.key==='ArrowDown'){
    const firstOption=deputyOptionsList.querySelector('.deputy-option');
    if(firstOption){event.preventDefault();firstOption.focus();}
  }
});

deputyOptionsList.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  const options=[...deputyOptionsList.querySelectorAll('.deputy-option')];
  const current=options.indexOf(document.activeElement);
  const next=event.key==='ArrowDown'?Math.min(current+1,options.length-1):Math.max(current-1,0);
  if(options[next]){event.preventDefault();options[next].focus();}
});

deputyOptionsList.addEventListener('click',event=>{
  const option=event.target.closest('.deputy-option');
  if(!option)return;
  const deputy=deputies.find(item=>String(item.id)===option.dataset.id);
  if(deputy) selectDeputy(deputy);
});

deputyUfSelect.addEventListener('change',()=>{
  const selected=deputies.find(deputy=>String(deputy.id)===deputyHidden.value);
  if(selected&&deputyUfSelect.value&&selected.siglaUf!==deputyUfSelect.value){
    deputyHidden.value='';
    deputySelected.textContent='Selecione um deputado';
    deputyToggle.setAttribute('aria-label','Selecionar deputado');
    setStatus('O estado mudou. Selecione um deputado da UF escolhida.');
  }
  searchDeputies(deputySearch.value);
});

document.addEventListener('click',event=>{
  if(!deputyPicker.contains(event.target)) closeDeputyOptions();
});

typeSelect.addEventListener('change',()=>renderExpenses(expenseCache));
searchButton.addEventListener('click',loadExpenses);
annualSearch?.addEventListener('click',loadAnnualData);

searchDeputies('');
