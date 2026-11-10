const CAMARA_DEPUTADOS_API='/api/camara-deputados';

// Os <select> da página viram seletores pesquisáveis (option-picker.js), como no Impostômetro.
window.KingsOptionPicker?.enhance(document.getElementById('main'));

const deputySelect=document.getElementById('deputy-select');
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

const expenseInsights=document.getElementById('expense-insights');
const expenseMonthChart=document.getElementById('expense-month-chart');
const expenseTypeChart=document.getElementById('expense-type-chart');
const expenseMonthClear=document.getElementById('expense-month-clear');
const expenseMonthReadout=document.getElementById('expense-month-readout');
let expenseMonthTotals=Array(12).fill(0);
const annualPartyBox=document.getElementById('annual-party-box');
const annualPartyChart=document.getElementById('annual-party-chart');
const annualPartyMore=document.getElementById('annual-party-more');
const annualTableTools=document.getElementById('annual-table-tools');
const annualFilter=document.getElementById('annual-filter');
const annualFilterCount=document.getElementById('annual-filter-count');

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const compactNumber=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
const MONTHS=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MONTHS_FULL=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
let expenseCache=[];
let expenseMonth=null;
let annualRows=[];
// Ordenação das tabelas (os cabeçalhos são botões).
const expenseSort={key:'date',dir:'desc'};
const annualSort={key:'name',dir:'asc'};
let partyMetric='total';
let partyExpanded=false;
let deputies=[];
let deputiesPromise=null;

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

function compactMoney(value){
  const scales=[[1e9,'bi'],[1e6,'mi'],[1e3,'mil']];
  const found=scales.find(([scale])=>Math.abs(value)>=scale);
  return found?'R$ '+compactNumber.format(value/found[0])+' '+found[1]:money.format(value);
}

function expenseMonthIndex(item){
  const month=Number(item.mes);
  if(Number.isInteger(month)&&month>=1&&month<=12)return month-1;
  const match=String(item.dataDocumento||'').match(/^\d{4}-(\d{2})/);
  return match?Number(match[1])-1:null;
}

function statsHtml(items){
  return items.map(([label,value,note,main])=>
    '<div'+(main?' class="is-main"':'')+'><dt>'+escapeHtml(label)+'</dt><dd>'+escapeHtml(value)+'</dd>'+
    (note?'<dd class="lab-stat-note">'+escapeHtml(note)+'</dd>':'')+'</div>'
  ).join('');
}

// Cabeçalho dos painéis de resultado: contagem e texto da ação (Recolher/Expandir).
function setResultsCount(details,text){
  const count=details?.querySelector('[data-results-count]');
  if(count)count.textContent=text;
}

function syncResultsAction(details){
  const action=details?.querySelector('[data-results-action]');
  const state=details?.dataset.accordionState;
  const open=state?state==='open':details?.open;
  if(action)action.textContent=open?'Recolher':'Expandir';
}

function compareText(a,b){
  return String(a||'').localeCompare(String(b||''),'pt-BR',{sensitivity:'base'});
}

function sortRows(rows,state,getters){
  const getter=getters[state.key];
  const direction=state.dir==='asc'?1:-1;
  return rows.slice().sort((a,b)=>{
    const left=getter(a),right=getter(b);
    const result=typeof left==='number'&&typeof right==='number'?left-right:compareText(left,right);
    return result*direction;
  });
}

function paintSortHeaders(table,state){
  table?.querySelectorAll('th[aria-sort]').forEach(th=>{
    const key=th.querySelector('[data-sort]')?.dataset.sort;
    th.setAttribute('aria-sort',key===state.key?(state.dir==='asc'?'ascending':'descending'):'none');
  });
}

function bindSortHeaders(table,state,defaults,render){
  table?.addEventListener('click',event=>{
    const button=event.target.closest('[data-sort]');
    if(!button)return;
    const key=button.dataset.sort;
    state.dir=state.key===key?(state.dir==='asc'?'desc':'asc'):(defaults[key]||'asc');
    state.key=key;
    render();
    table.querySelector('[data-sort="'+key+'"]')?.focus();
  });
}

const EXPENSE_SORT={
  date:item=>String(item.dataDocumento||''),
  type:item=>expenseType(item),
  supplier:item=>String(item.nomeFornecedor||''),
  value:item=>expenseValue(item)
};
const ANNUAL_SORT={
  name:row=>row.nome,
  party:row=>row.partido||'',
  uf:row=>row.uf||'',
  total:row=>Number(row.total)||0
};

function median(values){
  if(!values.length)return 0;
  const sorted=values.slice().sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}

function normalizeSearch(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim();
}

function expenseType(item){
  return String(item.tipoDespesa||item.txtDescricao||item.descricaoTipoDespesa||'').trim();
}

// Linha de status com ícone: info, loading, done ou error.
const STATUS_ICONS={info:'fa-circle-info',loading:'fa-clock',done:'fa-check',error:'fa-circle-exclamation'};
function paintStatus(element,text,state='info'){
  if(!element)return;
  element.dataset.state=state;
  const icon=element.querySelector('i');
  const label=element.querySelector('span');
  if(icon)icon.className='fas '+(STATUS_ICONS[state]||STATUS_ICONS.info);
  if(label)label.textContent=text;
  else element.textContent=text;
}
function setStatus(text,state){paintStatus(statusEl,text,state);}
function setAnnualStatus(text,state){paintStatus(annualStatus,text,state);}

function loadDeputies(){
  if(!deputiesPromise)deputiesPromise=(async()=>{
    const firstParams=new URLSearchParams({itens:'100',pagina:'1',ordem:'ASC',ordenarPor:'nome'});
    const first=await getJson(CAMARA_DEPUTADOS_API+'?'+firstParams);
    const totalPages=pageCount(first);
    const rest=await Promise.all(Array.from({length:totalPages-1},(_,index)=>{
      const params=new URLSearchParams({itens:'100',pagina:String(index+2),ordem:'ASC',ordenarPor:'nome'});
      return getJson(CAMARA_DEPUTADOS_API+'?'+params);
    }));
    return [...(first.dados||[]),...rest.flatMap(page=>page.dados||[])];
  })().catch(error=>{deputiesPromise=null;throw error;});
  return deputiesPromise;
}

// Preenche o <select> de deputados respeitando a UF escolhida; partido e UF
// aparecem como etiqueta e também entram na busca do seletor.
function fillDeputySelect(){
  const selected=deputySelect.value;
  const visible=deputies.filter(deputy=>!deputyUfSelect.value||deputy.siglaUf===deputyUfSelect.value);
  const placeholder=new Option(visible.length?'Selecione um deputado':'Nenhum deputado nesta UF','');
  deputySelect.replaceChildren(placeholder,...visible.map(deputy=>{
    const option=new Option(deputy.nome,String(deputy.id));
    option.dataset.meta=(deputy.siglaPartido||'Sem partido')+' · '+(deputy.siglaUf||'—');
    return option;
  }));
  const keep=visible.some(deputy=>String(deputy.id)===selected);
  deputySelect.value=keep?selected:'';
  deputySelect.disabled=!visible.length;
  return keep||!selected;
}

async function initDeputies(){
  try{
    deputies=await loadDeputies();
    fillDeputySelect();
  }catch(error){
    deputySelect.replaceChildren(new Option('Lista indisponível',''));
    deputySelect.disabled=true;
    setStatus(error.message,'error');
    window.searchFeedback?.error('deputy-list',error.message);
  }
}

function openDeputyPicker(){
  deputySelect.closest('.picker-select')?.querySelector('.picker-trigger')?.click();
}

function fillTypes(items){
  const selected=typeSelect.value;
  const types=[...new Set(items.map(expenseType).filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,'pt-BR'));

  typeSelect.innerHTML='<option value="">Todas as categorias</option>'+
    types.map(type=>'<option value="'+escapeHtml(type)+'">'+escapeHtml(type)+'</option>').join('');
  if(types.includes(selected))typeSelect.value=selected;
}

function renderExpenseCharts(items){
  const selectedType=typeSelect.value;
  const byType=selectedType?items.filter(item=>expenseType(item)===selectedType):items;
  const months=Array(12).fill(0);
  byType.forEach(item=>{
    const month=expenseMonthIndex(item);
    if(month!==null)months[month]+=expenseValue(item);
  });
  const maxMonth=Math.max(1,...months);
  expenseMonthChart.innerHTML=months.map((value,index)=>
    '<button type="button" class="ceap-month" data-month="'+index+'" aria-pressed="'+String(expenseMonth===index)+'"'+
    ' aria-label="'+MONTHS_FULL[index]+': '+escapeHtml(money.format(value))+'"'+(value?'':' disabled')+'>'+
    '<span class="ceap-month-bar"><span style="height:'+(value/maxMonth*100).toFixed(2)+'%"></span></span>'+
    '<span class="ceap-month-label">'+MONTHS[index]+'</span></button>'
  ).join('');
  expenseMonthClear.hidden=expenseMonth===null;
  expenseMonthTotals=months;
  showMonthReadout(null);

  const byMonth=expenseMonth===null?items:items.filter(item=>expenseMonthIndex(item)===expenseMonth);
  const types=new Map();
  byMonth.forEach(item=>{
    const type=expenseType(item)||'Não informado';
    types.set(type,(types.get(type)||0)+expenseValue(item));
  });
  const ranked=[...types.entries()].sort((a,b)=>b[1]-a[1]);
  const totalTypes=ranked.reduce((sum,[,value])=>sum+value,0)||1;
  const maxType=Math.max(1,...ranked.map(([,value])=>value));
  expenseTypeChart.innerHTML=ranked.length?ranked.map(([type,value])=>
    '<button type="button" class="ceap-bar" data-type="'+escapeHtml(type)+'" aria-pressed="'+String(type===selectedType)+'">'+
    '<span class="ceap-bar-copy"><span class="ceap-bar-name">'+escapeHtml(type)+'</span><span class="ceap-bar-value">'+escapeHtml(money.format(value))+' · '+(value/totalTypes*100).toFixed(1).replace('.',',')+'%</span></span>'+
    '<span class="ceap-bar-track"><span style="width:'+(value/maxType*100).toFixed(2)+'%"></span></span></button>'
  ).join(''):'<p class="lab-note">Sem despesas neste recorte.</p>';
}

// Linha de leitura do gráfico mensal: mês em foco, mês filtrado ou o maior mês do ano.
function showMonthReadout(index){
  if(!expenseMonthReadout)return;
  const months=expenseMonthTotals;
  const target=index??expenseMonth;
  if(target!==null&&target!==undefined){
    expenseMonthReadout.innerHTML='<strong>'+MONTHS_FULL[target]+'</strong> · '+escapeHtml(money.format(months[target]));
    return;
  }
  const peak=months.indexOf(Math.max(...months));
  const active=months.filter(Boolean).length;
  expenseMonthReadout.innerHTML=months[peak]
    ?'Maior mês: <strong>'+MONTHS_FULL[peak]+'</strong> · '+escapeHtml(money.format(months[peak]))+' · '+active+(active===1?' mês com gastos':' meses com gastos')
    :'Sem gastos registrados no período.';
}

function renderExpenses(items){
  const selected=typeSelect.value;
  const filtered=items.filter(item=>(!selected||expenseType(item)===selected)&&(expenseMonth===null||expenseMonthIndex(item)===expenseMonth));
  const total=filtered.reduce((sum,item)=>sum+expenseValue(item),0);
  const activeMonths=new Set(filtered.map(expenseMonthIndex).filter(month=>month!==null)).size;
  const largest=filtered.reduce((best,item)=>expenseValue(item)>expenseValue(best||{})?item:best,null);
  const scope=(expenseMonth===null?yearSelect.value:MONTHS_FULL[expenseMonth]+' de '+yearSelect.value)+(selected?' · '+selected:'');

  summaryEl.hidden=false;
  summaryEl.innerHTML=statsHtml([
    ['Total líquido',money.format(total),scope,true],
    ['Registros',String(filtered.length),filtered.length===1?'documento':'documentos'],
    ['Média por mês com gasto',activeMonths?money.format(total/activeMonths):'—',activeMonths+(activeMonths===1?' mês com registros':' meses com registros')],
    ['Maior despesa',largest?money.format(expenseValue(largest)):'—',largest?(expenseType(largest)||'Não informado'):'']
  ]);
  expenseInsights.hidden=!items.length;
  if(items.length)renderExpenseCharts(items);

  const sorted=sortRows(filtered,expenseSort,EXPENSE_SORT);
  tbody.innerHTML=sorted.length?sorted.map(item=>
    '<tr><td data-label="Data">'+formatDate(item.dataDocumento)+'</td>'+
    '<td data-label="Despesa">'+escapeHtml(expenseType(item)||'Não informado')+'</td>'+
    '<td data-label="Fornecedor">'+escapeHtml(item.nomeFornecedor||'Não informado')+'</td>'+
    '<td data-label="Documento">'+escapeHtml(item.numDocumento||'—')+'</td>'+
    '<td data-label="Valor líquido" class="is-numeric">'+money.format(expenseValue(item))+'</td></tr>'
  ).join(''):'<tr class="is-empty"><td colspan="5">Nenhuma despesa encontrada para os filtros selecionados.</td></tr>';
  paintSortHeaders(tableWrap.querySelector('table'),expenseSort);
  setResultsCount(expenseResultsAccordion,filtered.length+(filtered.length===1?' documento':' documentos')+' · '+money.format(total));

  tableWrap.hidden=false;
  expenseResultsAccordion.open=true;
  expenseResultsAccordion.hidden=false;
}

async function loadExpenses(){
  const id=deputySelect.value;
  if(!id){
    setStatus('Selecione um deputado antes de consultar.','error');
    window.searchFeedback?.error('expense', 'Selecione um deputado antes de iniciar a consulta.');
    openDeputyPicker();
    return;
  }

  searchButton.disabled=true;
  window.searchFeedback?.loading('expense', 'Carregando as despesas do parlamentar.');
  summaryEl.hidden=true;
  expenseInsights.hidden=true;
  expenseMonth=null;
  tableWrap.hidden=true;
  expenseResultsAccordion.hidden=true;
  typeSelect.innerHTML='<option value="">Todas as categorias</option>';
  setStatus('Consultando os registros anuais oficiais de '+yearSelect.value+'…','loading');

  try{
    let source='da API de Dados Abertos';
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
      source='do arquivo anual da CEAP';
    }

    if(!expenseCache.length){
      const fallbackParams=new URLSearchParams({ano:yearSelect.value,id});
      const fallback=await getJson('/api/camara-ceap?'+fallbackParams);
      expenseCache=Array.isArray(fallback.despesas)?fallback.despesas:[];
      source='do arquivo anual da CEAP';
    }

    expenseCache.sort((a,b)=>String(b.dataDocumento||'').localeCompare(String(a.dataDocumento||'')));
    fillTypes(expenseCache);
    renderExpenses(expenseCache);
    setStatus(expenseCache.length?
      expenseCache.length+' registros carregados '+source+' em '+yearSelect.value+'.':
      'Nenhuma despesa registrada para este parlamentar em '+yearSelect.value+'.','done');
    window.searchFeedback?.clear('expense');
  }catch(error){
    expenseCache=[];
    summaryEl.hidden=true;
    expenseInsights.hidden=true;
    tableWrap.hidden=true;
    expenseResultsAccordion.hidden=true;
    setStatus(error.message,'error');
    window.searchFeedback?.error('expense', error.message);
  }finally{
    searchButton.disabled=false;
  }
}

function renderAnnualRows(rows){
  const terms=normalizeSearch(annualFilter?.value).split(/\s+/).filter(Boolean);
  const visible=terms.length?rows.filter(row=>terms.every(term=>normalizeSearch([row.nome,row.partido,row.uf].join(' ')).includes(term))):rows;
  if(annualFilterCount)annualFilterCount.textContent=terms.length?visible.length+' de '+rows.length+' parlamentares':rows.length+' parlamentares';
  if(annualTableTools)annualTableTools.hidden=!rows.length;
  rows=sortRows(visible,annualSort,ANNUAL_SORT);
  annualTableBody.innerHTML=rows.length?rows.map(row=>
    '<tr><td data-label="Deputado">'+escapeHtml(row.nome)+'</td>'+
    '<td data-label="Partido">'+escapeHtml(row.partido||'—')+'</td>'+
    '<td data-label="UF">'+escapeHtml(row.uf||'—')+'</td>'+
    '<td data-label="Total CEAP" class="is-numeric">'+money.format(Number(row.total)||0)+'</td></tr>'
  ).join(''):'<tr class="is-empty"><td colspan="4">Nenhum registro encontrado para os filtros selecionados.</td></tr>';
  paintSortHeaders(annualTableWrap.querySelector('table'),annualSort);
  setResultsCount(annualResultsAccordion,(terms.length?visible.length+' de '+annualRows.length:annualRows.length)+' parlamentares · rankings e tabela');

  annualTableWrap.hidden=false;
}

[expenseResultsAccordion,annualResultsAccordion].forEach(details=>{
  details.addEventListener('toggle',()=>{
    // Abertura feita pelo código (nova consulta) também atualiza o estado-alvo.
    if(details.open)details.dataset.accordionState='open';
    syncResultsAction(details);
  });
  details.addEventListener('accordion:change',()=>syncResultsAction(details));
});

bindSortHeaders(tableWrap.querySelector('table'),expenseSort,{date:'desc',value:'desc'},()=>renderExpenses(expenseCache));
bindSortHeaders(annualTableWrap.querySelector('table'),annualSort,{total:'desc'},()=>renderAnnualRows(annualRows));

function renderAnnualRankings(rows){
  const ordered=rows.slice().sort((a,b)=>(Number(b.total)||0)-(Number(a.total)||0));
  const highest=ordered.slice(0,10);
  const lowest=ordered.slice(-10).reverse();
  const max=Math.max(1,Number(ordered[0]?.total)||0);
  const render=items=>items.map(row=>
    '<li><span class="annual-ranking-name">'+escapeHtml(row.nome)+
    '<span class="annual-ranking-meta">'+escapeHtml((row.partido||'Sem partido')+'/'+(row.uf||'—'))+'</span></span>'+
    '<strong class="annual-ranking-value">'+money.format(Number(row.total)||0)+'</strong>'+
    '<span class="annual-ranking-bar" aria-hidden="true"><span style="width:'+((Number(row.total)||0)/max*100).toFixed(2)+'%"></span></span></li>'
  ).join('');
  annualHighestList.innerHTML=render(highest);
  annualLowestList.innerHTML=render(lowest);
  annualRankings.hidden=rows.length===0;
}

function renderPartyChart(){
  const parties=new Map();
  annualRows.forEach(row=>{
    const key=row.partido||'Sem partido';
    const current=parties.get(key)||{party:key,total:0,count:0};
    current.total+=Number(row.total)||0;
    current.count+=1;
    parties.set(key,current);
  });
  const list=[...parties.values()].map(item=>({...item,average:item.total/item.count}))
    .sort((a,b)=>b[partyMetric]-a[partyMetric]);
  const max=Math.max(1,...list.map(item=>item[partyMetric]));
  const shown=partyExpanded?list:list.slice(0,10);
  annualPartyChart.innerHTML=shown.map(item=>
    '<div class="ceap-bar is-static"><span class="ceap-bar-copy"><span class="ceap-bar-name">'+escapeHtml(item.party)+
    ' <small>'+item.count+(item.count===1?' deputado':' deputados')+'</small></span><span class="ceap-bar-value">'+
    escapeHtml(money.format(item[partyMetric]))+'</span></span><span class="ceap-bar-track"><span style="width:'+
    (item[partyMetric]/max*100).toFixed(2)+'%"></span></span></div>'
  ).join('');
  annualPartyMore.hidden=list.length<=10;
  annualPartyMore.textContent=partyExpanded?'Mostrar só os 10 primeiros':'Mostrar todos os '+list.length+' partidos';
  annualPartyBox.hidden=!list.length;
}

async function loadAnnualData(){
  annualSearch.disabled=true;
  window.searchFeedback?.loading('annual-expenses', 'Carregando os dados anuais da CEAP.');
  annualTableWrap.hidden=true;
  annualSummary.hidden=true;
  annualRankings.hidden=true;
  annualPartyBox.hidden=true;
  annualTableTools.hidden=true;
  annualResultsAccordion.hidden=true;
  setAnnualStatus('Carregando os dados anuais oficiais da Câmara…','loading');

  try{
    const params=new URLSearchParams({ano:annualYear.value});
    if(annualUf.value) params.set('uf',annualUf.value);

    const data=await getJson('/api/camara-ceap?'+params);
    const rows=Array.isArray(data.deputados)?data.deputados:[];
    const total=Number(data.total)||0;

    const totals=rows.map(row=>Number(row.total)||0);
    annualRows=rows;
    partyExpanded=false;
    annualSummary.hidden=false;
    annualSummary.innerHTML=statsHtml([
      ['Total CEAP',compactMoney(total),money.format(total)+' · '+annualYear.value+(annualUf.value?' · '+annualUf.value:' · todas as UFs'),true],
      ['Parlamentares',String(rows.length),'com registros no arquivo'],
      ['Média por parlamentar',rows.length?money.format(total/rows.length):'—','total ÷ parlamentares'],
      ['Mediana',rows.length?money.format(median(totals)):'—','metade gastou menos que isso']
    ]);

    renderAnnualRows(rows);
    renderAnnualRankings(rows);
    renderPartyChart();
    annualResultsAccordion.open=true;
    annualResultsAccordion.hidden=false;
    setAnnualStatus(rows.length+' parlamentares encontrados no período anual selecionado.','done');
    window.searchFeedback?.clear('annual-expenses');
  }catch(error){
    setAnnualStatus(error.message,'error');
    window.searchFeedback?.error('annual-expenses', error.message);
  }finally{
    annualSearch.disabled=false;
  }
}

deputySelect.addEventListener('change',()=>{
  if(deputySelect.value)setStatus('Deputado selecionado. Escolha o ano e clique em Consultar.');
});

deputyUfSelect.addEventListener('change',()=>{
  if(!deputies.length)return;
  if(!fillDeputySelect())setStatus('O estado mudou. Selecione um deputado da UF escolhida.');
});

typeSelect.addEventListener('change',()=>renderExpenses(expenseCache));

expenseMonthChart?.addEventListener('click',event=>{
  const button=event.target.closest('[data-month]');
  if(!button||button.disabled)return;
  const month=Number(button.dataset.month);
  expenseMonth=expenseMonth===month?null:month;
  renderExpenses(expenseCache);
  expenseMonthChart.querySelector('[data-month="'+month+'"]')?.focus();
});

['pointerover','focusin'].forEach(type=>expenseMonthChart?.addEventListener(type,event=>{
  const button=event.target.closest('[data-month]');
  if(button&&!button.disabled)showMonthReadout(Number(button.dataset.month));
}));
expenseMonthChart?.addEventListener('pointerleave',()=>showMonthReadout(null));
expenseMonthChart?.addEventListener('focusout',event=>{
  if(!expenseMonthChart.contains(event.relatedTarget))showMonthReadout(null);
});

expenseMonthClear?.addEventListener('click',()=>{
  expenseMonth=null;
  renderExpenses(expenseCache);
});

expenseTypeChart?.addEventListener('click',event=>{
  const button=event.target.closest('[data-type]');
  if(!button)return;
  const type=button.dataset.type;
  typeSelect.value=typeSelect.value===type?'':type;
  renderExpenses(expenseCache);
  [...expenseTypeChart.querySelectorAll('[data-type]')].find(item=>item.dataset.type===type)?.focus();
});

document.querySelectorAll('[data-party-metric]').forEach(button=>button.addEventListener('click',()=>{
  partyMetric=button.dataset.partyMetric;
  document.querySelectorAll('[data-party-metric]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  renderPartyChart();
}));

annualPartyMore?.addEventListener('click',()=>{
  partyExpanded=!partyExpanded;
  renderPartyChart();
});

annualFilter?.addEventListener('input',()=>renderAnnualRows(annualRows));

/* Rolagem encadeada: tabelas e listas têm rolagem própria, mas quando chegam
   ao fim o mesmo gesto da roda continua rolando a página. Sem isto o navegador
   "prende" o gesto na área interna até o usuário recomeçar a rolagem. */
const SCROLL_AREAS='.ceap-table-wrap, .ceap-bar-list';
document.addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
  const area=event.target instanceof Element?event.target.closest(SCROLL_AREAS):null;
  if(!area)return;
  const max=area.scrollHeight-area.clientHeight;
  if(max<=1)return;
  const unit=event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1;
  const delta=event.deltaY*unit;
  const room=delta>0?max-area.scrollTop:-area.scrollTop;
  // Ainda há espaço suficiente na área interna: deixa o navegador rolar.
  if(Math.abs(room)>=Math.abs(delta)&&Math.abs(room)>1)return;
  event.preventDefault();
  area.scrollTop+=room;
  window.scrollBy(0,delta-room);
},{passive:false});

/* Simulações educativas (CEAP e emendas Pix) */

document.querySelectorAll('input[type="range"][data-sync]').forEach(range=>{
  const target=document.getElementById(range.dataset.sync);
  if(!target)return;
  const paint=()=>{
    const min=Number(range.min),max=Number(range.max);
    range.style.setProperty('--fill',Math.min(100,Math.max(0,(Number(range.value)-min)/(max-min)*100))+'%');
  };
  range.addEventListener('input',()=>{
    target.value=range.value;
    target.dispatchEvent(new Event('input',{bubbles:true}));
    paint();
  });
  target.addEventListener('input',()=>{
    if(target.value!==''&&Number.isFinite(Number(target.value)))range.value=target.value;
    paint();
  });
  paint();
});

function updateCeapCalc(){
  const docInput=document.getElementById('ceap-doc');
  const glosaInput=document.getElementById('ceap-glosa');
  if(!docInput||!glosaInput)return;
  const documentValue=Math.max(0,Number(docInput.value)||0);
  const glosa=Math.min(documentValue,Math.max(0,Number(glosaInput.value)||0));
  const net=documentValue-glosa;
  const glosaRange=document.querySelector('input[data-sync="ceap-glosa"]');
  // O controle deslizante da glosa vai até o valor do documento.
  if(glosaRange&&documentValue){
    glosaRange.max=String(documentValue);
    glosaRange.value=String(glosa);
    glosaRange.style.setProperty('--fill',(glosa/documentValue*100)+'%');
  }
  document.getElementById('ceap-net').textContent=money.format(net);
  document.getElementById('ceap-net-detail').textContent=documentValue
    ?'Documento de '+money.format(documentValue)+' com '+money.format(glosa)+' glosados ('+(glosa/documentValue*100).toFixed(1).replace('.',',')+'%). Só o valor líquido é debitado da cota.'
    :'Informe o valor do documento.';
  document.getElementById('ceap-bar-net').style.width=(documentValue?net/documentValue*100:0)+'%';
  document.getElementById('ceap-bar-glosa').style.width=(documentValue?glosa/documentValue*100:0)+'%';
}

function updatePixRule(){
  const totalInput=document.getElementById('pix-rule-total');
  const capitalInput=document.getElementById('pix-rule-capital');
  if(!totalInput||!capitalInput)return;
  const total=Math.max(0,Number(totalInput.value)||0);
  const share=Math.min(100,Math.max(0,Number(capitalInput.value)||0));
  const capital=total*share/100;
  const minimum=total*.7;
  const ok=share>=70;
  const status=document.getElementById('pix-rule-status');
  status.textContent=ok?'Atende ao mínimo':'Abaixo do mínimo';
  status.closest('.pix-rule-result').dataset.state=ok?'ok':'below';
  document.getElementById('pix-rule-detail').textContent=ok
    ?money.format(capital)+' em capital ('+share+'%) e '+money.format(total-capital)+' em custeio. O mínimo seria '+money.format(minimum)+'.'
    :'Faltam '+money.format(minimum-capital)+' em despesas de capital para chegar aos 70% ('+money.format(minimum)+').';
  document.getElementById('pix-rule-fill').style.width=share+'%';
}

['ceap-doc','ceap-glosa'].forEach(id=>document.getElementById(id)?.addEventListener('input',updateCeapCalc));
['pix-rule-total','pix-rule-capital'].forEach(id=>document.getElementById(id)?.addEventListener('input',updatePixRule));
updateCeapCalc();
updatePixRule();
searchButton.addEventListener('click',loadExpenses);
annualSearch?.addEventListener('click',loadAnnualData);

initDeputies();
