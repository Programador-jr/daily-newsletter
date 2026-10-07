const API='https://dadosabertos.camara.leg.br/api/v2';
const deputySearch=document.getElementById('deputy-search');
const deputyToggle=document.getElementById('deputy-toggle');
const deputyHidden=document.getElementById('deputy-select');
const deputyOptions=document.getElementById('deputy-options');
const deputyCombobox=document.getElementById('deputy-combobox');
const yearSelect=document.getElementById('expense-year');
const typeSelect=document.getElementById('expense-type');
const searchButton=document.getElementById('expense-search');
const statusEl=document.getElementById('expense-status');
const summaryEl=document.getElementById('expense-summary');
const tableWrap=document.getElementById('expense-table-wrap');
const tbody=document.getElementById('expense-table-body');
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let expenseCache=[];
let deputies=[];

async function getJson(url){
  const response=await fetch(url);
  if(!response.ok) throw new Error('Falha ao consultar os Dados Abertos da Câmara.');
  return response.json();
}

function setStatus(text){statusEl.textContent=text;}

function fillTypes(items){
  const types=[...new Set(items.map(x=>x.tipoDespesa).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  typeSelect.innerHTML='<option value="">Todas as categorias</option>'+types.map(x=>'<option value="'+escapeHtml(x)+'">'+escapeHtml(x)+'</option>').join('');
}

function renderExpenses(items){
  const selected=typeSelect.value;
  const filtered=selected?items.filter(x=>x.tipoDespesa===selected):items;
  const total=filtered.reduce((sum,x)=>sum+(Number(x.valorLiquido)||0),0);
  summaryEl.hidden=false;
  summaryEl.innerHTML='<div><span>Registros</span><strong>'+filtered.length+'</strong></div><div><span>Total líquido</span><strong>'+money.format(total)+'</strong></div><div><span>Período</span><strong>'+yearSelect.value+'</strong></div>';
  tbody.innerHTML=filtered.map(x=>'<tr><td>'+formatDate(x.dataDocumento)+'</td><td>'+escapeHtml(x.tipoDespesa||'Não informado')+'</td><td>'+escapeHtml(x.nomeFornecedor||'Não informado')+'</td><td>'+escapeHtml(x.numDocumento||'—')+'</td><td>'+money.format(Number(x.valorLiquido)||0)+'</td></tr>').join('');
  tableWrap.hidden=false;
}

function formatDate(value){
  const date=String(value||'').split('T')[0];
  return date?date.split('-').reverse().join('/'): '—';
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderDeputyOptions(query=''){
  const normalized=query.trim().toLocaleLowerCase('pt-BR');
  const filtered=deputies.filter(d=>{
    const text=(d.nome+' '+(d.siglaPartido||'')+' '+(d.siglaUf||'')).toLocaleLowerCase('pt-BR');
    return text.includes(normalized);
  }).slice(0,100);
  deputyOptions.innerHTML='';
  if(!filtered.length){
    deputyOptions.innerHTML='<div class="deputy-empty">Nenhum deputado encontrado.</div>';
  }else{
    filtered.forEach(d=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='deputy-option';
      button.setAttribute('role','option');
      button.setAttribute('aria-selected',String(String(d.id)===deputyHidden.value));
      button.dataset.id=d.id;
      button.textContent=d.nome+' — '+(d.siglaPartido||'')+'/'+(d.siglaUf||'');
      deputyOptions.appendChild(button);
    });
  }
}

function openDeputyOptions(){
  renderDeputyOptions(deputySearch.value);
  deputyOptions.hidden=false;
  deputySearch.setAttribute('aria-expanded','true');
  deputyToggle.setAttribute('aria-expanded','true');
}

function closeDeputyOptions(){
  deputyOptions.hidden=true;
  deputySearch.setAttribute('aria-expanded','false');
  deputyToggle.setAttribute('aria-expanded','false');
}

function selectDeputy(deputy){
  deputyHidden.value=deputy.id;
  deputySearch.value=deputy.nome+' — '+(deputy.siglaPartido||'')+'/'+(deputy.siglaUf||'');
  closeDeputyOptions();
  setStatus('Deputado selecionado. Clique em Consultar.');
}

async function loadDeputies(){
  try{
    const pages=[];
    for(let page=1;page<=6;page++){
      pages.push(await getJson(API+'/deputados?itens=100&pagina='+page+'&ordem=ASC&ordenarPor=nome'));
    }
    deputies=pages.flatMap(data=>data.dados||[]);
    renderDeputyOptions();
    setStatus('Selecione um deputado para consultar os registros.');
  }catch(error){
    deputySearch.placeholder='Não foi possível carregar';
    setStatus(error.message);
  }
}

async function loadExpenses(){
  const id=deputyHidden.value;
  if(!id){setStatus('Selecione um deputado.');openDeputyOptions();return;}
  searchButton.disabled=true;
  setStatus('Consultando dados oficiais...');
  summaryEl.hidden=true;
  tableWrap.hidden=true;
  try{
    const all=[];
    for(let page=1;page<=100;page++){
      const params=new URLSearchParams({ano:yearSelect.value,itens:'100',pagina:String(page),ordem:'DESC',ordenarPor:'dataDocumento'});
      const data=await getJson(API+'/deputados/'+id+'/despesas?'+params);
      const rows=data.dados||[];
      all.push(...rows);
      if(rows.length<100) break;
    }
    expenseCache=all;
    fillTypes(expenseCache);
    renderExpenses(expenseCache);
    setStatus('Foram carregados '+expenseCache.length+' registros desta consulta.');
  }catch(error){
    setStatus(error.message);
  }finally{
    searchButton.disabled=false;
  }
}

deputySearch.addEventListener('focus',openDeputyOptions);
deputySearch.addEventListener('input',openDeputyOptions);
deputyToggle.addEventListener('click',()=>{
  if(deputyOptions.hidden) openDeputyOptions(); else closeDeputyOptions();
});
deputyOptions.addEventListener('click',event=>{
  const option=event.target.closest('.deputy-option');
  if(!option)return;
  const deputy=deputies.find(d=>String(d.id)===option.dataset.id);
  if(deputy)selectDeputy(deputy);
});
document.addEventListener('click',event=>{
  if(!deputyCombobox.contains(event.target))closeDeputyOptions();
});
deputySearch.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeDeputyOptions();
});
typeSelect.addEventListener('change',()=>renderExpenses(expenseCache));
searchButton.addEventListener('click',loadExpenses);
loadDeputies();