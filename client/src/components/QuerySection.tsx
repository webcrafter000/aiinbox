import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface QuerySectionProps {
  onSearch: (query: string) => Promise<void>;
  loading: boolean;
  itemCount: number;
}

export const QuerySection: React.FC<QuerySectionProps> = ({ onSearch, loading, itemCount }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Ask Your Inbox
        </h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Ask natural language questions. Semantic search retrieves the most relevant chunks and generates an answer with verifiable citations.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              itemCount === 0
                ? 'Add some notes or URLs first to ask questions...'
                : 'e.g. What were the key conclusions from the architecture review?'
            }
            disabled={loading || itemCount === 0}
            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim() || itemCount === 0}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying...</span>
            </>
          ) : (
            <span>Ask</span>
          )}
        </button>
      </form>
    </div>
  );
};
