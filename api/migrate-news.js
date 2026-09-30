const fs = require('fs');
const path = require('path');
const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

function normalize(story, editionDate) {
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.NOTIFY_SECRET || req.headers.authorization !== `Bearer ${process.env.NOTIFY_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const dataDirectory = path.resolve(process.cwd(), 'data');
    const archiveDirectory = path.join(dataDirectory, 'archive');
    const files = [];

    const currentFile = path.join(dataDirectory, 'news.json');
    if (fs.existsSync(currentFile)) files.push(currentFile);

    if (fs.existsSync(archiveDirectory)) {
      for (const file of fs.readdirSync(archiveDirectory)) {
        if (/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
          files.push(path.join(archiveDirectory, file));
        }
      }
    }

    const operations = [];

    for (const file of files) {
      const edition = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!edition.date || !Array.isArray(edition.stories)) continue;

      for (const story of edition.stories) {
        const normalized = normalize(story, edition.date);
        if (!normalized.url || !normalized.title) continue;

        operations.push({
          updateOne: {
            filter: { url: normalized.url },
            update: { $set: normalized },
            upsert: true
          }
        });
      }
    }

    await connectDatabase();

    const result = operations.length
      ? await News.bulkWrite(operations, { ordered: false })
      : { upsertedCount: 0, modifiedCount: 0 };

    return res.status(200).json({
      files: files.length,
      stories: operations.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error('Erro ao migrar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível migrar as notícias.' });
  }
};
