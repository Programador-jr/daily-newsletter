#!/usr/bin/env node
'use strict';

require('dotenv').config();
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');

const latestPipeline = [
  { $addFields: { _editionSort: { $dateFromString: { dateString: '$editionDate', format: '%d/%m/%Y', onError: null, onNull: null } } } },
  { $match: { _editionSort: { $ne: null } } },
  { $sort: { _editionSort: -1 } },
  { $limit: 1 },
  { $project: { _id: 0, editionDate: 1 } }
];

function parseDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  return date.getUTCDate() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCFullYear() === Number(match[3]) ? date : null;
}

function historyPipeline(latestDate) {
  const pipeline = [
    { $addFields: { _editionSort: { $dateFromString: { dateString: '$editionDate', format: '%d/%m/%Y', onError: null, onNull: null } } } },
    { $match: { _editionSort: { $ne: null } } }
  ];
  if (latestDate) pipeline.push({ $match: { $or: [{ editionDate: { $ne: latestDate } }, { publishedAt: latestDate }] } });
  pipeline.push(
    { $group: { _id: '$editionDate', stories: { $sum: 1 }, _editionSort: { $max: '$_editionSort' } } },
    { $sort: { _editionSort: -1 } },
    { $project: { _id: 0, date: '$_id', stories: 1, title: { $concat: ['Edição de ', '$_id'] } } }
  );
  return pipeline;
}

async function time(fn, runs) {
  await fn();
  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    await fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  const mid = Math.floor(samples.length / 2);
  const medianMs = samples.length % 2 ? samples[mid] : (samples[mid - 1] + samples[mid]) / 2;
  return { medianMs: Number(medianMs.toFixed(2)), samplesMs: samples.map(value => Number(value.toFixed(2))) };
}

function findExecutionStats(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.executionStats) return value.executionStats;
  for (const child of Object.values(value)) {
    const found = findExecutionStats(child);
    if (found) return found;
  }
  return null;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI é obrigatória para este benchmark.');
  const runs = Number.parseInt(process.env.BENCHMARK_RUNS || '5', 10);
  if (!Number.isInteger(runs) || runs < 1 || runs > 20) throw new Error('BENCHMARK_RUNS deve ficar entre 1 e 20.');
  await connectDatabase();

  const baselineLatest = async () => {
    const rows = await News.find({}).lean();
    return rows.filter(row => parseDate(row.editionDate))
      .sort((a, b) => parseDate(b.editionDate) - parseDate(a.editionDate))[0]?.editionDate || null;
  };
  const aggregateLatest = async () => (await News.aggregate(latestPipeline))[0]?.editionDate || null;
  const baselineHistory = async () => {
    const rows = await News.find({}).lean();
    const latestDate = rows.filter(row => parseDate(row.editionDate))
      .sort((a, b) => parseDate(b.editionDate) - parseDate(a.editionDate))[0]?.editionDate || null;
    const counts = new Map();
    for (const row of rows) {
      if (!parseDate(row.editionDate)) continue;
      if (latestDate && row.editionDate === latestDate && row.publishedAt !== latestDate) continue;
      counts.set(row.editionDate, (counts.get(row.editionDate) || 0) + 1);
    }
    return [...counts].map(([date, stories]) => ({ date, stories, title: 'Edição de ' + date }))
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  };
  const aggregateHistory = async () => {
    const latestDate = await aggregateLatest();
    return News.aggregate(historyPipeline(latestDate));
  };

  const expectedLatest = await baselineLatest();
  assert.equal(await aggregateLatest(), expectedLatest, 'A agregação precisa preservar a edição mais recente.');
  assert.deepEqual(await aggregateHistory(), await baselineHistory(), 'O histórico agregado precisa corresponder ao baseline.');

  const latestExplain = await News.aggregate(latestPipeline).explain('executionStats');
  const latestStats = findExecutionStats(latestExplain);
  const historyExplain = await News.aggregate(historyPipeline(expectedLatest)).explain('executionStats');
  const historyStats = findExecutionStats(historyExplain);
  const result = {
    database: 'kings_newsletter',
    documents: await News.countDocuments(),
    runs,
    latestEdition: {
      baselineNode: await time(baselineLatest, runs),
      aggregation: await time(aggregateLatest, runs),
      executionStats: latestStats ? {
        nReturned: latestStats.nReturned,
        totalDocsExamined: latestStats.totalDocsExamined,
        totalKeysExamined: latestStats.totalKeysExamined,
        executionTimeMillis: latestStats.executionTimeMillis
      } : null
    },
    editionHistory: {
      baselineNode: await time(baselineHistory, runs),
      aggregation: await time(aggregateHistory, runs),
      executionStats: historyStats ? {
        nReturned: historyStats.nReturned,
        totalDocsExamined: historyStats.totalDocsExamined,
        totalKeysExamined: historyStats.totalKeysExamined,
        executionTimeMillis: historyStats.executionTimeMillis
      } : null
    }
  };
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 0;
  await require('mongoose').disconnect();
}

main().catch(async error => {
  console.error(error);
  try {
    await require('mongoose').disconnect();
  } catch {
    // Keep the original benchmark failure as the reported error.
  }
  process.exitCode = 1;
});
