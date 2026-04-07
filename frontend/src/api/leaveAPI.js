// cat > frontend/src/api/leaveAPI.js << 'EOF'
import apiClient from './apiClient';

export const applyLeave = (data) => apiClient.post('/leaves/apply', data);
export const getLeaveApplications = (params) => apiClient.get('/leaves/my-applications', { params });
export const getPendingLeaves = (params) => apiClient.get('/leaves/pending', { params });
export const getAllLeaves = (params) => apiClient.get('/leaves/admin/all', { params });
export const approveLeave = (id) => apiClient.put(`/leaves/${id}/approve`);
export const rejectLeave = (id, data) => apiClient.put(`/leaves/${id}/reject`, data);
export const cancelLeave = (id) => apiClient.put(`/leaves/${id}/cancel`);
// EOF