const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const Edition = require('../lib/edition');
const { ensureEdition } = require('../lib/edition-numbering');

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

function calendarDateKey(value) {
  if (typeof value !== 'string') return null;
  const dayFirst = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dayFirst) {
    if (!parseDate(value)) return null;
    return `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Rio_Branco', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function publishedDateStages() {
  return [
    {
      $addFields: {
        _publishedSort: {
          $let: {
            vars: { publishedAt: { $ifNull: ['$publishedAt', ''] } },
            in: {
              $switch: {
                branches: [
                  {
                    case: { $regexMatch: { input: '$$publishedAt', regex: /^\d{2}\/\d{2}\/\d{4}$/ } },
                    then: { $dateFromString: { dateString: '$$publishedAt', format: '%d/%m/%Y', timezone: 'America/Rio_Branco', onError: null, onNull: null } }
                  },
                  {
                    case: { $regexMatch: { input: '$$publishedAt', regex: /^\d{4}-\d{2}-\d{2}$/ } },
                    then: { $dateFromString: { dateString: '$$publishedAt', format: '%Y-%m-%d', timezone: 'America/Rio_Branco', onError: null, onNull: null } }
                  }
                ],
                default: { $dateFromString: { dateString: '$$publishedAt', onError: null, onNull: null } }
              }
            }
          }
        }
      }
    },
    {
      $addFields: {
        _publishedDay: {
          $dateToString: {
            date: '$_publishedSort', format: '%d/%m/%Y', timezone: 'America/Rio_Branco', onNull: null
          }
        }
      }
    }
  ];
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
          { $match: { _editionSort: { $ne: null } } },
          ...publishedDateStages(),
          { $match: { $expr: { $eq: ['$_publishedDay', '$editionDate'] } } }
        ];
        pipeline.push(
          { $group: { _id: '$editionDate', stories: { $sum: 1 }, _editionSort: { $max: '$_editionSort' } } },
          { $sort: { _editionSort: -1 } },
          { $project: { _id: 0, date: '$_id', stories: 1, title: { $concat: ['Edição de ', '$_id'] } } }
        );
        const archives = await News.aggregate(pipeline);
        const editionDates = archives.map(archive => archive.date);
        const editionRecords = editionDates.length
          ? await Edition.find({ editionDate: { $in: editionDates } }).lean()
          : [];
        const issueByDate = new Map(editionRecords.map(item => [item.editionDate, item.issueNumber]));
        return res.status(200).json(archives.map(archive => ({
          ...archive,
          issueNumber: issueByDate.get(archive.date) ?? null,
          title: issueByDate.has(archive.date)
            ? 'Edição #' + String(issueByDate.get(archive.date)).padStart(3, '0')
            : archive.title
        })));
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
        ...publishedDateStages(),
        { $match: { $expr: { $eq: ['$_publishedDay', '$editionDate'] } } },
        { $sort: { _publishedSort: -1, headline: -1, _id: -1 } },
        { $project: { _publishedSort: 0, _publishedDay: 0 } }
      ]);
      const edition = await Edition.findOne({ editionDate: date }).lean();
      return res.status(200).json({ date, issueNumber: edition?.issueNumber ?? null, stories });
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

    const editionDateKey = calendarDateKey(editionDate);
    const editionStories = normalized.filter(story => calendarDateKey(story.publishedAt) === editionDateKey);
    if (!editionStories.length) {
      return res.status(400).json({ error: 'Nenhuma notícia corresponde à data da edição.' });
    }

    const operations = editionStories.map(story => ({
      updateOne: {
        filter: { editionDate: story.editionDate, url: story.url },
        update: { $set: story },
        upsert: true
      }
    }));

    const result = await News.bulkWrite(operations, { ordered: false });
    const edition = await ensureEdition(editionDate);

    return res.status(200).json({
      issueNumber: edition.issueNumber,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      skipped: normalized.length - editionStories.length,
      notification: null
    });
  } catch (error) {
    console.error('Erro ao salvar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível salvar as notícias.' });
  }
};
