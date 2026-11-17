import React from 'react';
import { Database, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  hasApiKey: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({ itemCount, hasApiKey }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">AI Knowledge Inbox</h1>
            <p className="text-xs text-slate-500">Semantic Search & RAG Knowledge Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>{itemCount} {itemCount === 1 ? 'source' : 'sources'} indexed</span>
          </div>

          {hasApiKey !== null && (
            <div
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={hasApiKey ? 'Gemini API configured' : 'GEMINI_API_KEY missing in .env'}
            >
              {hasApiKey ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">Gemini Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Missing GEMINI_API_KEY</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
