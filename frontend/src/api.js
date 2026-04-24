const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const validationMessage = Array.isArray(payload.errors) && payload.errors.length
            ? payload.errors[0].msg
            : '';
        const error = new Error(validationMessage || payload.message || 'Request failed');
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
};

export const authApi = {
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/api/auth/me')
};

export const dashboardApi = {
    admin: () => request('/api/dashboard/admin'),
    employee: () => request('/api/dashboard/employee')
};

export const employeeApi = {
    list: (query = '') => request(`/api/employees${query ? `?${query}` : ''}`),
    get: (id) => request(`/api/employees/${id}`),
    create: (body) => request('/api/employees', { method: 'POST', body }),
    update: (id, body) => request(`/api/employees/${id}`, { method: 'PUT', body }),
    remove: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
    myProfile: () => request('/api/employees/me/profile'),
    updateMyProfile: (body) => request('/api/employees/me/profile', { method: 'PUT', body: JSON.stringify(body) })
};

export const attendanceApi = {
    list: (query = '') => request(`/api/attendance${query ? `?${query}` : ''}`),
    mine: () => request('/api/attendance/me'),
    checkIn: () => request('/api/attendance/check-in', { method: 'POST' }),
    checkOut: () => request('/api/attendance/check-out', { method: 'POST' })
};

export const leaveApi = {
    list: (query = '') => request(`/api/leaves${query ? `?${query}` : ''}`),
    create: (body) => request('/api/leaves', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, body) => request(`/api/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify(body) })
};

export const payrollApi = {
    list: (query = '') => request(`/api/payrolls${query ? `?${query}` : ''}`),
    create: (body) => request('/api/payrolls', { method: 'POST', body: JSON.stringify(body) })
};

export const announcementApi = {
    list: () => request('/api/announcements'),
    create: (body) => request('/api/announcements', { method: 'POST', body: JSON.stringify(body) })
};

export default request;
