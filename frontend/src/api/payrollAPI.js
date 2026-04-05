// cat > frontend/src/api/payrollAPI.js << 'EOF'
import apiClient from './apiClient';

export const createPayroll = (data) => apiClient.post('/payroll/create', data);
export const getPayroll = (params) => apiClient.get('/payroll', { params });
export const getEmployeePayroll = (params) => apiClient.get('/payroll/employee/my-payroll', { params });
export const updatePayroll = (id, data) => apiClient.put(`/payroll/${id}`, data);
export const approvePayroll = (id) => apiClient.put(`/payroll/${id}/approve`);
export const markPayrollAsPaid = (id) => apiClient.put(`/payroll/${id}/mark-paid`);
export const deletePayroll = (id) => apiClient.delete(`/payroll/${id}`);