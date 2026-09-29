const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

function isValidDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    await connectDatabase();

    if (req.query.history === 'true') {
      const history = await News.aggregate([
        { $group: { _id: '$editionDate', stories: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $project: { _id: 0, date: '$_id', title: { $concat: ['Edição de ', '$_id'] }, stories: 1 } }
      ]);
      return res.status(200).json(history);
    }

    let date = req.query.date;
    if (date && !isValidDate(date)) {
      return res.status(400).json({ error: 'Data inválida.' });
    }

    if (!date) {
      const latest = await News.findOne().sort({ editionDate: -1 }).select('editionDate').lean();
      if (!latest) return res.status(200).json({ date: null, stories: [] });
      date = latest.editionDate;
    }

    const stories = await News.find({ editionDate: date })
      .sort({ publishedAt: -1, _id: 1 })
      .lean();

    return res.status(200).json({ date, stories });
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível carregar as notícias.' });
  }
};
