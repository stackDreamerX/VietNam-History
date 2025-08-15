import axios from 'axios';
import { isJsonString } from '../utils.js'; // Import the utility function with correct path

const BASE_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:3001/api';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('access_token');
        
        // Check if token is a JSON string and parse it if needed
        if (token && isJsonString(token)) {
            token = JSON.parse(token);
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No access token found in localStorage');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const response = await axios.post(`${BASE_URL}/user/refresh-token`, {}, {
                    withCredentials: true
                });

                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh token fails, redirect to login
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 