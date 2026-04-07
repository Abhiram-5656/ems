import apiClient from './apiClient';

export const sendSignupOTP = (data) => apiClient.post('/auth/send-signup-otp', data);
export const verifySignupOTP = (data) => apiClient.post('/auth/verify-signup-otp', data);
export const login = (data) => apiClient.post('/api/auth/login', data);
export const getCurrentUser = () => apiClient.get('/auth/me');
export const updateProfile = (data) => apiClient.put('/auth/profile', data);
export const logout = () => apiClient.post('/auth/logout');
