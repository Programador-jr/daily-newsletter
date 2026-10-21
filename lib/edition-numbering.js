const Edition = require('./edition');
const Sequence = require('./sequence');

async function ensureEdition(editionDate) {
  const existing = await Edition.findOne({ editionDate }).lean();
  if (existing) return existing;

  const sequence = await Sequence.findOneAndUpdate(
    { key: 'edition-issue-number' },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  try {
    return await Edition.create({ editionDate, issueNumber: sequence.value });
  } catch (error) {
    if (error?.code === 11000) {
      const racedEdition = await Edition.findOne({ editionDate }).lean();
      if (racedEdition) return racedEdition;
    }
    throw error;
  }
}

module.exports = { ensureEdition };
