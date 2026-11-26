import { useCallback, useEffect, useState } from 'react';
import defaultData from '../data/projects.json';
import {
  clearDraftFromStorage,
  loadDraftFromStorage,
  saveDraftToStorage,
} from '../utils/storage';

/**
 * Public visitors always read `src/data/projects.json` (never copied into their localStorage).
 * If an admin draft exists in this browser's localStorage, it is loaded for live preview.
 */
export function usePortfolioData() {
  const [draft, setDraft] = useState(() => loadDraftFromStorage());
  const [storageError, setStorageError] = useState(null);

  const data = draft || defaultData;
  const hasDraft = Boolean(draft);

  const updateDraft = useCallback(
    (updater) => {
      const base = draft || structuredClone(defaultData);
      const next = typeof updater === 'function' ? updater(base) : updater;
      const result = saveDraftToStorage(next);
      if (!result.ok) {
        setStorageError(result.error);
        return false;
      }
      setStorageError(null);
      setDraft(next);
      return true;
    },
    [draft]
  );

  const discardDraft = useCallback(() => {
    clearDraftFromStorage();
    setDraft(null);
    setStorageError(null);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'fs_portfolio_draft_v1') {
        setDraft(loadDraftFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    data,
    hasDraft,
    storageError,
    clearStorageError: () => setStorageError(null),
    updateDraft,
    discardDraft,
  };
}
