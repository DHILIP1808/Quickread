import React from 'react';
import { FileText, Plus } from 'lucide-react';

interface HeaderProps {
  onNewChat?: () => void;
  currentDocument?: string;
  showNewChatButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewChat, currentDocument }) => {
  return (
    <header className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
            <FileText size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              LLM Retriever
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">Document Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {currentDocument && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-none">
                Current Document
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                {currentDocument}
              </span>
            </div>
          )}
          <button
            onClick={onNewChat}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;