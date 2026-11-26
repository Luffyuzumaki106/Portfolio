const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/uploads/') && API_BASE_URL) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return trimmed;
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.error || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function fetchPortfolio() {
  return apiRequest('/api/portfolio');
}

export function fetchAuthStatus() {
  return apiRequest('/api/auth/me');
}

export function setupAdmin(credentials) {
  return apiRequest('/api/auth/setup', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function loginAdmin(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function logoutAdmin() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  });
}

export function updateAdminCredentials(payload) {
  return apiRequest('/api/auth/credentials', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createProject(payload) {
  return apiRequest('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProject(id, payload) {
  return apiRequest(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProject(id) {
  return apiRequest(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function reorderProjects(orderedIds) {
  return apiRequest('/api/projects/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  });
}

export function toggleProjectFeatured(id) {
  return apiRequest(`/api/projects/${encodeURIComponent(id)}/featured`, {
    method: 'PATCH',
  });
}

export function updateSiteMedia(siteMedia) {
  return apiRequest('/api/site-media', {
    method: 'PUT',
    body: JSON.stringify(siteMedia),
  });
}

export function importPortfolio(payload) {
  return apiRequest('/api/portfolio/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiRequest('/api/uploads', {
    method: 'POST',
    body: formData,
  });
}

export function submitContactMessage(payload) {
  return apiRequest('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchContactMessages() {
  return apiRequest('/api/messages');
}

export function updateContactMessageRead(id, isRead) {
  return apiRequest(`/api/messages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead }),
  });
}

export function deleteContactMessage(id) {
  return apiRequest(`/api/messages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
