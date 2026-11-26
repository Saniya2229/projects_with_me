import apiClient from './client';

export async function getTasks(params = {}) {
  const { data } = await apiClient.get('/tasks', { params });
  return data;
}

export async function getTaskById(id) {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return data;
}

export async function createTask(payload) {
  const { data } = await apiClient.post('/tasks', payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(id, status) {
  const { data } = await apiClient.put(`/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id) {
  const { data } = await apiClient.delete(`/tasks/${id}`);
  return data;
}

export async function exportTasksCsv(params = {}) {
  const response = await apiClient.get('/tasks/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

