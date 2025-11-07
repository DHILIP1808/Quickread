import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, User, Bot } from 'lucide-react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../services/api';
import { AxiosError } from 'axios';

interface ChatInterfaceProps {
  documentId: string;
  documentName: string;
  onError: (error: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  documentId,
  documentName,
  onError,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiService.queryDocument({
        document_id: documentId,
        question: userMessage.content,
        temperature,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      let errorMessage = 'Failed to get response from LLM';

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.detail || 'Server returned an unexpected error';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      onError(errorMessage);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl px-4">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 mb-4">
                  <Bot size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
                How can I help you today?
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Ask questions about{' '}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {documentName}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.type === 'assistant'
                    ? 'bg-slate-50 dark:bg-slate-800/50'
                    : 'bg-white dark:bg-slate-900'
                } border-b border-slate-100 dark:border-slate-800`}
              >
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                  <div className="flex gap-4 items-start">
                    {message.type === 'user' ? (
                      <>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <MessageBubble message={message} />
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-emerald-500 flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-slate-700 dark:bg-slate-600 flex items-center justify-center">
                          <Bot size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <MessageBubble message={message} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-slate-700 dark:bg-slate-600 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <LoadingSpinner message="AI is thinking..." />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  Temperature:
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <div className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 min-w-12 text-center">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {temperature.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Lower values make responses more focused, higher values more creative
              </p>
            </div>
          )}

          {/* Input Field */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${
                showSettings
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-shadow bg-white shadow-sm text-[15px]"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 rounded-xl p-2.5 transition-colors"
              title="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-transparent animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;