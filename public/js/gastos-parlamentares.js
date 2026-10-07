const CAMARA_DEPUTADOS_API='/api/camara-deputados';

const deputyPicker=document.getElementById('deputy-picker');
const deputySearch=document.getElementById('deputy-search');
const deputyToggle=document.getElementById('deputy-toggle');
const deputyHidden=document.getElementById('deputy-select');
const deputySelected=document.getElementById('deputy-selected');
const deputyOptions=document.getElementById('deputy-options');
const deputyOptionsList=document.getElementById('deputy-options-list');
const yearSelect=document.getElementById('expense-year');
const typeSelect=document.getElementById('expense-type');
const searchButton=document.getElementById('expense-search');
const statusEl=document.getElementById('expense-status');
const summaryEl=document.getElementById('expense-summary');
const tableWrap=document.getElementById('expense-table-wrap');
const tbody=document.getElementById('expense-table-body');

const annualYear=document.getElementById('annual-year');
const annualUf=document.getElementById('annual-uf');
const annualSearch=document.getElementById('annual-search');
const annualStatus=document.getElementById('annual-status');
const annualSummary=document.getElementById('annual-summary');
const annualTableWrap=document.getElementById('annual-table-wrap');
const annualTableBody=document.getElementById('annual-table-body');

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let expenseCache=[];
let deputies=[];
let searchTimer=null;
let searchRequest=0;

async function getJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json'}});
  let data=null;
  try{data=await response.json();}catch{}
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
    button.innerHTML='<strong>'+escapeHtml(deputy.nome)+'</strong><span>'+escapeHtml((deputy.siglaPartido||'Sem partido')+'/'+(deputy.siglaUf||'—'))+'</span>';
    deputyOptionsList.appendChild(button);
  });
}

async function searchDeputies(query){
  const requestId=++searchRequest;
  const params=new URLSearchParams({
    itens:'100',
    pagina:'1',
    ordem:'ASC',
    ordenarPor:'nome'
  });
  if(query.trim()) params.set('nome',query.trim());

  deputyOptionsList.innerHTML='<div class="deputy-empty">Buscando deputados...</div>';

  try{
    const data=await getJson(CAMARA_DEPUTADOS_API+'?'+params);
    if(requestId!==searchRequest)return;
    deputies=data.dados||[];
    renderDeputyOptions(deputies);
  }catch(error){
    if(requestId!==searchRequest)return;
    deputyOptionsList.innerHTML='<div class="deputy-empty">'+escapeHtml(error.message)+'</div>';
  }
}

function selectDeputy(deputy){
  deputyHidden.value=String(deputy.id);
  deputySelected.textContent=deputyLabel(deputy);
  deputySearch.value='';
  closeDeputyOptions();
  setStatus('Deputado selecionado. Clique em Consultar.');
}

function fillTypes(items){
  const types=[...new Set(items.map(item=>item.tipoDespesa).filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,'pt-BR'));

  typeSelect.innerHTML='<option value="">Todas as categorias</option>'+
    types.map(type=>'<option value="'+escapeHtml(type)+'">'+escapeHtml(type)+'</option>').join('');
}

function renderExpenses(items){
  const selected=typeSelect.value;
  const filtered=selected?items.filter(item=>item.tipoDespesa===selected):items;
  const total=filtered.reduce((sum,item)=>sum+(Number(item.vlrLiquido)||0),0);

  summaryEl.hidden=false;
  summaryEl.innerHTML=
    '<div><span>Registros</span><strong>'+filtered.length+'</strong></div>'+
    '<div><span>Total líquido</span><strong>'+money.format(total)+'</strong></div>'+
    '<div><span>Ano</span><strong>'+yearSelect.value+'</strong></div>';

  tbody.innerHTML=filtered.length?filtered.map(item=>
    '<tr><td>'+formatDate(item.dataDocumento)+'</td>'+
    '<td>'+escapeHtml(item.tipoDespesa||'Não informado')+'</td>'+
    '<td>'+escapeHtml(item.nomeFornecedor||'Não informado')+'</td>'+
    '<td>'+escapeHtml(item.numDocumento||'—')+'</td>'+
    '<td>'+money.format(Number(item.vlrLiquido)||0)+'</td></tr>'
  ).join(''):'<tr><td colspan="5">Nenhuma despesa encontrada para os filtros selecionados.</td></tr>';

  tableWrap.hidden=false;
}

async function loadExpenses(){
  const id=deputyHidden.value;
  if(!id){
    setStatus('Selecione um deputado antes de consultar.');
    openDeputyOptions();
    return;
  }

  searchButton.disabled=true;
  summaryEl.hidden=true;
  tableWrap.hidden=true;
  typeSelect.innerHTML='<option value="">Todas as categorias</option>';
  setStatus('Consultando os registros anuais oficiais de '+yearSelect.value+'...');

  try{
    const params=new URLSearchParams({ano:yearSelect.value,id});
    const data=await getJson('/api/camara-ceap?'+params);
    expenseCache=Array.isArray(data.despesas)?data.despesas:[];
    fillTypes(expenseCache);
    renderExpenses(expenseCache);
    setStatus(expenseCache.length?
      expenseCache.length+' registros carregados da CEAP em '+yearSelect.value+'.':
      'Nenhuma despesa registrada para este parlamentar em '+yearSelect.value+'.');
  }catch(error){
    expenseCache=[];
    summaryEl.hidden=true;
    tableWrap.hidden=true;
    setStatus(error.message);
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

async function loadAnnualData(){
  annualSearch.disabled=true;
  annualTableWrap.hidden=true;
  annualSummary.hidden=true;
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
    setAnnualStatus(rows.length+' parlamentares encontrados no período anual selecionado.');
  }catch(error){
    setAnnualStatus(error.message);
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
});

deputyOptionsList.addEventListener('click',event=>{
  const option=event.target.closest('.deputy-option');
  if(!option)return;
  const deputy=deputies.find(item=>String(item.id)===option.dataset.id);
  if(deputy) selectDeputy(deputy);
});

document.addEventListener('click',event=>{
  if(!deputyPicker.contains(event.target)) closeDeputyOptions();
});

typeSelect.addEventListener('change',()=>renderExpenses(expenseCache));
searchButton.addEventListener('click',loadExpenses);
annualSearch?.addEventListener('click',loadAnnualData);

searchDeputies('');
