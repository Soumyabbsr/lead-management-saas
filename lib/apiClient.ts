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

export default api;
