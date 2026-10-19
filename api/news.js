const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

function parseDate(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
  }

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
  return typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value) && Boolean(parseDate(value));
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
    url: String(story.url || '').trim(),
    headline: Boolean(story.headline)
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
      const latestRows = await News.aggregate([
        { $addFields: { _editionSort: { $dateFromString: { dateString: '$editionDate', format: '%d/%m/%Y', onError: null, onNull: null } } } },
        { $match: { _editionSort: { $ne: null } } }, { $sort: { _editionSort: -1 } }, { $limit: 1 },
        { $project: { _id: 0, editionDate: 1 } }
      ]);
      const latestDate = latestRows[0]?.editionDate || null;
      if (req.query.history === 'true') {
        const pipeline = [
          { $addFields: { _editionSort: { $dateFromString: { dateString: '$editionDate', format: '%d/%m/%Y', onError: null, onNull: null } } } },
          { $match: { _editionSort: { $ne: null } } }
        ];
        pipeline.push(
          { $group: { _id: '$editionDate', stories: { $sum: 1 }, _editionSort: { $max: '$_editionSort' } } },
          { $sort: { _editionSort: -1 } },
          { $project: { _id: 0, date: '$_id', stories: 1, title: { $concat: ['Edição de ', '$_id'] } } }
        );
        return res.status(200).json(await News.aggregate(pipeline));
      }

      let date = req.query.date;
      if (date && !isValidDate(date)) {
        return res.status(400).json({ error: 'Data inválida.' });
      }

      if (!date) {
        if (!latestDate) return res.status(200).json({ date: null, stories: [] });
        date = latestDate;
      }

      const filter = { editionDate: date };
      const stories = await News.aggregate([
        { $match: filter },
        { $addFields: { _publishedSort: { $dateFromString: { dateString: '$publishedAt', format: '%d/%m/%Y', onError: null, onNull: null } } } },
        { $sort: { headline: -1, _publishedSort: -1, _id: -1 } },
        { $project: { _publishedSort: 0 } }
      ]);
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
        filter: { editionDate: story.editionDate, url: story.url },
        update: { $set: story },
        upsert: true
      }
    }));

    const result = await News.bulkWrite(operations, { ordered: false });

    return res.status(200).json({
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      notification: null
    });
  } catch (error) {
    console.error('Erro ao salvar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível salvar as notícias.' });
  }
};
