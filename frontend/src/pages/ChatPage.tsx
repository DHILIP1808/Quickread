import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';

interface ChatPageProps {
  documentId: string;
  documentName: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ documentId, documentName }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-900 dark:text-red-200 text-sm">Error</p>
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ChatInterface
          documentId={documentId}
          documentName={documentName}
          onError={setError}
        />
      </div>
    </div>
  );
};

export default ChatPage;