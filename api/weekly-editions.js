const { connectDatabase } = require('../lib/db');
const WeeklyEdition = require('../lib/weekly-edition');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLISHED = { status: 'published' };
const NEWEST_FIRST = { weekStart: -1, publishedAt: -1 };
const ARCHIVE_LIMIT = 52;
const PUBLIC_CACHE = 'public, s-maxage=300, stale-while-revalidate=600';

// O arquivo só precisa de identificação e contagens; o texto vem na edição aberta.
const ARCHIVE_FIELDS = 'slug editionNumber title subtitle weekStart weekEnd publishedAt sections.title sections.stories.title';

const text = value => (typeof value === 'string' ? value.trim() : '');
const list = value => (Array.isArray(value) ? value : []);

// Aceita Date ou string (documentos editados direto no banco) e devolve ISO.
const isoDate = value => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const identity = edition => ({
  slug: edition.slug,
  editionNumber: Number.isFinite(edition.editionNumber) ? edition.editionNumber : null,
  title: text(edition.title),
  subtitle: text(edition.subtitle),
  weekStart: isoDate(edition.weekStart),
  weekEnd: isoDate(edition.weekEnd),
  publishedAt: isoDate(edition.publishedAt)
});

const toArchiveItem = edition => {
  const sections = list(edition.sections);
  return {
    ...identity(edition),
    sectionCount: sections.length,
    storyCount: sections.reduce((total, section) => total + list(section.stories).length, 0)
  };
};

// Formato público do resumo semanal: o texto como foi escrito, sem campos internos.
const toPublicEdition = edition => ({
  ...identity(edition),
  intro: text(edition.intro),
  sections: list(edition.sections).map(section => ({
    title: text(section.title),
    intro: text(section.intro),
    stories: list(section.stories).map(story => ({
      title: text(story.title),
      summary: text(story.summary),
      context: text(story.context),
      source: text(story.source),
      url: text(story.url),
      imageUrl: text(story.imageUrl)
    }))
  })),
  analysis: text(edition.analysis)
});

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

    const [archive, edition] = await Promise.all([
      WeeklyEdition.find(PUBLISHED).select(ARCHIVE_FIELDS).sort(NEWEST_FIRST).limit(ARCHIVE_LIMIT).lean(),
      (slug
        ? WeeklyEdition.findOne({ slug, ...PUBLISHED })
        : WeeklyEdition.findOne(PUBLISHED).sort(NEWEST_FIRST)
      ).lean()
    ]);

    if (slug && !edition) {
      // Sem cache: a edição pode ser publicada logo em seguida.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ error: 'Edição não encontrada.' });
    }

    res.setHeader('Cache-Control', PUBLIC_CACHE);
    return res.status(200).json({
      edition: edition ? toPublicEdition(edition) : null,
      editions: list(archive).map(toArchiveItem)
    });
  } catch (error) {
    console.error('Erro ao consultar edições semanais:', error);
    return res.status(500).json({ error: 'Não foi possível carregar as edições semanais.' });
  }
};
