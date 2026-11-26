import apiClient from './client';

export async function getEmployees(params = {}) {
  const { data } = await apiClient.get('/employees', { params });
  return data;
}

export async function getEmployeeById(id) {
  const { data } = await apiClient.get(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload) {
  const { data } = await apiClient.post('/employees', payload);
  return data;
}

export async function updateEmployee(id, payload) {
  const { data } = await apiClient.put(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id) {
  const { data } = await apiClient.delete(`/employees/${id}`);
  return data;
}

