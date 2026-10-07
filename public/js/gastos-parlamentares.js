const API='https://dadosabertos.camara.leg.br/api/v2';
const deputySelect=document.getElementById('deputy-select');
const yearSelect=document.getElementById('expense-year');
const typeSelect=document.getElementById('expense-type');
const searchButton=document.getElementById('expense-search');
const statusEl=document.getElementById('expense-status');
const summaryEl=document.getElementById('expense-summary');
const tableWrap=document.getElementById('expense-table-wrap');
const tbody=document.getElementById('expense-table-body');
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let expenseCache=[];
async function getJson(url){const response=await fetch(url);if(!response.ok)throw new Error('Falha ao consultar os Dados Abertos da Câmara.');return response.json();}
function setStatus(text){statusEl.textContent=text;}
function fillTypes(items){const types=[...new Set(items.map(x=>x.tipoDespesa).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));typeSelect.innerHTML='<option value="">Todas as categorias</option>'+types.map(x=>'<option value="'+x.replaceAll('"','&quot;')+'">'+x+'</option>').join('');}
function renderExpenses(items){const selected=typeSelect.value;const filtered=selected?items.filter(x=>x.tipoDespesa===selected):items;const total=filtered.reduce((sum,x)=>sum+(Number(x.valorLiquido)||0),0);summaryEl.hidden=false;summaryEl.innerHTML='<div><span>Registros</span><strong>'+filtered.length+'</strong></div><div><span>Total líquido</span><strong>'+money.format(total)+'</strong></div><div><span>Período</span><strong>'+yearSelect.value+'</strong></div>';tbody.innerHTML=filtered.slice(0,100).map(x=>'<tr><td>'+((x.dataDocumento||'').split('T')[0].split('-').reverse().join('/'))+'</td><td>'+escapeHtml(x.tipoDespesa||'Não informado')+'</td><td>'+escapeHtml(x.nomeFornecedor||'Não informado')+'</td><td>'+escapeHtml(x.numDocumento||'—')+'</td><td>'+money.format(Number(x.valorLiquido)||0)+'</td></tr>').join('');tableWrap.hidden=false;}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
async function loadDeputies(){try{const pages=await Promise.all([1,2,3,4,5,6].map(p=>getJson(API+'/deputados?itens=100&pagina='+p+'&ordem=ASC&ordenarPor=nome')));const deputies=pages.flatMap(data=>data.dados||[]);deputySelect.innerHTML='<option value="">Selecione um deputado</option>'+deputies.map(d=>'<option value="'+d.id+'">'+escapeHtml(d.nome)+' — '+escapeHtml(d.siglaPartido||'')+'/'+escapeHtml(d.siglaUf||'')+'</option>').join('');setStatus('Selecione um deputado para consultar os registros.');}catch(error){deputySelect.innerHTML='<option value="">Não foi possível carregar</option>';setStatus(error.message);}}
async function loadExpenses(){const id=deputySelect.value;if(!id){setStatus('Selecione um deputado.');return;}searchButton.disabled=true;setStatus('Consultando dados oficiais...');summaryEl.hidden=true;tableWrap.hidden=true;try{const params=new URLSearchParams({ano:yearSelect.value,itens:'100',ordem:'DESC',ordenarPor:'dataDocumento'});const data=await getJson(API+'/deputados/'+id+'/despesas?'+params);expenseCache=data.dados||[];fillTypes(expenseCache);renderExpenses(expenseCache);setStatus('Foram carregados '+expenseCache.length+' registros desta consulta.');}catch(error){setStatus(error.message);}finally{searchButton.disabled=false;}}
typeSelect.addEventListener('change',()=>renderExpenses(expenseCache));searchButton.addEventListener('click',loadExpenses);loadDeputies();
