const { createAuthorizationUrl, exchangeCode } = require('../lib/google-oauth');

module.exports = {
  authorize(req, res) {
    try { res.redirect(createAuthorizationUrl()); }
    catch (error) {
      console.error('Erro ao iniciar OAuth2:', error);
      res.status(500).send('OAuth2 não está configurado. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.');
    }
  },

  async callback(req, res) {
    try {
      const { code, state, error } = req.query;
      if (error) return res.status(400).send('Autorização cancelada ou recusada pelo Google: ' + error);
      if (!code || !state) return res.status(400).send('O Google não retornou um código de autorização válido.');

      const tokens = await exchangeCode(code, state);
      if (!tokens.refresh_token) {
        return res.status(400).send('<h1>Refresh Token não recebido</h1><p>Revogue o acesso do King\'s Newsletter na sua Conta Google e tente novamente.</p>');
      }

      const safeToken = String(tokens.refresh_token).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      res.type('html').send([
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OAuth2 configurado</title></head>',
        '<body style="font-family:Arial,sans-serif;max-width:760px;margin:40px auto;padding:0 20px">',
        '<h1>OAuth2 autorizado</h1>',
        '<p>Copie o valor abaixo para <code>GOOGLE_REFRESH_TOKEN</code> no seu arquivo <code>.env</code>.</p>',
        '<textarea readonly style="width:100%;min-height:100px;font-family:monospace">' + safeToken + '</textarea>',
        '<p><strong>Não envie esse token para o GitHub nem compartilhe ele.</strong></p>',
        '<p>Depois de salvar o <code>.env</code>, reinicie o servidor e teste a inscrição.</p>',
        '</body></html>'
      ].join(''));
    } catch (error) {
      console.error('Erro no callback OAuth2:', error);
      res.status(500).send('Não foi possível concluir a autorização OAuth2. Veja o terminal para detalhes.');
    }
  }
};