const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const { sendEmail } = require('../lib/email');
const { calendarDateKey } = require('../lib/news-date');

const TEST_RECIPIENT = 'mello.br2025@gmail.com';
const ALLOWED_BRANCH = 'reconciliation/newsletter-r2-homepage';
const ALLOWED_DATABASE = 'kings_newsletter_preview';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseEditionDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 0;
  const timestamp = Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const date = new Date(timestamp);
  return date.getUTCFullYear() === Number(match[3]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[1]) ? timestamp : 0;
}

function buildStoryMarkup(story) {
  const imageUrl = typeof story.image?.url === 'string' && /^https:\/\//i.test(story.image.url)
    ? story.image.url
    : '';
  const imageMarkup = imageUrl
    ? '<img src="' + escapeHtml(imageUrl) + '" alt="' +
      escapeHtml(story.image?.alt || story.title || 'Imagem da notícia') +
      '" width="616" style="display:block;width:100%;max-width:616px;height:auto;max-height:346px;object-fit:cover;border:0;border-radius:12px;margin:0 0 18px" />'
    : '';

  return '<article style="padding:0 0 28px;margin:0 0 28px;border-bottom:1px solid #d8e5e1">' +
    imageMarkup +
    '<div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#0b766b;letter-spacing:.5px">' +
      escapeHtml(story.category || '') + '</div>' +
    '<h2 style="font-family:Georgia,serif;font-size:21px;line-height:1.25;margin:8px 0">' +
      escapeHtml(story.title || '') + '</h2>' +
    '<p style="line-height:1.6;color:#536762">' + escapeHtml(story.summary || '') + '</p>' +
    '<p style="line-height:1.6"><strong>Contexto:</strong> ' + escapeHtml(story.context || '') + '</p>' +
    '<a href="' + escapeHtml(story.url || '#') + '" style="color:#0b766b;font-weight:bold">Ler fonte</a>' +
  '</article>';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.NOTIFY_SECRET || req.headers.authorization !== 'Bearer ' + process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const databaseName = process.env.MONGODB_NAME || process.env.MONGODB_DB_NAME;
  if (
    process.env.VERCEL_ENV !== 'preview' ||
    process.env.VERCEL_GIT_COMMIT_REF !== ALLOWED_BRANCH ||
    databaseName !== ALLOWED_DATABASE
  ) {
    return res.status(403).json({ error: 'Envio de teste permitido apenas no preview isolado.' });
  }

  try {
    await connectDatabase();

    const editionRows = await News.find().select('editionDate').lean();
    const latestEditionDate = editionRows
      .sort((a, b) => parseEditionDate(b.editionDate) - parseEditionDate(a.editionDate))[0]?.editionDate;

    if (!latestEditionDate || !parseEditionDate(latestEditionDate)) {
      return res.status(404).json({ error: 'Nenhuma edição válida encontrada no banco de teste.' });
    }

    const editionKey = calendarDateKey(latestEditionDate);
    const stories = (await News.find({ editionDate: latestEditionDate }).lean())
      .filter(story => calendarDateKey(story.publishedAt) === editionKey)
      .sort((a, b) => parseEditionDate(b.publishedAt) - parseEditionDate(a.publishedAt));

    if (!stories.length) {
      return res.status(404).json({ error: 'A edição de teste não contém notícias válidas.' });
    }

    const items = stories.map(buildStoryMarkup).join('');
    const textItems = stories.map(story =>
      (story.title || '') + '\n' + (story.summary || '') + '\nContexto: ' +
      (story.context || '') + '\nFonte: ' + (story.url || '')
    ).join('\n\n');

    const result = await sendEmail({
      kind: 'newsletter-test',
      to: TEST_RECIPIENT,
      subject: '[TESTE] King’s Newsletter — edição de ' + latestEditionDate,
      text: 'E-mail de teste da King’s Newsletter. Destinatário único: ' + TEST_RECIPIENT +
        '\n\nEdição de ' + latestEditionDate + '\n\n' + textItems,
      html: '<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px 16px;color:#1c2d2a;background:#f4f7f5">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;margin:0 0 24px">' +
          '<tr><td style="background:#064e46;padding:28px 24px;border-bottom:4px solid #f5c518;border-radius:12px 12px 0 0">' +
            '<div style="font-family:Georgia,serif;font-size:27px;line-height:1.2;font-weight:bold;color:#ffffff">King’s Newsletter</div>' +
            '<div style="font-size:11px;line-height:1.5;letter-spacing:2px;text-transform:uppercase;color:#f5c518;margin-top:8px">Notícias com contexto</div>' +
          '</td></tr>' +
          '<tr><td style="background:#ffffff;padding:16px 24px;border:1px solid #d8e5e1;border-top:0;border-radius:0 0 12px 12px">' +
            '<div style="font-size:15px;font-weight:bold;color:#1c2d2a">Prévia de teste</div>' +
            '<div style="font-size:13px;color:#536762;margin-top:4px">Edição de ' + escapeHtml(latestEditionDate) + '</div>' +
            '<div style="font-size:12px;color:#8a4b08;margin-top:8px">Mensagem de teste enviada somente para ' + TEST_RECIPIENT + '</div>' +
          '</td></tr>' +
        '</table>' +
        '<div style="background:#ffffff;padding:24px;border:1px solid #d8e5e1;border-radius:12px">' +
          items +
          '<p style="font-size:13px;color:#536762;text-align:center;margin:24px 0 0">Feito com café e JavaScript por Daniel Melo</p>' +
        '</div>' +
      '</div>'
    });

    const accepted = Array.isArray(result?.accepted) && result.accepted.some(
      address => String(address).trim().toLowerCase() === TEST_RECIPIENT
    );
    if (!accepted) {
      return res.status(502).json({ error: 'O servidor de e-mail não confirmou o destinatário de teste.' });
    }

    return res.status(200).json({
      sent: true,
      recipient: TEST_RECIPIENT,
      editionDate: latestEditionDate,
      stories: stories.length,
      messageId: result.messageId || null
    });
  } catch (error) {
    console.error(JSON.stringify({
      event: 'newsletter.test_email.failed',
      code: /^[A-Z0-9_]+$/.test(error?.code || '') ? error.code : 'TEST_EMAIL_FAILED'
    }));
    return res.status(500).json({ error: 'Não foi possível enviar o e-mail de teste.' });
  }
};
