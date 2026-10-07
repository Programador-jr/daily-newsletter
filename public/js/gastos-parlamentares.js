const CAMARA_DEPUTADOS_API='https://dadosabertos.camara.leg.br/api/v2/deputados';
const CAMARA_DESPESAS_API='https://dadosabertos.camara.leg.br/api/v2/deputados';

const yearSelect=document.getElementById('expense-year');
const stateSelect=document.getElementById('expense-state');
const orderSelect=document.getElementById('expense-order');
const searchButton=document.getElementById('expense-search');
const statusEl=document.getElementById('expense-status');
const tableWrap=document.getElementById('ranking-table-wrap');
const tbody=document.getElementById('ranking-table-body');

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const CACHE_PREFIX='kings-newsletter-parliamentary-ranking-';
const CONCURRENCY=8;

async function getJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json'}});
  let data=null;
  try{data=await response.json();}catch{}
  if(!response.ok)throw new Error(data?.erro||data?.message||'Não foi possível consultar os dados oficiais da Câmara.');
  return data;
}

function setStatus(text){statusEl.textContent=text;}

function cacheKey(){
  return CACHE_PREFIX+yearSelect.value+'-'+(stateSelect.value||'TODOS');
}

function renderRanking(rows){
  const sorted=[...rows].sort((a,b)=>{
    const difference=b.total-a.total;
    return orderSelect.value==='desc'?difference:-difference;
  });

  if(!sorted.length){
    tbody.innerHTML='<tr><td class="ranking-empty" colspan="5">Nenhum deputado encontrado para os filtros selecionados.</td></tr>';
    tableWrap.hidden=false;
    return;
  }

  tbody.innerHTML=sorted.map((row,index)=>
    '<tr><td>'+String(index+1)+'</td>'+
    '<td>'+escapeHtml(row.nome)+'</td>'+
    '<td>'+escapeHtml(row.uf)+'</td>'+
    '<td>'+escapeHtml(row.partido||'—')+'</td>'+
    '<td>'+money.format(row.total)+'</td></tr>'
  ).join('');
  tableWrap.hidden=false;
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function loadDeputies(){
  const params=new URLSearchParams({itens:'100',pagina:'1',ordem:'ASC',ordenarPor:'nome'});
  if(stateSelect.value)params.set('siglaUf',stateSelect.value);
  const rows=[];
  for(let page=1;page<=10;page++){
    params.set('pagina',String(page));
    const data=await getJson(CAMARA_DEPUTADOS_API+'?'+params);
    const pageRows=data.dados||[];
    rows.push(...pageRows);
    if(pageRows.length<100)break;
  }
  return rows;
}

async function loadDeputyTotal(deputy,year){
  const key=cacheKey();
  const stored=localStorage.getItem(key);
  const cache=stored?JSON.parse(stored):{};
  if(cache[deputy.id]!==undefined)return Number(cache[deputy.id])||0;

  let total=0;
  for(let page=1;page<=100;page++){
    const params=new URLSearchParams({
      ano:year,itens:'100',pagina:String(page),ordem:'DESC',ordenarPor:'dataDocumento'
    });
    const data=await getJson(CAMARA_DESPESAS_API+'/'+deputy.id+'/despesas?'+params);
    const rows=data.dados||[];
    total+=rows.reduce((sum,item)=>sum+(Number(item.vlrLiquido)||0),0);
    if(rows.length<100)break;
  }
  cache[deputy.id]=total;
  localStorage.setItem(key,JSON.stringify(cache));
  return total;
}

async function loadRanking(){
  searchButton.disabled=true;
  tableWrap.hidden=true;
  const year=yearSelect.value;
  const state=stateSelect.value||'todos';
  const label=stateSelect.options[stateSelect.selectedIndex].text;
  setStatus('Consultando deputados de '+year+' para '+label+'...');

  try{
    const deputies=await loadDeputies();
    if(!deputies.length){
      renderRanking([]);
      setStatus('Nenhum deputado encontrado para o estado selecionado.');
      return;
    }

    const rows=[];
    let completed=0;
    let cursor=0;

    async function worker(){
      while(true){
        const index=cursor++;
        if(index>=deputies.length)return;
        const deputy=deputies[index];
        const total=await loadDeputyTotal(deputy,year);
        rows.push({
          id:deputy.id,
          nome:deputy.nome,
          uf:deputy.siglaUf||'—',
          partido:deputy.siglaPartido||'—',
          total
        });
        completed++;
        setStatus('Consultando despesas: '+completed+' de '+deputies.length+' deputados...');
      }
    }

    await Promise.all(Array.from({length:Math.min(CONCURRENCY,deputies.length)},worker));
    renderRanking(rows);
    setStatus(rows.length+' deputados consultados em '+year+'.');
  }catch(error){
    tableWrap.hidden=true;
    setStatus(error.message);
  }finally{
    searchButton.disabled=false;
  }
}

stateSelect.addEventListener('change',()=>{
  tableWrap.hidden=true;
  setStatus('Filtros alterados. Clique em Consultar.');
});

yearSelect.addEventListener('change',()=>{
  tableWrap.hidden=true;
  setStatus('Filtros alterados. Clique em Consultar.');
});

orderSelect.addEventListener('change',()=>{
  const rows=[...tbody.querySelectorAll('tr')].map(row=>({
    nome:row.children[1]?.textContent||'',
    uf:row.children[2]?.textContent||'',
    partido:row.children[3]?.textContent||'',
    total:Number((row.children[4]?.textContent||'').replace(/[^0-9,-]/g,'').replace(/\./g,'').replace(',','.'))||0
  }));
  if(rows.length)renderRanking(rows);
});

searchButton.addEventListener('click',loadRanking);
