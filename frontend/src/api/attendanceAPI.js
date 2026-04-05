// cat > frontend/src/api/attendanceAPI.js << 'EOF'
import apiClient from './apiClient';

export const markAttendance = (data) => apiClient.post('/attendance/mark', data);
export const getAttendanceReport = (params) => apiClient.get('/attendance/report', { params });
export const getEmployeeAttendance = (params) => apiClient.get('/attendance/my-attendance', { params });
export const approveAttendance = (id) => apiClient.put(`/attendance/${id}/approve`);
export const deleteAttendance = (id) => apiClient.delete(`/attendance/${id}`);
// EOF