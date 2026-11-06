// Posts Playwright results to the Jira story named at the start of each test title,
// e.g. "OWA-31: fills the contact form" -> OWA-31.
//
// Each story gets one results comment that is updated on every run (marked by
// COMMENT_MARKER), plus failure screenshots as attachments. Story status is never changed.
//
// Environment:
//   JIRA_BASE_URL     e.g. https://ccbchennai.atlassian.net
//   JIRA_EMAIL        Jira account the API token belongs to
//   JIRA_API_TOKEN    API token (store as a CI secret)
//   JIRA_PROJECT_KEY  story key prefix to look for (default OWA)
//   RESULTS_FILE      Playwright JSON report (default playwright/results.json)
//   RUN_URL           link to this CI run, shown in the comment
//   DRY_RUN=true      print what would be posted; also used when credentials are missing
//
// Jira problems are reported as warnings and never fail the build.

const fs = require('fs');
const path = require('path');

const COMMENT_MARKER = 'Posted by the OnlyPPS automation pipeline';

const env = process.env;
const baseUrl = (env.JIRA_BASE_URL || '').replace(/\/+$/, '');
const projectKey = env.JIRA_PROJECT_KEY || 'OWA';
const resultsFile = env.RESULTS_FILE || 'playwright/results.json';
const runUrl = env.RUN_URL || '';
const hasCredentials = Boolean(baseUrl && env.JIRA_EMAIL && env.JIRA_API_TOKEN);
const dryRun = env.DRY_RUN === 'true' || !hasCredentials;

const keyPattern = new RegExp(`\\b${projectKey}-\\d+\\b`);

function warn(message) {
  // Shows as a yellow annotation in GitHub Actions, a plain line elsewhere
  console.log(env.GITHUB_ACTIONS ? `::warning::${message}` : `WARNING: ${message}`);
}

// Playwright errors carry terminal colour codes
function stripAnsi(text) {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

// First line of the error plus its Expected/Received lines, e.g.
// "expect(page).toHaveTitle(expected) failed · Expected pattern: /Industr/ · Received string: "Accounting…""
function summarizeError(message) {
  const lines = stripAnsi(message).split('\n').map((l) => l.trim()).filter(Boolean);
  const keep = [lines[0].replace(/^Error:\s*/, ''), ...lines.filter((l) => /^(Expected|Received)\b/.test(l))];
  return keep.join(' · ').slice(0, 400);
}

// Characters with a meaning in Jira wiki markup
function escapeWiki(text) {
  return text.replace(/([{}\[\]|*])/g, '\\$1');
}

function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

// Flattens the report into one entry per test, keeping the describe titles for context
function collectTests(report) {
  const tests = [];
  const walk = (suite, titles) => {
    const here = suite.title && !suite.title.endsWith('.js') ? [...titles, suite.title] : titles;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const last = test.results[test.results.length - 1] || {};
        tests.push({
          title: spec.title,
          file: spec.file || suite.file,
          group: here.join(' › '),
          // expected | unexpected | flaky | skipped (Playwright's verdict, honours test.fail())
          verdict: test.status,
          // passed | failed | timedOut | skipped | interrupted (what happened on the last try)
          outcome: last.status,
          duration: test.results.reduce((sum, r) => sum + (r.duration || 0), 0),
          tries: test.results.length,
          error: last.error ? summarizeError(last.error.message || '') : '',
          screenshots: (last.attachments || [])
            .filter((a) => a.contentType === 'image/png' && a.path)
            .map((a) => a.path),
        });
      }
    }
    for (const child of suite.suites || []) walk(child, here);
  };
  for (const suite of report.suites || []) walk(suite, []);
  return tests;
}

function describe(test) {
  if (test.verdict === 'skipped') return { icon: '(-)', label: 'Skipped', kind: 'skipped' };
  if (test.verdict === 'unexpected') return { icon: '(x)', label: 'Failed', kind: 'failed' };
  if (test.verdict === 'flaky') return { icon: '(!)', label: `Passed on retry ${test.tries - 1}`, kind: 'passed' };
  if (test.outcome === 'passed') return { icon: '(/)', label: 'Passed', kind: 'passed' };
  // An expected failure: the test is marked test.fail() for a known defect
  return { icon: '(!)', label: 'Known defect (expected failure)', kind: 'known' };
}

function buildComment(key, tests, runInfo) {
  const counts = { passed: 0, failed: 0, known: 0, skipped: 0 };
  for (const t of tests) counts[describe(t).kind] += 1;

  const headline =
    counts.failed > 0 ? `FAILED: ${counts.failed} of ${tests.length} tests failed`
      : counts.known > 0 ? `PASSED with ${counts.known} known defect${counts.known > 1 ? 's' : ''}`
        : counts.passed === 0 ? 'NOT RUN: all tests skipped'
          : `PASSED: ${counts.passed} of ${tests.length} tests`;

  const lines = [
    `h3. Automated test results: ${headline}`,
    `Run: ${runInfo.when} · ${runInfo.where}${runInfo.commit ? ` · commit {{${runInfo.commit}}}` : ''} · total ${formatSeconds(tests.reduce((s, t) => s + t.duration, 0))}`,
    '',
    '||Result||Test||Time||',
  ];
  for (const t of tests) {
    const d = describe(t);
    lines.push(`|${d.icon} ${d.label}|${escapeWiki(t.title)}|${formatSeconds(t.duration)}|`);
  }

  const problems = tests.filter((t) => ['failed', 'known'].includes(describe(t).kind) && t.error);
  if (problems.length) {
    lines.push('', '*Failure details*');
    for (const t of problems) lines.push(`* ${escapeWiki(t.title)}: ${escapeWiki(t.error)}`);
  }

  if (runUrl) lines.push('', `Full report and logs: [CI run|${runUrl}]`);
  lines.push('', `_${COMMENT_MARKER}. This comment is updated on every run; story status is not changed._`);
  return lines.join('\n');
}

async function jira(method, apiPath, body, extraHeaders = {}) {
  const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
  const isForm = body instanceof FormData;
  const res = await fetch(`${baseUrl}${apiPath}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${apiPath} returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? null : res.json();
}

async function upsertComment(key, text) {
  const existing = await jira('GET', `/rest/api/2/issue/${key}/comment?maxResults=100`);
  const ours = (existing.comments || []).find((c) => typeof c.body === 'string' && c.body.includes(COMMENT_MARKER));
  if (ours) {
    await jira('PUT', `/rest/api/2/issue/${key}/comment/${ours.id}`, { body: text });
    return 'updated';
  }
  await jira('POST', `/rest/api/2/issue/${key}/comment`, { body: text });
  return 'added';
}

async function attachScreenshots(key, tests, runId) {
  let count = 0;
  for (const t of tests) {
    if (!['failed', 'known'].includes(describe(t).kind)) continue;
    for (const file of t.screenshots) {
      if (!fs.existsSync(file)) continue;
      const form = new FormData();
      const name = `${runId}-${path.basename(path.dirname(file))}.png`.slice(-120);
      form.append('file', new Blob([fs.readFileSync(file)], { type: 'image/png' }), name);
      await jira('POST', `/rest/api/2/issue/${key}/attachments`, form, { 'X-Atlassian-Token': 'no-check' });
      count += 1;
    }
  }
  return count;
}

async function main() {
  if (!fs.existsSync(resultsFile)) {
    warn(`No results file at ${resultsFile}; nothing posted to Jira.`);
    return;
  }
  const report = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const tests = collectTests(report);

  const byStory = new Map();
  const unmapped = [];
  for (const t of tests) {
    const match = t.title.match(keyPattern);
    if (!match) { unmapped.push(t.title); continue; }
    if (!byStory.has(match[0])) byStory.set(match[0], []);
    byStory.get(match[0]).push(t);
  }

  const started = report.stats && report.stats.startTime ? new Date(report.stats.startTime) : new Date();
  const runInfo = {
    when: started.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST',
    where: env.GITHUB_ACTIONS ? 'GitHub Actions' : env.JENKINS_URL ? 'Jenkins' : 'local run',
    commit: (env.GITHUB_SHA || env.GIT_COMMIT || '').slice(0, 7),
  };
  const runId = env.GITHUB_RUN_ID || env.BUILD_NUMBER || started.getTime();

  console.log(`${tests.length} tests, ${byStory.size} stories: ${[...byStory.keys()].sort().join(', ')}`);
  if (unmapped.length) warn(`${unmapped.length} tests have no ${projectKey} key and were not posted: ${unmapped.join('; ')}`);
  if (dryRun) {
    console.log(hasCredentials ? 'DRY_RUN=true: nothing is sent to Jira.' : 'Jira credentials not set: dry run, nothing is sent to Jira.');
  }

  let failures = 0;
  for (const [key, storyTests] of [...byStory.entries()].sort()) {
    const text = buildComment(key, storyTests, runInfo);
    if (dryRun) {
      console.log(`\n----- ${key} -----\n${text}`);
      continue;
    }
    try {
      const action = await upsertComment(key, text);
      const attached = await attachScreenshots(key, storyTests, runId);
      console.log(`${key}: comment ${action}${attached ? `, ${attached} screenshot(s) attached` : ''}`);
    } catch (err) {
      failures += 1;
      warn(`${key}: could not update Jira (${err.message})`);
    }
  }
  if (failures) warn(`${failures} of ${byStory.size} stories were not updated in Jira.`);
}

main().catch((err) => warn(`Jira report stopped: ${err.message}`));
