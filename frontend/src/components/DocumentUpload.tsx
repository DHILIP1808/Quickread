import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, File, X } from 'lucide-react';
import { AxiosError } from 'axios';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface DocumentUploadProps {
  onDocumentUploaded: (documentId: string, filename: string) => void;
  onError: (error: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const allowedExtensions = ['.pdf', '.txt', '.docx', '.xlsx', '.zip'];

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      onError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      onError('File size exceeds 50MB limit');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error');
      return;
    }
    setSelectedFile(file);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.uploadDocument(selectedFile);
      setUploadStatus('success');
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        onDocumentUploaded(response.document_id, response.filename);
      }, 1000);
    } catch (error: unknown) {
      setUploadStatus('error');

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail ||
          error.message ||
          'Failed to upload document';
        onError(message);
      } else if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred during upload');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return <LoadingSpinner message="Uploading and processing document..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-6">
            <Upload size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Upload Your Document
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Start asking questions and unlock document insights with AI
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={handleDropAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'scale-100'}`}>
              <Upload size={52} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Drag and drop your file here
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">or click to select from your device</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) =>
              e.target.files && handleFileSelect(e.target.files[0])
            }
            className="hidden"
            accept=".pdf,.txt,.docx,.xlsx,.zip"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Browse Files
          </button>
        </div>

        {/* Supported Formats */}
        <div className="mt-8 p-5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Supported formats:</span> PDF, TXT, DOCX, XLSX, ZIP
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            <span className="font-semibold">Maximum file size:</span> 50 MB
          </p>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="mt-8 p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-md">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <File size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{selectedFile.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              Upload Document
            </button>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="mt-8 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Document uploaded successfully! Redirecting...
            </p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 font-semibold">
              Upload failed. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;