import axios, { type AxiosInstance } from 'axios';
import type { UploadResponse, QueryResponse, QueryRequest, Document } from '../types';

const API_BASE_URL = 'https://quickread-backend.onrender.com';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add error interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Upload document
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Query document
  async queryDocument(request: QueryRequest): Promise<QueryResponse> {
    const response = await this.api.post('/query', request);
    return response.data;
  }

  // List documents
  async listDocuments(): Promise<Document[]> {
    const response = await this.api.get('/documents');
    return response.data.documents;
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/document/${documentId}`);
    return response.data;
  }
}

export default new ApiService();