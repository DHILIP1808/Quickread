import React from 'react';
import type { Message } from '../types';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.type === 'user';

  const cleanContent = (content: string) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];
    let cleanedContent = content.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    cleanedContent = cleanedContent
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\u00A0/g, ' ');

    cleanedContent = cleanedContent
      .replace(/\\x[0-9a-fA-F]{2}/g, '')
      .replace(/\\u[0-9a-fA-F]{4}/g, '')
      .replace(/\\[rnt]/g, '');

    const lines = cleanedContent.split('\n');
    cleanedContent = lines
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n');

    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    codeBlocks.forEach((block, idx) => {
      cleanedContent = cleanedContent.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    return cleanedContent.trim();
  };

  const parseMarkdown = (text: string) => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');
    
    text = text.replace(/`(.+?)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-mono text-slate-900 dark:text-slate-100">$1</code>');
    
    return text;
  };

  const renderContent = (content: string) => {
    const cleanedContent = cleanContent(content);
    const parts = cleanedContent.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        const lines = code.split('\n');
        const language = lines[0] || 'text';
        const codeContent = lines.slice(1).join('\n').trim() || code;

        return (
          <div key={idx} className="my-4 rounded-lg overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-900">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{language}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="text-xs px-2 py-1 hover:bg-slate-700 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="px-4 py-4 overflow-x-auto">
              <code className="text-sm text-slate-100 font-mono leading-relaxed">{codeContent}</code>
            </pre>
          </div>
        );
      }

      const formattedText = parseMarkdown(part);
      
      return (
        <div 
          key={idx} 
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <div className={`flex gap-3 mb-6 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl`}>
        <div
          className={`px-5 py-3.5 rounded-2xl transition-all shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="break-words text-sm leading-relaxed">
            {renderContent(message.content)}
          </div>
        </div>

        {/* Timestamp and Copy Button */}
        <div className={`flex items-center gap-2.5 mt-2.5 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Copy message"
            >
              {copied ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;