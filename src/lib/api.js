const API_BASE = '/api';
let _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
}

export function getAuthToken() {
  return _authToken;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listResumes: () => request('/resumes'),
  getResume: (id) => request(`/resumes/${id}`),
  createResume: (data) => request('/resumes', { method: 'POST', body: JSON.stringify(data) }),
  updateResume: (id, data) => request(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResume: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),
};
