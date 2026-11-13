const { DEFAULT_BANNER_URL, DEFAULT_BANNER_ALT } = require('./newsletter-settings');

const DEFAULT_INTRO_TITLE = 'Os acontecimentos que merecem sua atenção.';
const DEFAULT_INTRO_TEXT = 'Um resumo dos principais fatos do Brasil e do mundo, com contexto para entender o que realmente está acontecendo.';
// Título do bloco de contexto quando a matéria não traz o próprio (`contextLabel`
// ou uma pergunta curta na primeira linha do texto).
const DEFAULT_CONTEXT_LABEL = 'Além da manchete';
const MAX_CONTEXT_LABEL = 80;

const COLORS = {
  page: '#eef2f1',
  card: '#ffffff',
  brand: '#064e46',
  brandText: '#0f4a40',
  ink: '#1f2d2a',
  body: '#3b4a46',
  muted: '#7b8a86',
  line: '#dfe7e4',
  link: '#0b766b',
  softBox: '#eef3f1'
};

// Pill colors per category family: [background, text].
const CATEGORY_TONES = [
  { match: /segurança|guerra|conflito|defesa|internacional|geopol/i, tone: ['#fde8e7', '#b4362c'] },
  { match: /brasil|política|governo|congresso|eleiç/i, tone: ['#e3effc', '#1f5fa8'] },
  { match: /meio ambiente|clima|sustentab|energia/i, tone: ['#e2f4e8', '#1d7a43'] },
  { match: /economia|mercado|finanç|investiment/i, tone: ['#fdf1dc', '#a1620b'] },
  { match: /saúde|ciência/i, tone: ['#f1e8fb', '#6b3fa0'] },
  { match: /tecnologia|\bia\b|inteligência artificial/i, tone: ['#e6ecfb', '#3448a8'] }
];
const DEFAULT_TONE = ['#e2f4ef', '#0b766b'];

const { editionKey } = require('./digest-schedule');

const FONT = "Arial,'Helvetica Neue',Helvetica,sans-serif";

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeHttpUrl(value, { httpsOnly = false } = {}) {
  try {
    const url = new URL(String(value || ''));
    const allowed = httpsOnly ? ['https:'] : ['http:', 'https:'];
    return allowed.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function formatEditionDate(editionDate) {
  const match = editionKey(editionDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(editionDate || '');
}

function paragraphs(text) {
  return String(text || '').split(/\n\s*\n|\n/).map(part => part.trim()).filter(Boolean);
}

function listItems(value) {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
  return paragraphs(value);
}

function orderedStories(digest) {
  return [...(digest.stories || [])]
    .filter(story => story && story.title)
    .sort((a, b) => (a.editorialRank ?? Number.MAX_SAFE_INTEGER) - (b.editorialRank ?? Number.MAX_SAFE_INTEGER));
}

function categoryTone(category) {
  return CATEGORY_TONES.find(entry => entry.match.test(category || ''))?.tone || DEFAULT_TONE;
}

function pill(label, [background, color]) {
  return '<span style="display:inline-block;padding:3px 9px;border-radius:99px;background:' + background +
    ';color:' + color + ';font:bold 10px/1.4 ' + FONT + ';letter-spacing:.6px;text-transform:uppercase">' +
    escapeHtml(label) + '</span>';
}

function paragraphHtml(text) {
  return '<p style="margin:0 0 12px;color:' + COLORS.body + ';font:14px/1.65 ' + FONT + '">' + escapeHtml(text) + '</p>';
}

// Rótulo escolhido para a matéria (ex.: "Quem paga a conta"); vazio se ausente ou longo demais.
function contextLabelOf(story) {
  const label = typeof story?.contextLabel === 'string' ? story.contextLabel.trim() : '';
  return label.length <= MAX_CONTEXT_LABEL ? label : '';
}

function sectionHtml(title, text, { label = '' } = {}) {
  // The editorial text may open with its own heading ("Por que importa?",
  // "O que merece atenção?"); use it as the title instead of repeating one.
  // An explicit label wins over both.
  const parts = paragraphs(text);
  if (parts.length > 1 && /\?$/.test(parts[0]) && parts[0].length <= 80) {
    const question = parts.shift();
    if (!label) title = question;
  }
  if (label) title = label;
  if (!parts.length) return '';
  return '<p style="margin:16px 0 8px;color:' + COLORS.ink + ';font:bold 14px/1.4 ' + FONT + '">' + escapeHtml(title) + '</p>' +
    parts.map(paragraphHtml).join('');
}

function imageHtml(story) {
  const url = safeHttpUrl(story.image?.url, { httpsOnly: true });
  if (!url) return '';
  const alt = story.image?.alt || story.title || '';
  return '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(alt) + '" width="584" style="display:block;width:100%;max-width:584px;height:auto;border:0;border-radius:12px;margin:12px 0 0" />';
}

function storyHtml(story, { dateLabel, isLast }) {
  const url = safeHttpUrl(story.articleUrl);
  const meta = [story.source, dateLabel].filter(Boolean).join(' · ');
  const extraSections = Array.isArray(story.sections) ? story.sections : [];
  return '<tr><td style="padding:22px 28px 0">' +
    (story.category ? pill(story.category, categoryTone(story.category)) : '') +
    imageHtml(story) +
    '<h2 style="margin:14px 0 6px;color:' + COLORS.brandText + ';font:bold 19px/1.3 ' + FONT + '">' + escapeHtml(story.title) + '</h2>' +
    (meta ? '<p style="margin:0 0 12px;color:' + COLORS.muted + ';font:11px/1.4 ' + FONT + ';text-transform:uppercase;letter-spacing:.3px">' + escapeHtml(meta) + '</p>' : '') +
    paragraphs(story.summary).map(paragraphHtml).join('') +
    extraSections.map(section => sectionHtml(section?.title || '', section?.text || '')).join('') +
    sectionHtml(DEFAULT_CONTEXT_LABEL, story.context, { label: contextLabelOf(story) }) +
    (url ? '<p style="margin:14px 0 4px;font:bold 13px/1.4 ' + FONT + '"><a href="' + escapeHtml(url) + '" style="color:' + COLORS.link + ';text-decoration:none">' +
      escapeHtml(story.ctaLabel || 'Leia a matéria completa') + ' &#8599;</a></p>' : '') +
    (story.source ? '<p style="margin:0;color:' + COLORS.muted + ';font:11px/1.4 ' + FONT + '">Fontes: ' + escapeHtml(story.source) + '</p>' : '') +
    (isLast ? '' : '<div style="height:1px;margin:22px 0 0;background:' + COLORS.line + ';line-height:1px;font-size:1px">&nbsp;</div>') +
  '</td></tr>';
}

function contextText(context, label = '') {
  const parts = paragraphs(context);
  const question = parts.length > 1 && /\?$/.test(parts[0]) && parts[0].length <= 80 ? parts.shift() : '';
  const title = label || question || DEFAULT_CONTEXT_LABEL;
  // Sem pontuação no rótulo, separa do texto com dois-pontos.
  return `${title}${/[?:!.]$/.test(title) ? '' : ':'} ${parts.join(' ')}`;
}

function storyText(story, index) {
  return [
    `${index + 1}. ${story.title}`,
    ...paragraphs(story.summary),
    ...(Array.isArray(story.sections) ? story.sections : []).flatMap(section => section?.title ? [`${section.title}`, ...paragraphs(section.text)] : []),
    story.context ? contextText(story.context, contextLabelOf(story)) : '',
    story.source ? `Fontes: ${story.source}` : '',
    safeHttpUrl(story.articleUrl)
  ].filter(Boolean).join('\n');
}

/**
 * Renders the daily digest email. `unsubscribeUrl` is per recipient; tests
 * and previews omit it and pass `mode` so the footer says what the copy is.
 * Stories show `image` ({ url, alt }) only when the digest itself defines it.
 * `banner` ({ url, alt }) comes from the admin settings; https only.
 */
function renderDigestEmail(digest, { appUrl, unsubscribeUrl = '', mode = 'subscriber', banner = null } = {}) {
  const bannerUrl = safeHttpUrl(banner?.url, { httpsOnly: true }) || DEFAULT_BANNER_URL;
  const bannerAlt = banner?.alt || DEFAULT_BANNER_ALT;
  const stories = orderedStories(digest);
  const dateLabel = formatEditionDate(digest.editionDate);
  const siteUrl = safeHttpUrl(appUrl);
  const isTest = mode === 'test';
  const subject = (isTest ? '[TESTE] ' : '') + (digest.subject || `King's Newsletter — ${dateLabel}`);
  const watchNext = listItems(digest.watchNext);
  const year = editionKey(digest.editionDate).slice(0, 4) || String(new Date().getFullYear());

  const notice = mode === 'subscriber'
    ? ''
    : '<tr><td style="padding:10px 28px;background:#fff6e5;color:#8a4b08;font:bold 12px/1.4 ' + FONT + ';text-align:center">' +
      (isTest ? 'Mensagem de teste — não enviada aos assinantes.' : 'Prévia — não enviada aos assinantes.') + '</td></tr>';

  const intro = '<tr><td style="padding:24px 28px 0">' +
    pill('Edição diária · ' + dateLabel, DEFAULT_TONE) +
    '<h1 style="margin:12px 0 6px;color:' + COLORS.brandText + ';font:bold 22px/1.3 ' + FONT + '">' + escapeHtml(digest.introTitle || DEFAULT_INTRO_TITLE) + '</h1>' +
    '<p style="margin:0;color:' + COLORS.body + ';font:14px/1.6 ' + FONT + '">' + escapeHtml(digest.intro || DEFAULT_INTRO_TEXT) + '</p>' +
    '<div style="height:1px;margin:22px 0 0;background:' + COLORS.line + ';line-height:1px;font-size:1px">&nbsp;</div>' +
  '</td></tr>';

  const watchNextBox = watchNext.length
    ? '<tr><td style="padding:24px 28px 0"><div style="padding:18px 20px;border-radius:12px;background:' + COLORS.softBox + '">' +
      '<p style="margin:0 0 10px;color:' + COLORS.brandText + ';font:bold 17px/1.3 ' + FONT + '">' + escapeHtml(digest.watchNextTitle || 'O que acompanhar amanhã?') + '</p>' +
      '<ul style="margin:0;padding:0 0 0 20px;color:' + COLORS.body + ';font:14px/1.7 ' + FONT + '">' +
        watchNext.map(item => '<li>' + escapeHtml(item) + '</li>').join('') +
      '</ul></div></td></tr>'
    : '';

  const cta = siteUrl
    ? '<tr><td style="padding:16px 28px 0"><div style="padding:22px 20px;border-radius:12px;background:' + COLORS.brand + ';text-align:center">' +
      '<p style="margin:0 0 6px;color:#ffffff;font:bold 17px/1.3 ' + FONT + '">A notícia não termina aqui.</p>' +
      '<p style="margin:0 0 16px;color:#d6ebe5;font:13px/1.5 ' + FONT + '">Acompanhe as atualizações, leia as análises completas e fique por dentro dos acontecimentos em tempo real.</p>' +
      '<a href="' + escapeHtml(siteUrl) + '" style="display:inline-block;padding:11px 20px;border-radius:8px;background:#ffffff;color:' + COLORS.brand + ';font:bold 12px/1 ' + FONT + ';letter-spacing:.4px;text-decoration:none;text-transform:uppercase">Acessar a King\'s Newsletter &rarr;</a>' +
      '</div></td></tr>'
    : '';

  const footer = '<tr><td style="padding:22px 28px 26px;text-align:center">' +
    '<p style="margin:0 0 4px;color:' + COLORS.brandText + ';font:bold 15px/1.3 ' + FONT + ';letter-spacing:.5px">KING\'S NEWSLETTER</p>' +
    '<p style="margin:0 0 10px;color:' + COLORS.muted + ';font:12px/1.5 ' + FONT + '">Informação com contexto.</p>' +
    (mode === 'subscriber'
      ? '<p style="margin:0 0 4px;color:' + COLORS.muted + ';font:11px/1.5 ' + FONT + '">Você recebeu este informativo por estar inscrito em nossa newsletter.</p>' +
        (unsubscribeUrl ? '<p style="margin:0 0 4px;font:11px/1.5 ' + FONT + '"><a href="' + escapeHtml(unsubscribeUrl) + '" style="color:' + COLORS.link + '">Cancelar inscrição</a></p>' : '')
      : '') +
    '<p style="margin:0;color:' + COLORS.muted + ';font:11px/1.5 ' + FONT + '">© ' + escapeHtml(year) + ' King\'s Newsletter</p>' +
  '</td></tr>';

  const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>' + escapeHtml(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + COLORS.page + '">' +
    (digest.preheader ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + escapeHtml(digest.preheader) + '</div>' : '') +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + COLORS.page + '"><tr><td align="center" style="padding:24px 12px">' +
      '<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:' + COLORS.card + ';border-radius:14px;overflow:hidden;border-collapse:separate">' +
        '<tr><td style="background:' + COLORS.brand + ';border-bottom:3px solid #f5c518;padding:0">' +
          '<img src="' + escapeHtml(bannerUrl) + '" alt="' + escapeHtml(bannerAlt) + '" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0" />' +
        '</td></tr>' +
        notice +
        intro +
        stories.map((story, index) => storyHtml(story, { dateLabel, isLast: index === stories.length - 1 })).join('') +
        watchNextBox +
        cta +
        footer +
      '</table>' +
    '</td></tr></table></body></html>';

  const text = [
    `KING'S NEWSLETTER — EDIÇÃO DIÁRIA ${dateLabel}`,
    isTest ? '[Mensagem de teste — não enviada aos assinantes]' : '',
    digest.introTitle || DEFAULT_INTRO_TITLE,
    stories.map(storyText).join('\n\n'),
    watchNext.length ? `${digest.watchNextTitle || 'O que acompanhar amanhã?'}\n${watchNext.map(item => `- ${item}`).join('\n')}` : '',
    siteUrl ? `Acesse a King's Newsletter: ${siteUrl}` : '',
    unsubscribeUrl ? `Cancelar inscrição: ${unsubscribeUrl}` : ''
  ].filter(Boolean).join('\n\n');

  return { subject, html, text, storyCount: stories.length };
}

module.exports = { renderDigestEmail, formatEditionDate, escapeHtml };
