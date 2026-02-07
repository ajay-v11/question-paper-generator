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

export const getPapers = async (page = 1, limit = 10) => {
  const response = await api.get(`/papers/?page=${page}&limit=${limit}`);
  return response.data;
};

export const deletePaper = async (paperId) => {
  const response = await api.delete(`/papers/${paperId}`);
  return response.data;
};

export const downloadPaper = async (paperId, format) => {
  const response = await api.get(`/papers/${paperId}/download?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const processDocument = async (docId) => {
  const response = await api.post(`/documents/process/${docId}`);
  return response.data;
};

export const getDocumentStatus = async (docId) => {
  const response = await api.get(`/documents/status/${docId}`);
  return response.data;
};

export const getDocumentContent = async (docId) => {
  const response = await api.get(`/documents/content/${docId}`);
  return response.data;
};

export const processRAG = async (docId) => {
  const response = await api.post(`/rag/process/${docId}`);
  return response.data;
};

export const getRAGStatus = async (docId) => {
  const response = await api.get(`/rag/status/${docId}`);
  return response.data;
};

export const startGeneration = async (data) => {
  const response = await api.post('/generation/generate', data);
  return response.data;
};

export const getGenerationStatus = async (paperId) => {
  const response = await api.get(`/generation/status/${paperId}`);
  return response.data;
};

export const getPaperWithQuestions = async (paperId) => {
  const response = await api.get(`/papers/${paperId}`);
  return response.data;
};
