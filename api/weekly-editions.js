const { connectDatabase } = require('../lib/db');
const WeeklyEdition = require('../lib/weekly-edition');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const slug = typeof req.query?.slug === 'string' ? req.query.slug.trim().toLowerCase() : '';

  if (slug && !SLUG_PATTERN.test(slug)) {
    return res.status(400).json({ error: 'Identificador de edição inválido.' });
  }

  try {
    await connectDatabase();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    if (slug) {
      const edition = await WeeklyEdition.findOne({ slug, status: 'published' }).lean();
      if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });
      return res.status(200).json({ edition });
    }

    const editions = await WeeklyEdition.find({ status: 'published' })
      .sort({ weekStart: -1, publishedAt: -1 })
      .limit(24)
      .lean();

    return res.status(200).json({ editions });
  } catch (error) {
    console.error('Erro ao consultar edições semanais:', error);
    return res.status(500).json({ error: 'Não foi possível carregar as edições semanais.' });
  }
};
