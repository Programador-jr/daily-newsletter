const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

function isValidDate(value) {
  return typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value);
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
        const history = await News.aggregate([
          {
            $group: {
              _id: '$editionDate',
              stories: { $sum: 1 }
            }
          },
          {
            $addFields: {
              sortDate: {
                $dateFromString: {
                  date: '$_id',
                  format: '%d/%m/%Y'
                }
              }
            }
          },
          { $sort: { sortDate: -1 } },
          { $project: { _id: 0, date: '$_id', stories: 1 } }
        ]);

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
        const latest = await News.aggregate([
          {
            $addFields: {
              sortDate: {
                $dateFromString: {
                  date: '$editionDate',
                  format: '%d/%m/%Y'
                }
              }
            }
          },
          { $sort: { sortDate: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, editionDate: 1 } }
        ]);

        if (!latest.length) return res.status(200).json({ date: null, stories: [] });
        date = latest[0].editionDate;
      }

      const stories = await News.aggregate([
        { $match: { editionDate: date } },
        {
          $addFields: {
            publishedAtSort: {
              $dateFromString: {
                date: '$publishedAt',
                format: '%d/%m/%Y'
              }
            }
          }
        },
        { $sort: { publishedAtSort: -1, _id: 1 } },
        { $project: { publishedAtSort: 0 } }
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
