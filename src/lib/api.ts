import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Debug interceptor to log outgoing requests
api.interceptors.request.use(
    (config) => {
        const authHeader = config.headers?.Authorization;
        if (typeof authHeader === 'string') {
            console.log('[API] Outgoing request:', {
                url: config.url,
                method: config.method,
                hasAuthHeader: true,
                authHeaderPreview: authHeader.substring(0, 20) + '...'
            });
        } else {
            console.log('[API] Outgoing request:', {
                url: config.url,
                method: config.method,
                hasAuthHeader: false,
                authHeaderPreview: 'MISSING/INVALID'
            });
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);