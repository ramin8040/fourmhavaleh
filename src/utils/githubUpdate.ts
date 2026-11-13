export interface GitHubRepoRef {
  owner: string;
  repo: string;
  slug: string;
}

export interface GitHubChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
}

export interface GitHubCommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  date: string;
  htmlUrl: string;
  files: GitHubChangedFile[];
}

export interface GitHubReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
}

export type GitHubUpdateState =
  | 'unconfigured'
  | 'up_to_date'
  | 'update_available'
  | 'error';

export interface GitHubUpdateCheckResult {
  repo: string;
  branch: string;
  hasUpdate: boolean;
  isInitialSync: boolean;
  installedSha: string;
  latestCommit: GitHubCommitInfo;
  latestRelease?: GitHubReleaseInfo | null;
  checkedAt: string;
  zipDownloadUrl: string;
  hasGitWorkspace?: boolean;
}

export interface GitHubUpdateConfig {
  repoInput: string;
  branch: string;
  autoCheck: boolean;
  installedSha: string;
  lastCheckedAt: string;
  lastKnownRemoteSha: string;
}

const STORAGE_KEY = 'winform_github_update_config_v1';

const SAFE_REPO_PART = /^[A-Za-z0-9._-]+$/;
const SAFE_BRANCH = /^[A-Za-z0-9._/-]+$/;

/**
 * Parses a GitHub repo from formats:
 * - "owner/repo"
 * - "https://github.com/owner/repo"
 * - "https://github.com/owner/repo.git"
 * - "https://github.com/owner/repo/tree/main"
 * - "git@github.com:owner/repo.git"
 */
export function parseGitHubRepoInput(input: string): GitHubRepoRef | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  let pathPart = trimmed;

  // SSH syntax: git@github.com:owner/repo.git
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+)$/i);
  if (sshMatch) {
    pathPart = `${sshMatch[1]}/${sshMatch[2]}`;
  } else if (/^https?:\/\//i.test(trimmed) || /^github\.com\//i.test(trimmed)) {
    const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(normalizedUrl);
      if (!/(^|\.)github\.com$/i.test(url.hostname)) return null;
      pathPart = url.pathname.replace(/^\/+/, '');
    } catch {
      return null;
    }
  }

  pathPart = pathPart.replace(/^\/+|\/+$/g, '');
  const segments = pathPart.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  let repo = segments[1].replace(/\.git$/i, '');

  if (!SAFE_REPO_PART.test(owner) || !SAFE_REPO_PART.test(repo)) {
    return null;
  }

  return {
    owner,
    repo,
    slug: `${owner}/${repo}`,
  };
}

/**
 * Sanitizes a branch name safely; falls back to 'main'.
 */
export function sanitizeGitHubBranch(branch?: string): string {
  const clean = (branch || '').trim();
  if (!clean || clean.includes('..') || !SAFE_BRANCH.test(clean)) {
    return 'main';
  }
  return clean;
}

/**
 * Evaluates update state given installed SHA vs latest remote SHA.
 */
export function evaluateGitHubUpdateState(
  installedSha?: string | null,
  remoteSha?: string | null
): 'up_to_date' | 'update_available' | 'unknown' {
  const local = (installedSha || '').trim().toLowerCase();
  const remote = (remoteSha || '').trim().toLowerCase();
  if (!remote) return 'unknown';
  if (!local) return 'unknown';
  return local === remote ? 'up_to_date' : 'update_available';
}

/**
 * Caps changed files list for crisp UI rendering and reports remainder count.
 */
export function summarizeChangedFiles(
  files: GitHubChangedFile[],
  maxItems = 6
): { shown: GitHubChangedFile[]; extraCount: number } {
  const safeFiles = Array.isArray(files) ? files : [];
  const cap = Math.max(1, maxItems);
  return {
    shown: safeFiles.slice(0, cap),
    extraCount: Math.max(0, safeFiles.length - cap),
  };
}

/**
 * Formats an ISO timestamp into a friendly Persian relative label.
 */
export function formatRelativePersianTime(isoDate?: string, nowMs = Date.now()): string {
  if (!isoDate) return 'نامشخص';
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return 'نامشخص';

  const diffSec = Math.max(0, Math.floor((nowMs - parsed) / 1000));
  if (diffSec < 60) return 'هم‌اکنون';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} دقیقه پیش`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ساعت پیش`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} روز پیش`;
  return new Date(parsed).toLocaleDateString('fa-IR');
}

export const DEFAULT_GITHUB_UPDATE_CONFIG: GitHubUpdateConfig = {
  repoInput: '',
  branch: 'main',
  autoCheck: true,
  installedSha: '',
  lastCheckedAt: '',
  lastKnownRemoteSha: '',
};

export function loadGitHubUpdateConfig(): GitHubUpdateConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_GITHUB_UPDATE_CONFIG };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GITHUB_UPDATE_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_GITHUB_UPDATE_CONFIG,
      ...parsed,
      branch: sanitizeGitHubBranch(parsed?.branch),
    };
  } catch {
    return { ...DEFAULT_GITHUB_UPDATE_CONFIG };
  }
}

export function saveGitHubUpdateConfig(config: GitHubUpdateConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore quota errors
  }
}
