import React, { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import { AlertCircle, X } from 'lucide-react';

interface UploadPageProps {
  onDocumentUploaded: (documentId: string, filename: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onDocumentUploaded }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-4 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
            <p className="text-red-700 dark:text-red-200 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
      )}
      <DocumentUpload
        onDocumentUploaded={onDocumentUploaded}
        onError={setError}
      />
    </div>
  );
};

export default UploadPage;