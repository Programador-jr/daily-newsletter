const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const Edition = require('../lib/edition');
const { ensureEdition } = require('../lib/edition-numbering');
const { validatePublicHttpsUrl } = require('../lib/r2');
const { isBearerAuthorized } = require('../lib/bearer-auth');
const { setPublicCache } = require('../lib/public-cache');

// Leituras públicas ficam na CDN: uma edição nova aparece em até 5 minutos,
// e o Mongo deixa de ser consultado a cada visita da home e do arquivo.
const NEWS_CDN_SECONDS = 300;
const NEWS_STALE_SECONDS = 86400;
const MAX_EXTERNAL_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
]);
const IMAGE_KINDS = new Set([
  'original', 'contextual_archive', 'illustrative_archive', 'contextual_map'
]);

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function hasValidImageSignature(bytes, contentType) {
  if (contentType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === 'image/png') {
    return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      .every((value, index) => bytes[index] === value);
  }
  if (contentType === 'image/gif') {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    return signature === 'GIF87a' || signature === 'GIF89a';
  }
  if (contentType === 'image/webp') {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  if (contentType === 'image/avif') {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    return bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
      (brand === 'avif' || brand === 'avis');
  }
  return false;
}

async function verifyExternalImageUrl(sourceUrl, declaredContentType) {
  let currentUrl = sourceUrl;
  let redirects = 0;

  while (redirects <= 3) {
    const url = await validatePublicHttpsUrl(currentUrl);
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'kings-newsletter-image-verifier/1.0',
        Accept: 'image/avif,image/webp,image/*',
        Range: 'bytes=0-15'
      },
      signal: AbortSignal.timeout(12000)
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects === 3) throw new Error('A imagem excedeu o limite de redirecionamentos.');
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirecionamento de imagem inválido.');
      currentUrl = new URL(location, url).href;
      redirects += 1;
      continue;
    }

    if (![200, 206].includes(response.status)) {
      throw new Error('Não foi possível verificar a imagem da fonte (HTTP ' + response.status + ').');
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new Error('A URL não entrega um arquivo de imagem compatível.');
    }
    if (declaredContentType && declaredContentType !== contentType) {
      throw new Error('O MIME declarado não corresponde ao conteúdo servido pela imagem.');
    }
    if (Number(response.headers.get('content-length') || 0) > MAX_EXTERNAL_IMAGE_BYTES) {
      throw new Error('A imagem excede o limite de 8 MB.');
    }

    const reader = response.body?.getReader?.();
    if (!reader) throw new Error('A resposta não contém dados de imagem.');
    const firstChunk = await reader.read();
    const bytes = Array.from(firstChunk.value || []);
    await reader.cancel().catch(() => {});
    if (!hasValidImageSignature(bytes, contentType)) {
      throw new Error('Os bytes recebidos não correspondem ao formato de imagem declarado.');
    }

    return { url: url.href, contentType };
  }

  throw new Error('Não foi possível validar a URL direta da imagem.');
}

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
  const image = story.image && typeof story.image === 'object' ? story.image : {};
  return {
    editionDate,
    category: String(story.category || '').trim(),
    title: String(story.title || '').trim(),
    summary: String(story.summary || '').trim(),
    context: String(story.context || '').trim(),
    source: String(story.source || '').trim(),
    publishedAt: String(story.publishedAt || '').trim(),
    url: String(story.url || '').trim(),
    headline: Boolean(story.headline),
    imageUrl: String(story.imageUrl || image.url || '').trim(),
    imageAlt: String(story.imageAlt || image.alt || '').trim(),
    imageSourceUrl: String(story.imageSourceUrl || image.sourceUrl || '').trim(),
    imageSourceName: String(story.imageSourceName || image.sourceName || image.source || '').trim(),
    imageCredit: String(story.imageCredit || image.credit || '').trim(),
    imageLicense: String(story.imageLicense || image.license || '').trim(),
    imageLicenseUrl: String(story.imageLicenseUrl || image.licenseUrl || '').trim(),
    imageTerms: String(story.imageTerms || image.terms || '').trim(),
    imageOrigin: String(story.imageOrigin || image.origin || '').trim(),
    imageKind: String(story.imageKind || image.kind || '').trim(),
    imageContentType: String(story.imageContentType || image.contentType || image.mimeType || '').trim().toLowerCase(),
    imageLicenseVerified: story.imageLicenseVerified === true || image.licenseVerified === true
  };
}

function validateStory(story) {
  return Boolean(
    story.category && story.title && story.summary && story.context &&
    story.source && story.publishedAt && /^https?:\/\//.test(story.url) &&
    isHttpsUrl(story.imageUrl) && story.imageAlt &&
    isHttpsUrl(story.imageSourceUrl) && story.imageSourceName &&
    story.imageCredit && story.imageLicense && isHttpsUrl(story.imageLicenseUrl) &&
    story.imageTerms && story.imageOrigin && IMAGE_KINDS.has(story.imageKind) &&
    ALLOWED_IMAGE_TYPES.has(story.imageContentType) && story.imageLicenseVerified === true
  );
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    await connectDatabase();

    if (req.method === 'GET') {
      setPublicCache(res, NEWS_CDN_SECONDS, NEWS_STALE_SECONDS);
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
        { $sort: { headline: -1, _publishedSort: -1, _id: -1 } },
        { $project: { _publishedSort: 0, _publishedDay: 0 } }
      ]);
      const edition = await Edition.findOne({ editionDate: date }).lean();
      return res.status(200).json({ date, issueNumber: edition?.issueNumber ?? null, stories });
    }

    if (!isBearerAuthorized(req, process.env.NOTIFY_SECRET)) {
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

    // editionDate identifies the newsletter edition; publishedAt preserves the real publication date.
    const editionStories = normalized;

    try {
      await Promise.all(editionStories.map(async story => {
        const verifiedImage = await verifyExternalImageUrl(story.imageUrl, story.imageContentType);
        story.image = {
          url: verifiedImage.url,
          alt: story.imageAlt,
          contentType: verifiedImage.contentType,
          mimeType: verifiedImage.contentType,
          source: story.imageSourceName,
          sourceUrl: story.imageSourceUrl,
          credit: story.imageCredit,
          attribution: story.imageCredit,
          license: story.imageLicense,
          licenseUrl: story.imageLicenseUrl,
          terms: story.imageTerms,
          origin: story.imageOrigin,
          kind: story.imageKind,
          storage: 'external',
          licenseVerified: story.imageLicenseVerified,
          urlVerified: true,
          isOriginal: story.imageKind === 'original',
          isContextual: story.imageKind !== 'original',
          isArchive: story.imageKind.includes('archive'),
          checkedAt: new Date()
        };

        for (const field of [
          'imageUrl', 'imageAlt', 'imageSourceUrl', 'imageSourceName',
          'imageCredit', 'imageLicense', 'imageLicenseUrl', 'imageTerms',
          'imageOrigin', 'imageKind', 'imageContentType', 'imageLicenseVerified'
        ]) {
          delete story[field];
        }
      }));
    } catch (error) {
      return res.status(400).json({
        error: 'Imagem rejeitada: ' + (error?.message || 'não foi possível validar a imagem.')
      });
    }

    const existingHeadline = await News.findOne({ editionDate, headline: true })
      .select('url')
      .lean();

    if (existingHeadline) {
      for (const story of editionStories) {
        story.headline = story.url === existingHeadline.url;
      }
    } else {
      const selectedHeadline = editionStories.find(story => story.headline) || editionStories[0];
      for (const story of editionStories) {
        story.headline = story.url === selectedHeadline.url;
      }
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
    // Uma falha não pode ficar guardada na CDN no lugar da edição.
    res.setHeader('Cache-Control', 'no-store');
    console.error('Erro ao salvar notícias:', error);
    return res.status(500).json({ error: 'Não foi possível salvar as notícias.' });
  }
};
