import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  GitBranch,
  RefreshCw,
  CheckCircle2,
  ArrowUpCircle,
  AlertCircle,
  ExternalLink,
  Download,
  FileCode2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  GitHubUpdateCheckResult,
  GitHubUpdateConfig,
  formatRelativePersianTime,
  parseGitHubRepoInput,
  sanitizeGitHubBranch,
  summarizeChangedFiles,
} from '../utils/githubUpdate';

interface GitHubUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubUpdateConfig;
  appVersion: string;
  checkResult: GitHubUpdateCheckResult | null;
  isChecking: boolean;
  isApplying: boolean;
  errorMessage: string | null;
  onSaveAndCheck: (repoInput: string, branch: string, autoCheck: boolean) => Promise<void>;
  onApplyUpdate: () => Promise<void>;
  onAcknowledgeBaseline: (sha: string) => void;
}

export const GitHubUpdateModal: React.FC<GitHubUpdateModalProps> = ({
  isOpen,
  onClose,
  config,
  appVersion,
  checkResult,
  isChecking,
  isApplying,
  errorMessage,
  onSaveAndCheck,
  onApplyUpdate,
  onAcknowledgeBaseline,
}) => {
  const [repoInput, setRepoInput] = useState(config.repoInput);
  const [branchInput, setBranchInput] = useState(config.branch || 'main');
  const [autoCheck, setAutoCheck] = useState(config.autoCheck);

  useEffect(() => {
    if (isOpen) {
      setRepoInput(config.repoInput);
      setBranchInput(config.branch || 'main');
      setAutoCheck(config.autoCheck);
    }
  }, [isOpen, config]);

  if (!isOpen || typeof document === 'undefined') return null;

  const parsedPreview = parseGitHubRepoInput(repoInput);
  const hasUpdate = Boolean(checkResult?.hasUpdate);
  const filesSummary = checkResult?.latestCommit?.files
    ? summarizeChangedFiles(checkResult.latestCommit.files, 6)
    : { shown: [], extraCount: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveAndCheck(repoInput.trim(), sanitizeGitHubBranch(branchInput), autoCheck);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-update-modal-title"
      data-testid="github-update-modal"
      style={{ zIndex: 9994 }}
      className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass-elevated bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-300/40 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                hasUpdate
                  ? 'bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-300'
                  : 'bg-sky-500/15 border border-sky-400/40 text-sky-700 dark:text-sky-300'
              }`}
            >
              {hasUpdate ? (
                <ArrowUpCircle className="w-5 h-5" />
              ) : (
                <GitBranch className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3
                id="github-update-modal-title"
                className="text-sm sm:text-base font-bold truncate"
              >
                بروزرسانی نرم‌افزار از گیتهاب
              </h3>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-sans tabular-nums">
                <span>نسخه برنامه: {appVersion}</span>
                {(config.installedSha || checkResult?.installedSha) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      کد فعلی: {(config.installedSha || checkResult?.installedSha || '').slice(0, 7)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره بروزرسانی"
            className="w-9 h-9 rounded-xl liquid-glass-well flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Repository Config Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="github-repo-input"
                  className="block font-bold text-slate-800 dark:text-slate-100"
                >
                  آدرس مخزن گیتهاب (Repository)
                </label>
                <input
                  id="github-repo-input"
                  data-testid="github-repo-input"
                  type="text"
                  dir="ltr"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="https://github.com/owner/repo یا owner/repo"
                  className="w-full h-10 px-3 liquid-glass-well rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="github-branch-input"
                  className="block font-bold text-slate-800 dark:text-slate-100"
                >
                  شاخه (Branch)
                </label>
                <input
                  id="github-branch-input"
                  data-testid="github-branch-input"
                  type="text"
                  dir="ltr"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="main"
                  className="w-full h-10 px-3 liquid-glass-well rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCheck}
                  onChange={(e) => setAutoCheck(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  بررسی خودکار تغییرات کد و نمایش اعلان
                </span>
              </label>

              <button
                type="submit"
                data-testid="github-check-btn"
                disabled={isChecking || !parsedPreview}
                className="h-10 px-4 rounded-xl liquid-cta text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'در حال بررسی...' : 'ذخیره و بررسی تغییرات'}</span>
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div
              data-testid="github-update-error"
              className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-800 dark:text-rose-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Check Result Display */}
          {checkResult && (
            <div
              data-testid="github-update-status-card"
              className={`p-4 rounded-2xl border space-y-3 ${
                hasUpdate
                  ? 'bg-amber-500/12 border-amber-400/45 text-slate-900 dark:text-slate-100'
                  : 'bg-emerald-500/10 border-emerald-400/35 text-slate-900 dark:text-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  {hasUpdate ? (
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-sm">
                      {hasUpdate
                        ? 'نسخه جدید نرم‌افزار در گیتهاب آماده است!'
                        : checkResult.isInitialSync
                        ? 'اتصال به مخزن گیتهاب برقرار شد'
                        : 'نرم‌افزار روی آخرین نسخه است'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2 font-sans tabular-nums">
                      <span dir="ltr" className="font-mono font-semibold">
                        {checkResult.repo}@{checkResult.branch}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>بررسی: {formatRelativePersianTime(checkResult.checkedAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {checkResult.latestRelease?.tagName && (
                  <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300 shrink-0">
                    {checkResult.latestRelease.tagName}
                  </span>
                )}
              </div>

              {/* Latest Commit Details */}
              <div className="p-3 rounded-xl liquid-glass-well space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {checkResult.latestCommit.message}
                  </span>
                  <a
                    href={checkResult.latestCommit.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline"
                  >
                    <span>{checkResult.latestCommit.shortSha}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans tabular-nums">
                  <span>تغییر توسط: {checkResult.latestCommit.authorName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatRelativePersianTime(checkResult.latestCommit.date)}</span>
                  {checkResult.installedSha && hasUpdate && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span dir="ltr" className="font-mono">
                        {checkResult.installedSha.slice(0, 7)} → {checkResult.latestCommit.shortSha}
                      </span>
                    </>
                  )}
                </div>

                {/* Changed Code Files List */}
                {filesSummary.shown.length > 0 && (
                  <div className="pt-2 border-t border-slate-300/35 dark:border-white/10 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>فایل‌های تغییر یافته در آخرین کامیت:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono" dir="ltr">
                      {filesSummary.shown.map((f) => (
                        <li
                          key={f.filename}
                          className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200"
                        >
                          <span className="truncate">{f.filename}</span>
                          <span className="shrink-0 tabular-nums text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400">+{f.additions}</span>
                            {' / '}
                            <span className="text-rose-600 dark:text-rose-400">-{f.deletions}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {filesSummary.extraCount > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans tabular-nums">
                        و {filesSummary.extraCount} فایل دیگر...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {hasUpdate && (
                  <button
                    type="button"
                    data-testid="github-apply-update-btn"
                    onClick={onApplyUpdate}
                    disabled={isApplying}
                    className="flex-1 h-10 px-4 rounded-xl liquid-cta-success text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>
                      {isApplying
                        ? 'در حال اعمال بروزرسانی...'
                        : 'بروزرسانی و استفاده از آخرین نسخه'}
                    </span>
                  </button>
                )}

                {!hasUpdate && checkResult.isInitialSync && (
                  <button
                    type="button"
                    data-testid="github-baseline-btn"
                    onClick={() => onAcknowledgeBaseline(checkResult.latestCommit.sha)}
                    className="flex-1 h-10 px-4 rounded-xl liquid-cta text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت این کد به‌عنوان نسخه فعلی و پایش تغییرات بعدی</span>
                  </button>
                )}

                <a
                  href={checkResult.zipDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3.5 rounded-xl liquid-glass-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود ZIP این نسخه</span>
                </a>
              </div>
            </div>
          )}

          {!checkResult && !errorMessage && (
            <div className="p-4 rounded-2xl liquid-glass-well text-slate-600 dark:text-slate-300 leading-relaxed">
              نام مخزن گیتهاب خود (مثلاً <code dir="ltr" className="font-mono font-semibold">owner/repo</code>) را وارد کنید تا سامانه هر زمان کد جدیدی در آن ثبت شد به شما اعلان بدهد و آخرین نسخه را فعال کند.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
