// Checks that every story's "Automated test results" comment in Jira shows the latest
// pipeline run on main.
//
// 1. Finds the latest completed run of the GitHub Actions workflow on main that posts to
//    Jira (a push or a manual run; pull requests never post).
// 2. Finds the story keys in the test titles under playwright/tests/ and
//    playwright/ultimateqa/tests/.
// 3. Reads each story's results comment (the one scripts/jira-report.js keeps up to date)
//    and compares its commit and run link with that run.
//
// Prints one row per story and exits with code 1 if any story is behind or has no
// results comment, so it can also be used as a scheduled check.
//
// Environment:
//   JIRA_EMAIL, JIRA_API_TOKEN  required: the same account the pipeline posts with
//   JIRA_BASE_URL     default https://ccbchennai.atlassian.net
//   JIRA_PROJECT_KEY  default OWA
//   GITHUB_REPO       default OnlyAiOne/playwright-tests
//   GITHUB_API_URL    default https://api.github.com
//   GITHUB_TOKEN      optional; raises GitHub's rate limit for unauthenticated calls
//
// Usage: npm run jira:check

const fs = require('fs');
const path = require('path');

const env = process.env;
const jiraBase = (env.JIRA_BASE_URL || 'https://ccbchennai.atlassian.net').replace(/\/+$/, '');
const projectKey = env.JIRA_PROJECT_KEY || 'OWA';
const repo = env.GITHUB_REPO || 'OnlyAiOne/playwright-tests';
const githubApi = (env.GITHUB_API_URL || 'https://api.github.com').replace(/\/+$/, '');
// One folder per suite (the onlypps and ultimateqa projects in playwright.config.js)
const testsDirs = [
  path.join(__dirname, '..', 'playwright', 'tests'),
  path.join(__dirname, '..', 'playwright', 'ultimateqa', 'tests'),
];

// Must match COMMENT_MARKER in scripts/jira-report.js
const COMMENT_MARKER = 'Posted by the OnlyPPS automation pipeline';

async function getJson(url, headers) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  return res.json();
}

// Latest completed run on main that posts to Jira
async function latestPostingRun() {
  const headers = env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {};
  const data = await getJson(
    `${githubApi}/repos/${repo}/actions/runs?branch=main&status=completed&per_page=20`,
    headers
  );
  const run = (data.workflow_runs || []).find(
    (r) => r.name === 'Playwright Tests' && ['push', 'workflow_dispatch'].includes(r.event)
  );
  if (!run) throw new Error('No completed "Playwright Tests" run on main was found');
  return run;
}

// Story keys used in test titles, e.g. test('OWA-31: ...')
function storyKeys() {
  const titleKey = new RegExp(`test\\(\\s*[\`'"](${projectKey}-\\d+):`, 'g');
  const keys = new Set();
  for (const testsDir of testsDirs) {
    for (const file of fs.readdirSync(testsDir).filter((f) => f.endsWith('.spec.js'))) {
      const source = fs.readFileSync(path.join(testsDir, file), 'utf8');
      for (const match of source.matchAll(titleKey)) keys.add(match[1]);
    }
  }
  return [...keys].sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
}

async function resultsComment(key) {
  const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
  const data = await getJson(`${jiraBase}/rest/api/2/issue/${key}/comment?maxResults=100`, {
    Authorization: `Basic ${auth}`,
  });
  return (data.comments || []).find((c) => typeof c.body === 'string' && c.body.includes(COMMENT_MARKER));
}

// The commit, run id and headline the reporter wrote into the comment
function readComment(body) {
  const commit = (body.match(/commit\s*\{*\s*([0-9a-f]{7,40})/i) || [])[1] || '';
  const runId = (body.match(/actions\/runs\/(\d+)/) || [])[1] || '';
  const headline = ((body.match(/Automated test results:\s*([^\n]+)/) || [])[1] || '').trim();
  return { commit: commit.slice(0, 7), runId, headline };
}

function pad(text, width) {
  const s = String(text);
  return s.length >= width ? s.slice(0, width - 1) + ' ' : s + ' '.repeat(width - s.length);
}

async function main() {
  if (!env.JIRA_EMAIL || !env.JIRA_API_TOKEN) {
    console.log('Set JIRA_EMAIL and JIRA_API_TOKEN first (the same values as the GitHub secrets).');
    console.log('PowerShell: $env:JIRA_EMAIL="<email>"; $env:JIRA_API_TOKEN="<token>"; npm run jira:check');
    process.exitCode = 2;
    return;
  }

  const run = await latestPostingRun();
  const runCommit = run.head_sha.slice(0, 7);
  console.log(`Latest run on main: #${run.run_number} · ${run.conclusion} · commit ${runCommit} · ${run.updated_at}`);
  console.log(`  ${run.html_url}`);
  if (run.conclusion === 'cancelled') {
    console.log('  That run was cancelled, so it may not have posted to Jira.');
  }

  const keys = storyKeys();
  console.log(`\nChecking ${keys.length} stories: ${keys.join(', ')}\n`);
  console.log(pad('Story', 9) + pad('In sync', 9) + pad('Commit', 9) + pad('Comment updated', 31) + 'Result in Jira');

  let problems = 0;
  for (const key of keys) {
    try {
      const comment = await resultsComment(key);
      if (!comment) {
        problems += 1;
        console.log(pad(key, 9) + pad('NO', 9) + pad('-', 9) + pad('-', 31) + 'no results comment');
        continue;
      }
      const { commit, runId, headline } = readComment(comment.body);
      const inSync = runId === String(run.id) || commit === runCommit;
      if (!inSync) problems += 1;
      console.log(
        pad(key, 9) + pad(inSync ? 'yes' : 'NO', 9) + pad(commit || '?', 9) + pad(comment.updated, 31) + (headline || '?')
      );
    } catch (err) {
      problems += 1;
      console.log(pad(key, 9) + pad('ERROR', 9) + pad('-', 9) + pad('-', 31) + err.message);
    }
  }

  console.log(
    problems === 0
      ? `\nAll ${keys.length} stories show run #${run.run_number}.`
      : `\n${problems} of ${keys.length} stories do not show run #${run.run_number}. Check the run's "Post results to Jira" step.`
  );
  if (problems > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Check stopped: ${err.message}`);
  process.exitCode = 2;
});
