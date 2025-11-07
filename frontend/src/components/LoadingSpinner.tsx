import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'AI is thinking...' }) => {
  return (
    <div className="flex flex-col items-start justify-center py-8 px-4">
      {/* Three dot loader with soft gradient */}
      <div className="flex gap-2 mb-4">
        <div 
          className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-bounce shadow-lg shadow-emerald-500/40 dark:shadow-emerald-600/20"
          style={{ animationDelay: '0s', animationDuration: '0.6s' }}
        />
        <div 
          className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 animate-bounce shadow-lg shadow-teal-500/40 dark:shadow-teal-600/20"
          style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}
        />
        <div 
          className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 animate-bounce shadow-lg shadow-cyan-500/40 dark:shadow-cyan-600/20"
          style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}
        />
      </div>

      {/* Optional message */}
      {message && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;