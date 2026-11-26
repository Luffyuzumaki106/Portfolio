import { useCallback, useEffect, useState } from 'react';
import defaultData from '../data/projects.json';
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  fetchPortfolio,
  importPortfolio as apiImportPortfolio,
  reorderProjects as apiReorderProjects,
  toggleProjectFeatured as apiToggleProjectFeatured,
  updateProject as apiUpdateProject,
  updateSiteMedia as apiUpdateSiteMedia,
} from '../api/client';

/**
 * Loads live portfolio data (siteMedia + projects) from the backend API,
 * using bundled seed JSON only as an immediate initial placeholder before fetch resolves.
 */
export function usePortfolioData() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchPortfolio();
      if (payload && Array.isArray(payload.projects)) {
        setData({
          siteMedia: payload.siteMedia || defaultData.siteMedia,
          projects: payload.projects,
        });
      }
      setApiError(null);
    } catch (err) {
      setApiError(err.message || 'Could not reach the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runMutation = useCallback(async (action) => {
    setSaving(true);
    setApiError(null);
    try {
      const result = await action();
      return { ok: true, result };
    } catch (err) {
      const message = err.message || 'Could not save changes to the backend.';
      setApiError(message);
      return { ok: false, error: message, status: err.status };
    } finally {
      setSaving(false);
    }
  }, []);

  const createProject = useCallback(
    (payload) =>
      runMutation(async () => {
        const res = await apiCreateProject(payload);
        setData((prev) => ({ ...prev, projects: res.projects }));
        return res;
      }),
    [runMutation]
  );

  const updateProject = useCallback(
    (id, payload) =>
      runMutation(async () => {
        const res = await apiUpdateProject(id, payload);
        setData((prev) => ({ ...prev, projects: res.projects }));
        return res;
      }),
    [runMutation]
  );

  const deleteProject = useCallback(
    (id) =>
      runMutation(async () => {
        const res = await apiDeleteProject(id);
        setData((prev) => ({ ...prev, projects: res.projects }));
        return res;
      }),
    [runMutation]
  );

  const reorderProjects = useCallback(
    (orderedIds) =>
      runMutation(async () => {
        const res = await apiReorderProjects(orderedIds);
        setData((prev) => ({ ...prev, projects: res.projects }));
        return res;
      }),
    [runMutation]
  );

  const toggleFeatured = useCallback(
    (id) =>
      runMutation(async () => {
        const res = await apiToggleProjectFeatured(id);
        setData((prev) => ({ ...prev, projects: res.projects }));
        return res;
      }),
    [runMutation]
  );

  const saveSiteMedia = useCallback(
    (siteMedia) =>
      runMutation(async () => {
        const res = await apiUpdateSiteMedia(siteMedia);
        setData((prev) => ({ ...prev, siteMedia: res.siteMedia }));
        return res;
      }),
    [runMutation]
  );

  const importPortfolioJson = useCallback(
    (payload) =>
      runMutation(async () => {
        const res = await apiImportPortfolio(payload);
        setData({
          siteMedia: res.siteMedia || defaultData.siteMedia,
          projects: res.projects || [],
        });
        return res;
      }),
    [runMutation]
  );

  return {
    data,
    loading,
    saving,
    apiError,
    clearApiError: () => setApiError(null),
    refresh,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    toggleFeatured,
    saveSiteMedia,
    importPortfolioJson,
  };
}
