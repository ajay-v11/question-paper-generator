import api from './api';

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const saveDocumentContent = async (data) => {
  const response = await api.post('/documents/save-content', data);
  return response.data;
};

export const createPaperDraft = async (data) => {
  const response = await api.post('/papers/create-draft', data);
  return response.data;
};

export const getPapers = async () => {
  const response = await api.get('/papers/');
  return response.data;
};
