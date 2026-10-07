const YEAR_MIN=2010;
const YEAR_MAX=new Date().getFullYear();
const cache=new Map();

function number(value){
  if(typeof value==='number')return Number.isFinite(value)?value:0;
  const text=String(value??'').trim();if(!text)return 0;
  const normalized=text.includes(',')?text.replace(/\\./g,'').replace(',','.'):text;
  const n=Number(normalized);return Number.isFinite(n)?n:0;
}
async function loadYear(year){
  if(cache.has(year))return cache.get(year);
  const response=await fetch('https://www.camara.leg.br/cotas/Ano-'+year+'.json',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('A Câmara não disponibilizou o arquivo anual em formato JSON para '+year+'.');
  const body=await response.json();
  const rows=Array.isArray(body)?body:(body.DESPEsas||body.DESPESA||body.dados||[]);
  if(!Array.isArray(rows))throw new Error('Formato inesperado no arquivo anual da CEAP.');
  cache.set(year,rows);return rows;
}
function normalize(row){
  return {id:String(row.ideCadastro||row.nuDeputadoId||''),nome:row.txNomeParlamentar||'Não informado',partido:row.sgPartido||'',uf:row.sgUF||'',dataDocumento:row.datEmissao||'',tipoDespesa:row.txtDescricao||'Não informado',nomeFornecedor:row.txtFornecedor||'Não informado',numDocumento:row.txtNumero||'',vlrLiquido:number(row.vlrLiquido)};
}
module.exports=async function(req,res){
  try{
    const year=Number(req.query.ano||new Date().getFullYear());
    if(!Number.isInteger(year)||year<YEAR_MIN||year>YEAR_MAX)return res.status(400).json({erro:'Ano inválido.'});
    const id=String(req.query.id||''),uf=String(req.query.uf||'').toUpperCase();
    const rows=(await loadYear(year)).map(normalize).filter(row=>row.id||row.nome);
    if(id)return res.status(200).json({ano:year,id,despesas:rows.filter(row=>row.id===id).sort((a,b)=>String(b.dataDocumento).localeCompare(String(a.dataDocumento)))});
    const filtered=uf?rows.filter(row=>row.uf===uf):rows,map=new Map();
    for(const row of filtered){
      const key=row.id||row.nome,current=map.get(key)||{id:row.id,nome:row.nome,partido:row.partido,uf:row.uf,total:0};
      current.total+=row.vlrLiquido;if(!current.partido&&row.partido)current.partido=row.partido;if(!current.uf&&row.uf)current.uf=row.uf;map.set(key,current);
    }
    const deputados=[...map.values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    return res.status(200).json({ano:year,uf:uf||null,total:deputados.reduce((sum,row)=>sum+row.total,0),deputados});
  }catch(error){console.error(error);return res.status(502).json({erro:'Não foi possível carregar o arquivo anual de despesas da Câmara.'});}
};
