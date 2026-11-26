export const DRAFT_STORAGE_KEY = 'fs_portfolio_draft_v1';
export const THEME_STORAGE_KEY = 'fs_portfolio_theme_v1';
export const ADMIN_AUTH_KEY = 'fs_admin_unlocked_v1';

// Approximate conservative browser localStorage limit (5 MB in UTF-16 bytes ~ 5 * 1024 * 1024)
export const ESTIMATED_QUOTA_BYTES = 5 * 1024 * 1024;

export function getLocalStorageUsage() {
  try {
    let totalBytes = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const val = window.localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2;
      }
    }
    const percent = Math.min(100, Math.round((totalBytes / ESTIMATED_QUOTA_BYTES) * 100));
    return {
      bytes: totalBytes,
      kb: Math.round(totalBytes / 1024),
      mb: (totalBytes / (1024 * 1024)).toFixed(2),
      percent,
      isWarning: percent >= 75,
      isCritical: percent >= 90,
    };
  } catch {
    return {
      bytes: 0,
      kb: 0,
      mb: '0.00',
      percent: 0,
      isWarning: false,
      isCritical: false,
    };
  }
}

export function loadDraftFromStorage() {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraftToStorage(data) {
  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
    return { ok: true };
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.code === 1014;
    return {
      ok: false,
      error: isQuota
        ? 'Storage quota exceeded! Your previous saved draft is safe. Remove or re-compress large uploaded images, or use image URLs instead.'
        : 'Could not save to localStorage. Please export a JSON backup.',
    };
  }
}

export function clearDraftFromStorage() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
