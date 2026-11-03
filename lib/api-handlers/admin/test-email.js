const { isSessionValid } = require('../../admin-auth');
const { connectDatabase } = require('../../db');
const News = require('../../news');
const { sendEmail } = require('../../email');
const { calendarDateKey } = require('../../news-date');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseDate(value) {
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
      '" width="616" style="display:block;width:100%;max-width:616px;height:auto;object-fit:contain;border:0;margin:0 0 18px" />'
    : '';

  return '<article style="padding:0 0 24px;margin:0 0 24px;border-bottom:1px solid #d8e5e1">' +
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

module.exports = async function testEmail(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });

  const recipient = String(req.body?.email || '').trim().toLowerCase();
  if (recipient.length > 254 || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(recipient)) {
    return res.status(400).json({ error: 'Informe um endereço de e-mail válido para receber o teste.' });
  }

  try {
    await connectDatabase();

    const editionRows = await News.find().select('editionDate').lean();
    const latestEditionDate = editionRows
      .sort((a, b) => parseDate(b.editionDate) - parseDate(a.editionDate))[0]?.editionDate;

    if (!latestEditionDate || !parseDate(latestEditionDate)) {
      return res.status(404).json({ error: 'Nenhuma edição válida encontrada.' });
    }

    const editionKey = calendarDateKey(latestEditionDate);
    const stories = (await News.find({ editionDate: latestEditionDate }).lean())
      .filter(story => calendarDateKey(story.publishedAt) === editionKey)
      .sort((a, b) => parseDate(b.publishedAt) - parseDate(a.publishedAt));

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
      to: recipient,
      subject: '[TESTE] King’s Newsletter — edição de ' + latestEditionDate,
      text: 'Prévia de teste da King’s Newsletter — edição de ' + latestEditionDate +
        '\n\n' + textItems + '\n\nEsta mensagem é um teste e não foi enviada aos assinantes.',
      html: '<div style="font-family:Arial,sans-serif;width:100%;max-width:680px;margin:0 auto;padding:32px;box-sizing:border-box;color:#1c2d2a;background:#ffffff">' +
        '<div style="background:#064e46;padding:0;margin:0 0 16px;border-bottom:3px solid #f5c518">' +
          '<img src="https://cdn.shardcloud.app/4d7d8031-4b99-4759-afbc-1e01575b29d6/King_s_Newsletter_faixa_20261029_074825_0000.png" alt="King’s Newsletter — edição especial de Halloween" width="616" style="display:block;width:100%;max-width:616px;height:auto;border:0;margin:0 auto" />' +
        '</div>' +
        '<p style="color:#536762">Prévia de teste — edição de ' + escapeHtml(latestEditionDate) + '</p>' +
        '<p style="font-size:12px;color:#8a4b08">Mensagem de teste — não enviada aos assinantes.</p>' +
        items +
        '<p style="font-size:12px;color:#536762">Feito com café e JavaScript por Daniel Melo</p>' +
      '</div>'
    });

    const accepted = Array.isArray(result?.accepted) && result.accepted.some(
      address => String(address).trim().toLowerCase() === recipient.toLowerCase()
    );
    if (!accepted) {
      return res.status(502).json({ error: 'O servidor de e-mail não confirmou o destinatário de teste.' });
    }

    return res.status(200).json({
      sent: true,
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
