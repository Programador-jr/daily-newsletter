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

function getLatestEditionDate(stories) {
  return stories
    .map(story => story.editionDate)
    .filter(isValidDate)
    .sort((a, b) => parseDate(b) - parseDate(a))[0] || null;
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
      const editionMetadata = await News.find().select('editionDate publishedAt').lean();
      const latestDate = getLatestEditionDate(editionMetadata);

      if (req.query.history === 'true') {
        const historyMap = new Map();

        editionMetadata.forEach(story => {
          // A edição mais recente representa o boletim do próprio dia.
          // Registros de dias anteriores permanecem no banco e no histórico,
          // mas não inflacionam a contagem da edição atual.
          if (story.editionDate === latestDate && story.publishedAt && story.publishedAt !== latestDate) {
            return;
          }

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
        if (!latestDate) return res.status(200).json({ date: null, stories: [] });
        date = latestDate;
      }

      const editionStories = await News.find({ editionDate: date }).lean();
      // A edição atual só deve mostrar notícias publicadas na data da edição.
      // Edições antigas continuam usando editionDate para preservar o arquivo
      // exatamente como foi publicado.
      const stories = date === latestDate
        ? editionStories.filter(story => story.publishedAt === date)
        : editionStories;

      stories.sort((a, b) => {
        const publishedA = parseDate(a.publishedAt);
        const publishedB = parseDate(b.publishedAt);

        if (!publishedA && !publishedB) return String(a._id).localeCompare(String(b._id));
        if (!publishedA) return 1;
        if (!publishedB) return -1;

        const headlineB = Boolean(b.headline);
        const headlineA = Boolean(a.headline);
        if (headlineB !== headlineA) {
          return headlineA ? -1 : 1;
        }

        const difference = publishedB - publishedA;
        return difference || String(b._id).localeCompare(String(a._id));
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
