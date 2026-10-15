#!/usr/bin/env node
'use strict';

const { performance } = require('node:perf_hooks');

const before = process.env.BASE_URL_BEFORE;
const after = process.env.BASE_URL_AFTER;
const paths = (process.env.BENCHMARK_PATHS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const runs = Number.parseInt(process.env.BENCHMARK_RUNS || '5', 10);

if (!before || !after || !paths.length || !Number.isInteger(runs) || runs < 1 || runs > 20) {
  console.error('Defina BASE_URL_BEFORE, BASE_URL_AFTER, BENCHMARK_PATHS e BENCHMARK_RUNS (1–20).');
  process.exitCode = 1;
} else {
  const median = values => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  async function sample(base, path) {
    const url = new URL(path, base);
    const started = performance.now();
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const body = await response.arrayBuffer();
    return {
      status: response.status,
      bytes: body.byteLength,
      durationMs: Number((performance.now() - started).toFixed(2))
    };
  }

  (async () => {
    const report = { runs, generatedAt: new Date().toISOString(), results: [] };
    for (const path of paths) {
      for (const [label, base] of [['before', before], ['after', after]]) {
        const samples = [];
        for (let run = 0; run < runs; run += 1) {
          try {
            samples.push(await sample(base, path));
          } catch (error) {
            samples.push({ error: error.message });
          }
        }
        const durations = samples.filter(item => Number.isFinite(item.durationMs)).map(item => item.durationMs);
        report.results.push({
          path,
          deployment: label,
          samples,
          medianMs: durations.length ? Number(median(durations).toFixed(2)) : null
        });
      }
    }
    console.log(JSON.stringify(report, null, 2));
    if (report.results.some(result => result.samples.some(sample => sample.error || sample.status >= 500))) {
      process.exitCode = 2;
    }
  })().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
