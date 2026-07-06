import { api, integrations } from './api-client';

const auth = {
  isAuthenticated: async () => {
    try {
      const res = await fetch('/api/health');
      return res.ok;
    } catch {
      return false;
    }
  },
  me: async () => {
    return null;
  },
  logout: async () => {
    window.location.href = '/';
  },
  redirectToLogin: () => {
    window.location.href = '/';
  },
};

const entities = {
  Resume: {
    list: async () => api.listResumes(),
    filter: async (filters = {}) => {
      const resumes = await api.listResumes();
      return resumes.filter(r => Object.entries(filters).every(([k, v]) => r[k] === v));
    },
    get: async (id) => api.getResume(id),
    create: async (data) => api.createResume(data),
    update: async (id, data) => api.updateResume(id, data),
    delete: async (id) => api.deleteResume(id),
  },
};

const appLogs = {
  logUserInApp: async () => {},
};

export const db = { auth, entities, integrations, appLogs };
export default db;
