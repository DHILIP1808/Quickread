import React, { useState } from 'react';
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';

type Page = 'upload' | 'chat';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [documentId, setDocumentId] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');

  const handleDocumentUploaded = (docId: string, filename: string) => {
    setDocumentId(docId);
    setDocumentName(filename);
    setCurrentPage('chat');
  };

  const handleNewChat = () => {
    setDocumentId('');
    setDocumentName('');
    setCurrentPage('upload');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        onNewChat={handleNewChat}
        currentDocument={currentPage === 'chat' ? documentName : undefined}
      />
      <div className="flex-1 min-h-0">
        {currentPage === 'upload' ? (
          <UploadPage onDocumentUploaded={handleDocumentUploaded} />
        ) : (
          <ChatPage documentId={documentId} documentName={documentName} />
        )}
      </div>
    </div>
  );
};

export default App;