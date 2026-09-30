const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

function parseDate(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year
  ) {
    return null;
  }

  return date;
}

function isValidDate(value) {
  return Boolean(parseDate(value));
}

function normalizeStory(story, editionDate) {
  return {
    editionDate,
    category: String(story.category || '').trim(),
    title: String(story.title || '').trim(),
    summary: String(story.summary || '').trim(),
    context: String(story.context || '').trim(),
    source: String(story.source || '').trim(),
    publishedAt: String(story.publishedAt || '').trim(),
    url: String(story.url || '').trim()
  };
}

function validateStory(story) {
  return story.category && story.title && story.summary && story.context &&
    story.source && story.publishedAt && /^https?:\/\//.test(story.url);
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    await connectDatabase();

    if (req.method === 'GET') {
      if (req.query.history === 'true') {
        const historyStories = await News.find().select('editionDate').lean();
        const historyMap = new Map();

        historyStories.forEach(story => {
          if (!historyMap.has(story.editionDate)) {
            historyMap.set(story.editionDate, 0);
          }
          historyMap.set(story.editionDate, historyMap.get(story.editionDate) + 1);
        });

        const history = [...historyMap.entries()]
          .map(([date, stories]) => ({ date, stories }))
          .sort((a, b) => parseDate(b.date) - parseDate(a.date));

        return res.status(200).json(
          history.map(archive => ({
            ...archive,
            title: 'Edição de ' + archive.date
          }))
        );
      }

      let date = req.query.date;
      if (date && !isValidDate(date)) {
        return res.status(400).json({ error: 'Data inválida.' });
      }

      if (!date) {
        const latest = await News.find().select('editionDate').lean();
        if (!latest.length) return res.status(200).json({ date: null, stories: [] });

        date = latest
          .sort((a, b) => parseDate(b.editionDate) - parseDate(a.editionDate))[0]
          .editionDate;
      }

      const stories = await News.find({ editionDate: date }).lean();
      stories.sort((a, b) => {
        const publishedA = parseDate(a.publishedAt);
        const publishedB = parseDate(b.publishedAt);

        if (!publishedA && !publishedB) return String(a._id).localeCompare(String(b._id));
        if (!publishedA) return 1;
        if (!publishedB) return -1;

        const difference = publishedB - publishedA;
        return difference || String(a._id).localeCompare(String(b._id));
      });

      return res.status(200).json({ date, stories });
    }

    if (!process.env.NOTIFY_SECRET || req.headers.authorization !== `Bearer ${process.env.NOTIFY_SECRET}`) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    const editionDate = String(req.body?.date || '').trim();
    const stories = Array.isArray(req.body?.stories) ? req.body.stories : [];

    if (!isValidDate(editionDate) || !stories.length) {
      return res.status(400).json({ error: 'Informe date e stories.' });
    }

    const normalized = stories.map(story => normalizeStory(story, editionDate));

    if (normalized.some(story => !validateStory(story))) {
      return res.status(400).json({ error: 'Uma ou mais notícias possuem campos inválidos.' });
    }

    const operations = normalized.map(story => ({
      updateOne: {
        filter: { url: story.url },
        update: { $set: story },
        upsert: true
      }
    }));

    const result = await News.bulkWrite(operations, { ordered: false });

    return res.status(200).json({
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error('Erro ao salvar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível salvar as notícias.' });
  }
};
