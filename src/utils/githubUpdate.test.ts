import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGitHubRepoInput,
  sanitizeGitHubBranch,
  evaluateGitHubUpdateState,
  summarizeChangedFiles,
  formatRelativePersianTime,
} from './githubUpdate';

test('parseGitHubRepoInput handles slug, HTTPS URL, .git URL, tree URL, and SSH format', () => {
  assert.deepEqual(parseGitHubRepoInput('octocat/Hello-World'), {
    owner: 'octocat',
    repo: 'Hello-World',
    slug: 'octocat/Hello-World',
  });

  assert.deepEqual(parseGitHubRepoInput('https://github.com/ramin-dev/warehouse-forms/'), {
    owner: 'ramin-dev',
    repo: 'warehouse-forms',
    slug: 'ramin-dev/warehouse-forms',
  });

  assert.deepEqual(parseGitHubRepoInput('https://github.com/acme/app.git'), {
    owner: 'acme',
    repo: 'app',
    slug: 'acme/app',
  });

  assert.deepEqual(parseGitHubRepoInput('https://github.com/acme/app/tree/release-v2'), {
    owner: 'acme',
    repo: 'app',
    slug: 'acme/app',
  });

  assert.deepEqual(parseGitHubRepoInput('git@github.com:acme/forms-repo.git'), {
    owner: 'acme',
    repo: 'forms-repo',
    slug: 'acme/forms-repo',
  });

  assert.equal(parseGitHubRepoInput('https://gitlab.com/acme/app'), null);
  assert.equal(parseGitHubRepoInput('not-a-repo'), null);
  assert.equal(parseGitHubRepoInput(''), null);
});

test('sanitizeGitHubBranch enforces safe branch names and defaults to main', () => {
  assert.equal(sanitizeGitHubBranch('main'), 'main');
  assert.equal(sanitizeGitHubBranch('feature/pdf-export'), 'feature/pdf-export');
  assert.equal(sanitizeGitHubBranch('  develop  '), 'develop');
  assert.equal(sanitizeGitHubBranch('../etc/passwd'), 'main');
  assert.equal(sanitizeGitHubBranch('bad branch name'), 'main');
  assert.equal(sanitizeGitHubBranch(''), 'main');
});

test('evaluateGitHubUpdateState compares local vs remote SHAs accurately', () => {
  assert.equal(evaluateGitHubUpdateState('abc1234', 'abc1234'), 'up_to_date');
  assert.equal(evaluateGitHubUpdateState('ABC1234', 'abc1234'), 'up_to_date');
  assert.equal(evaluateGitHubUpdateState('abc1234', 'def5678'), 'update_available');
  assert.equal(evaluateGitHubUpdateState('', 'def5678'), 'unknown');
  assert.equal(evaluateGitHubUpdateState('abc1234', ''), 'unknown');
});

test('summarizeChangedFiles caps items and reports extraCount', () => {
  const files = Array.from({ length: 8 }, (_, idx) => ({
    filename: `src/file_${idx}.ts`,
    status: 'modified',
    additions: idx + 1,
    deletions: idx,
  }));

  const summary = summarizeChangedFiles(files, 5);
  assert.equal(summary.shown.length, 5);
  assert.equal(summary.extraCount, 3);
});

test('formatRelativePersianTime produces readable Persian relative timestamps', () => {
  const now = Date.UTC(2026, 10, 13, 12, 0, 0);
  assert.equal(formatRelativePersianTime(new Date(now - 20_000).toISOString(), now), 'هم‌اکنون');
  assert.equal(formatRelativePersianTime(new Date(now - 5 * 60_000).toISOString(), now), '5 دقیقه پیش');
  assert.equal(formatRelativePersianTime(new Date(now - 3 * 3600_000).toISOString(), now), '3 ساعت پیش');
  assert.equal(formatRelativePersianTime('invalid-date', now), 'نامشخص');
});
