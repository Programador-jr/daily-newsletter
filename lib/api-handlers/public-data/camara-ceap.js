const zlib=require('node:zlib');
const readResponseLimited=require('../../read-response-limited');
const { setPublicCache } = require('../../public-cache');

const YEAR_MIN=2008;
const YEAR_MAX=new Date().getFullYear();
const cache=new Map();
const CACHE_TTL_MS=30*60*1000;
const MAX_CACHE_ENTRIES=3;
const MAX_ARCHIVE_BYTES=75*1024*1024;
const MAX_CSV_BYTES=250*1024*1024;

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

function unzipCsv(buffer){
  const eocdSignature=0x06054b50;
  const centralSignature=0x02014b50;
  const localSignature=0x04034b50;
  const minEocdSize=22;
  const maxCommentSize=0xffff;
  let eocdOffset=-1;

  if(buffer.length<minEocdSize)throw new Error('A resposta da Câmara não é um ZIP válido da CEAP.');
  for(let offset=buffer.length-minEocdSize;offset>=Math.max(0,buffer.length-minEocdSize-maxCommentSize);offset--){
    if(buffer.readUInt32LE(offset)===eocdSignature&&offset+minEocdSize+buffer.readUInt16LE(offset+20)===buffer.length){
      eocdOffset=offset;
      break;
    }
  }
  if(eocdOffset<0)throw new Error('A resposta da Câmara não é um ZIP válido da CEAP.');

  const entryCount=buffer.readUInt16LE(eocdOffset+10);
  const centralSize=buffer.readUInt32LE(eocdOffset+12);
  const centralOffset=buffer.readUInt32LE(eocdOffset+16);
  if(centralOffset+centralSize>eocdOffset)throw new Error('O índice do ZIP da CEAP está incompleto.');

  let offset=centralOffset;
  for(let entry=0;entry<entryCount&&offset+46<=buffer.length;entry++){
    if(buffer.readUInt32LE(offset)!==centralSignature)throw new Error('O índice do ZIP da CEAP está corrompido.');
    const flags=buffer.readUInt16LE(offset+8);
    const method=buffer.readUInt16LE(offset+10);
    const compressedSize=buffer.readUInt32LE(offset+20);
    const uncompressedSize=buffer.readUInt32LE(offset+24);
    const nameLength=buffer.readUInt16LE(offset+28);
    const extraLength=buffer.readUInt16LE(offset+30);
    const commentLength=buffer.readUInt16LE(offset+32);
    const localOffset=buffer.readUInt32LE(offset+42);
    const name=buffer.subarray(offset+46,offset+46+nameLength).toString('utf8');
    offset+=46+nameLength+extraLength+commentLength;

    if(!/\.csv$/i.test(name))continue;
    if(flags&1)throw new Error('O arquivo ZIP da CEAP está criptografado e não pode ser lido.');
    if(localOffset+30>buffer.length||buffer.readUInt32LE(localOffset)!==localSignature){
      throw new Error('O arquivo CSV dentro do ZIP da CEAP está corrompido.');
    }

    const localNameLength=buffer.readUInt16LE(localOffset+26);
    const localExtraLength=buffer.readUInt16LE(localOffset+28);
    const dataStart=localOffset+30+localNameLength+localExtraLength;
    const dataEnd=dataStart+compressedSize;
    if(dataEnd>buffer.length)throw new Error('O download do arquivo ZIP da CEAP terminou antes do fim do CSV.');

    const compressed=buffer.subarray(dataStart,dataEnd);
    let csv;
    try{
      if(method===0)csv=compressed;
      else if(method===8)csv=zlib.inflateRawSync(compressed,{maxOutputLength:MAX_CSV_BYTES});
      else throw new Error('Método de compressão ZIP não suportado: '+method+'.');
    }catch(error){
      if(error.message.startsWith('Método de compressão'))throw error;
      throw new Error('Não foi possível descompactar o CSV da CEAP; o arquivo recebido está incompleto ou corrompido.', { cause: error });
    }

    if(uncompressedSize!==0xffffffff&&csv.length!==uncompressedSize){
      throw new Error('O CSV descompactado da CEAP tem tamanho diferente do informado no ZIP.');
    }
    return csv;
  }

  throw new Error('Não foi possível localizar o CSV dentro do arquivo anual da CEAP.');
}

async function loadYear(year){
  const cached=cache.get(year);
  if(cached&&cached.expiresAt>Date.now())return cached.promise;
  if(cached)cache.delete(year);
  // Keep a couple of recent years cached. Clearing everything let a client
  // cycle through years and force repeated 75 MB downloads/parses.
  while(cache.size>=MAX_CACHE_ENTRIES)cache.delete(cache.keys().next().value);
  const entry={expiresAt:Date.now()+CACHE_TTL_MS,promise:null};
  entry.promise=(async()=>{
    const response=await fetch('https://www.camara.leg.br/cotas/Ano-'+year+'.csv.zip',{
      headers:{Accept:'application/zip'},
      signal:AbortSignal.timeout(20000)
    });
    if(!response.ok)throw new Error('A Câmara não disponibilizou o arquivo anual da CEAP para '+year+'.');
    const archive=await readResponseLimited(
      response,
      MAX_ARCHIVE_BYTES,
      'O arquivo anual da CEAP excede o limite de tamanho permitido.'
    );
    const csv=unzipCsv(archive).toString('utf8');
    const rows=parseCsv(csv);
    if(!rows.length)throw new Error('O arquivo anual da CEAP não contém registros.');
    return rows;
  })().catch(error=>{if(cache.get(year)===entry)cache.delete(year);throw error;});
  cache.set(year,entry);
  return entry.promise;
}

function normalize(row){
  return {
    id:String(row.ideCadastro||row.nuDeputadoId||'').trim(),
    ceapId:String(row.nuDeputadoId||'').trim(),
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
    setPublicCache(res, 1800, 3600);

    if(id){
      return res.status(200).json({
        ano:year,
        id,
        despesas:rows
          .filter(row=>row.id===id||row.ceapId===id)
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
