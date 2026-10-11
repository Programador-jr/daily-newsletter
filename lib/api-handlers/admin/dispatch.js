const { isSessionValid } = require('../../admin-auth');
const { runAndRecord } = require('../../../api/notify-news');

module.exports = async function dispatch(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });

  try {
    const result = await runAndRecord(req, 'admin-manual');
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'NEWSLETTER_RUN_ACTIVE') {
      return res.status(409).json({ error: 'Já existe um disparo em andamento.' });
    }
    console.error(JSON.stringify({
      event: 'admin.newsletter.dispatch.failed',
      code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'DISPATCH_FAILED'
    }));
    return res.status(500).json({ error: 'Não foi possível concluir o disparo.' });
  }
};
