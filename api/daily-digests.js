const { connectDatabase } = require('../lib/db');
const DailyDigest = require('../lib/daily-digest');
const Edition = require('../lib/edition');
const { editionKey, editionDateVariants } = require('../lib/digest-schedule');
const { calendarDateKey } = require('../lib/news-date');

// Só resumos já enviados aos assinantes são públicos; rascunhos e aprovados ficam no admin.
const PUBLISHED = { status: 'sent' };
const ARCHIVE_LIMIT = 90;
const PUBLIC_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=600';
const ARCHIVE_FIELDS = 'editionDate headline subject preheader storyCount sentAt createdAt stories.title stories.category';

const text = value => (typeof value === 'string' ? value.trim() : '');
const list = value => (Array.isArray(value) ? value : []);

const isoDate = value => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const safeUrl = value => (/^https?:\/\//i.test(text(value)) ? text(value) : '');

// watchNext pode vir como texto (um item por linha) ou lista de textos.
const watchItems = value => {
  const items = Array.isArray(value) ? value : String(value || '').split(/\r?\n/);
  return items.map(item => text(String(item ?? '')).replace(/^[*•\-–]\s+/, '')).filter(Boolean);
};

const dayFirst = key => {
  const [year, month, day] = key.split('-');
  return `${day}/${month}/${year}`;
};

const identity = (digest, issueByDate) => {
  const date = editionKey(digest.editionDate);
  return {
    date,
    issueNumber: issueByDate.get(dayFirst(date)) ?? null,
    title: text(digest.headline) || text(digest.subject),
    preheader: text(digest.preheader),
    sentAt: isoDate(digest.sentAt)
  };
};

const toArchiveItem = (digest, issueByDate) => {
  const stories = list(digest.stories);
  return {
    ...identity(digest, issueByDate),
    storyCount: stories.length || digest.storyCount || 0,
    categories: [...new Set(stories.map(story => text(story.category)).filter(Boolean))]
  };
};

const toPublicStory = story => {
  const image = story.image && safeUrl(story.image.url)
    ? {
        url: safeUrl(story.image.url),
        alt: text(story.image.alt),
        caption: text(story.image.caption),
        credit: text(story.image.credit)
      }
    : null;
  return {
    category: text(story.category),
    title: text(story.title),
    summary: text(story.summary),
    context: text(story.context),
    contextLabel: text(story.contextLabel).length <= 80 ? text(story.contextLabel) : '',
    source: text(story.source),
    url: safeUrl(story.articleUrl || story.url),
    image
  };
};

const rankOf = story => (Number.isFinite(story.editorialRank) ? story.editorialRank : Number.MAX_SAFE_INTEGER);

// Formato público: o texto como foi enviado, sem snapshots, notas editoriais nem dados de entrega.
const toPublicDigest = (digest, issueByDate) => ({
  ...identity(digest, issueByDate),
  stories: list(digest.stories)
    .map((story, index) => ({ story, index }))
    .sort((a, b) => rankOf(a.story) - rankOf(b.story) || a.index - b.index)
    .map(({ story }) => toPublicStory(story))
    .filter(story => story.title),
  watchNext: watchItems(digest.watchNext)
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const requested = typeof req.query?.date === 'string' ? req.query.date.trim() : '';
  const dateKey = requested ? calendarDateKey(requested) : null;
  if (requested && (!dateKey || !/^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/.test(requested))) {
    return res.status(400).json({ error: 'Data inválida.' });
  }

  try {
    await connectDatabase();

    const rows = await DailyDigest.find(PUBLISHED).select(ARCHIVE_FIELDS)
      .sort({ sentAt: -1, createdAt: -1 }).limit(ARCHIVE_LIMIT).lean();

    // A data pode estar gravada como DD/MM/AAAA ou AAAA-MM-DD; um resumo por dia, o mais recente.
    const byDate = new Map();
    list(rows).forEach(row => {
      const key = editionKey(row.editionDate);
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && !byDate.has(key)) byDate.set(key, row);
    });
    const archiveRows = [...byDate.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([, row]) => row);

    const targetKey = dateKey || (archiveRows[0] ? editionKey(archiveRows[0].editionDate) : null);
    const [digest, editions] = await Promise.all([
      targetKey
        ? DailyDigest.findOne({ ...PUBLISHED, editionDate: { $in: editionDateVariants(targetKey) } })
          .select('-htmlSnapshot -textSnapshot -editorialNotes -delivery').sort({ sentAt: -1 }).lean()
        : null,
      byDate.size
        ? Edition.find({ editionDate: { $in: [...byDate.keys()].map(dayFirst) } }).lean()
        : []
    ]);
    const issueByDate = new Map(list(editions).map(item => [item.editionDate, item.issueNumber]));

    if (dateKey && !digest) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ error: 'Resumo não encontrado.' });
    }

    res.setHeader('Cache-Control', PUBLIC_CACHE);
    return res.status(200).json({
      digest: digest ? toPublicDigest(digest, issueByDate) : null,
      digests: archiveRows.map(row => toArchiveItem(row, issueByDate))
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    console.error('Erro ao consultar resumos diários:', error);
    return res.status(500).json({ error: 'Não foi possível carregar os resumos diários.' });
  }
};
