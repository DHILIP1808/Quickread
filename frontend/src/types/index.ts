export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Document {
  document_id: string;
  filename: string;
  upload_date: string;
  file_size: number;
}

export interface UploadResponse {
  document_id: string;
  filename: string;
  status: string;
  message: string;
}

export interface QueryRequest {
  document_id: string;
  question: string;
  temperature?: number;
}

export interface QueryResponse {
  document_id: string;
  question: string;
  answer: string;
  model: string;
}

export interface ApiError {
  detail: string;
}