import api from './axios';

export const staffApi = {
  getAll: (params?: any) => api.get('/staff', { params }),
  getById: (id: string) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const leaveApi = {
  getAll: (params?: any) => api.get('/leave', { params }),
  getByStaff: (staffId: string) => api.get(`/leave/staff/${staffId}`),
  create: (data: any) => api.post('/leave', data),
  update: (id: string, data: any) => api.put(`/leave/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.put(`/leave/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/leave/${id}`),
};

export const permissionApi = {
  getAll: (params?: any) => api.get('/permission', { params }),
  create: (data: any) => api.post('/permission', data),
  update: (id: string, data: any) => api.put(`/permission/${id}`, data),
  delete: (id: string) => api.delete(`/permission/${id}`),
};

export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSummary: (params?: any) => api.get('/reports', { params }),
  exportCsvUrl: (params?: any) => {
    const token = localStorage.getItem('token');
    const qs = new URLSearchParams({ ...params, token }).toString();
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/reports/export/csv?${qs}`;
  },
  exportPdfUrl: (params?: any) => {
    const token = localStorage.getItem('token');
    const qs = new URLSearchParams({ ...params, token }).toString();
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/reports/export/pdf?${qs}`;
  },
  exportCsv: (params?: any) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPdf: (params?: any) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};
