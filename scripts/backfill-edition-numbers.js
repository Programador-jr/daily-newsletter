#!/usr/bin/env node

require('dotenv').config();
const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const Edition = require('../lib/edition');
const { ensureEdition } = require('../lib/edition-numbering');

const APPLY = process.argv.includes('--apply');
const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function dateValue(value) {
  const match = String(value || '').match(DATE_PATTERN);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  if (date.getUTCDate() !== Number(match[1]) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCFullYear() !== Number(match[3])) return null;
  return date.getTime();
}

async function main() {
  await connectDatabase();
  const rawDates = await News.distinct('editionDate');
  const dates = rawDates.filter(date => dateValue(date) !== null).sort((a, b) => dateValue(a) - dateValue(b));
  const existing = await Edition.find({ editionDate: { $in: dates } }).lean();
  const existingDates = new Set(existing.map(item => item.editionDate));
  const missing = dates.filter(date => !existingDates.has(date));

  console.log(JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', totalDates: dates.length, existing: existing.length, missing }, null, 2));
  if (!APPLY) {
    console.log('Nenhuma alteração feita. Execute com --apply para persistir os números.');
    return;
  }

  for (const date of missing) {
    const edition = await ensureEdition(date);
    console.log(String(edition.issueNumber).padStart(3, '0') + ' ' + edition.editionDate);
  }
  console.log('Migração concluída. Os números existentes não foram alterados.');
}

main().catch(error => {
  console.error('Falha na migração de números das edições:', error);
  process.exitCode = 1;
});
