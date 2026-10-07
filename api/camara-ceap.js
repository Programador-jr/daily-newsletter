const zlib=require('node:zlib');

const YEAR_MIN=2008;
const YEAR_MAX=new Date().getFullYear();
const cache=new Map();

function number(value){
  if(typeof value==='number')return Number.isFinite(value)?value:0;
  const text=String(value??'').trim();
  if(!text)return 0;
  const normalized=text.includes(',')?text.replace(/\./g,'').replace(',','.'):text;
  const n=Number(normalized);
  return Number.isFinite(n)?n:0;
}

function parseCsv(text){
  const rows=[];
  let row=[];
  let field='';
  let quoted=false;

  for(let i=0;i<text.length;i++){
    const char=text[i];
    const next=text[i+1];

    if(quoted){
      if(char==='"'&&next==='"'){
        field+='"';
        i++;
      }else if(char==='"'){
        quoted=false;
      }else{
        field+=char;
      }
      continue;
    }

    if(char==='"'){
      quoted=true;
    }else if(char===';'){
      row.push(field);
      field='';
    }else if(char==='\n'){
      row.push(field.replace(/\r$/,''));
      if(row.some(value=>value!==''))rows.push(row);
      row=[];
      field='';
    }else{
      field+=char;
    }
  }

  if(field!==''||row.length){
    row.push(field.replace(/\r$/,''));
    if(row.some(value=>value!==''))rows.push(row);
  }

  if(!rows.length)return [];

  const headers=rows[0].map(value=>String(value).replace(/^\uFEFF/,'').trim());
  return rows.slice(1).map(values=>{
    const record={};
    headers.forEach((header,index)=>{record[header]=values[index]??'';});
    return record;
  });
}

function unzipFirstFile(buffer){
  const signature=0x04034b50;
  let offset=0;

  while(offset+30<=buffer.length){
    const sig=buffer.readUInt32LE(offset);
    if(sig!==signature)break;

    const method=buffer.readUInt16LE(offset+8);
    const compressedSize=buffer.readUInt32LE(offset+18);
    const nameLength=buffer.readUInt16LE(offset+26);
    const extraLength=buffer.readUInt16LE(offset+28);
    const dataStart=offset+30+nameLength+extraLength;
    const dataEnd=dataStart+compressedSize;

    if(dataEnd>buffer.length)throw new Error('Arquivo ZIP da CEAP está incompleto.');

    const compressed=buffer.subarray(dataStart,dataEnd);
    if(method===0)return compressed;
    if(method===8)return zlib.inflateRawSync(compressed);

    offset=dataEnd;
  }

  throw new Error('Não foi possível localizar o CSV dentro do arquivo anual da CEAP.');
}

async function loadYear(year){
  if(cache.has(year))return cache.get(year);

  const response=await fetch('https://www.camara.leg.br/cotas/Ano-'+year+'.csv.zip',{
    headers:{Accept:'application/zip'},
    signal:AbortSignal.timeout(60000)
  });

  if(!response.ok){
    throw new Error('A Câmara não disponibilizou o arquivo anual da CEAP para '+year+'.');
  }

  const archive=Buffer.from(await response.arrayBuffer());
  const csv=unzipFirstFile(archive).toString('utf8');
  const rows=parseCsv(csv);

  if(!rows.length)throw new Error('O arquivo anual da CEAP não contém registros.');

  cache.set(year,rows);
  return rows;
}

function normalize(row){
  return {
    id:String(row.nuDeputadoId||row.ideCadastro||'').trim(),
    nome:String(row.txNomeParlamentar||'Não informado').trim(),
    partido:String(row.sgPartido||'').trim(),
    uf:String(row.sgUF||'').trim().toUpperCase(),
    dataDocumento:String(row.datEmissao||'').trim(),
    tipoDespesa:String(row.txtDescricao||'Não informado').trim(),
    nomeFornecedor:String(row.txtFornecedor||'Não informado').trim(),
    numDocumento:String(row.txtNumero||'').trim(),
    vlrLiquido:number(row.vlrLiquido)
  };
}

module.exports=async function(req,res){
  try{
    const year=Number(req.query.ano||new Date().getFullYear());

    if(!Number.isInteger(year)||year<YEAR_MIN||year>YEAR_MAX){
      return res.status(400).json({erro:'Ano inválido.'});
    }

    const id=String(req.query.id||'').trim();
    const uf=String(req.query.uf||'').trim().toUpperCase();
    const rows=(await loadYear(year))
      .map(normalize)
      .filter(row=>row.id||row.nome);

    if(id){
      return res.status(200).json({
        ano:year,
        id,
        despesas:rows
          .filter(row=>row.id===id)
          .sort((a,b)=>String(b.dataDocumento).localeCompare(String(a.dataDocumento)))
      });
    }

    const filtered=uf?rows.filter(row=>row.uf===uf):rows;
    const map=new Map();

    for(const row of filtered){
      const key=row.id||row.nome;
      const current=map.get(key)||{
        id:row.id,
        nome:row.nome,
        partido:row.partido,
        uf:row.uf,
        total:0
      };

      current.total+=row.vlrLiquido;
      if(!current.partido&&row.partido)current.partido=row.partido;
      if(!current.uf&&row.uf)current.uf=row.uf;
      map.set(key,current);
    }

    const deputados=[...map.values()]
      .sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));

    return res.status(200).json({
      ano:year,
      uf:uf||null,
      total:deputados.reduce((sum,row)=>sum+row.total,0),
      deputados
    });
  }catch(error){
    console.error(error);
    return res.status(502).json({
      erro:error?.message||'Não foi possível carregar os dados anuais da CEAP.'
    });
  }
};
