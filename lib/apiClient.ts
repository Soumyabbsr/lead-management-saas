import axios from 'axios';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.endsWith('/api') && !process.env.NEXT_PUBLIC_API_URL.endsWith('/api/')) {
    // Auto-correct base URL by appending /api if it's pointing to the root backend URL
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

// Create an Axios instance
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        // We will store the token in localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors like suspended accounts
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            const msg = error.response?.data?.message || '';
            if (msg.toLowerCase().includes('suspended') && typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/suspended';
            }
        }
        // Also handle 401 unauthorized to clear token
        if (error.response?.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
