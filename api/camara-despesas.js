const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2/deputados';

module.exports = async function (req, res) {
  try {
    const id = String(req.query.id || '');
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ erro: 'Identificador de deputado inválido.' });
    }

    const params = new URLSearchParams();
    const allowed = ['ano', 'mes', 'idLegislatura', 'cnpjCpfFornecedor', 'pagina', 'itens', 'ordem', 'ordenarPor'];

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

    const response = await fetch(CAMARA_API + '/' + id + '/despesas?' + params.toString(), {
      headers: { Accept: 'application/json' }
    });

    const body = await response.text();
    res.status(response.status).type('application/json').send(body);
  } catch (error) {
    res.status(502).json({ erro: 'Não foi possível consultar as despesas na API de Dados Abertos da Câmara.' });
  }
};
