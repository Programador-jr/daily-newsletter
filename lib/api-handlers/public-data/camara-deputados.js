const { setPublicCache } = require('../../public-cache');
const readResponseLimited = require('../../read-response-limited');

const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2/deputados';
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

module.exports = async function (req, res) {
  try {
    const params = new URLSearchParams();
    const allowed = ['nome', 'siglaUf', 'siglaPartido', 'pagina', 'itens', 'ordem', 'ordenarPor'];

    allowed.forEach((key) => {
      const value = req.query[key];
      if (value !== undefined && value !== '') params.set(key, String(value));
    });

    if (params.has('itens')) {
      const itens = Number(params.get('itens'));
      if (!Number.isInteger(itens) || itens < 1 || itens > 100) {
        return res.status(400).json({ erro: 'O parâmetro itens deve estar entre 1 e 100.' });
      }
    }

    const response = await fetch(CAMARA_API + '?' + params.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    const body = (await readResponseLimited(
      response,
      MAX_RESPONSE_BYTES,
      'A resposta da Câmara excede o limite de tamanho.'
    )).toString('utf8');
    if (response.ok) setPublicCache(res, 300, 600);
    return res.status(response.status).type('application/json').send(body);
  } catch {
    return res.status(502).json({ erro: 'Não foi possível consultar a API de Dados Abertos da Câmara.' });
  }
};
