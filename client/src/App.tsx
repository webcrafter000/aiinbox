import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { IngestForm } from './components/IngestForm';
import { ItemsList } from './components/ItemsList';
import { QuerySection } from './components/QuerySection';
import { AnswerCard } from './components/AnswerCard';
import { api, Item, QueryResult } from './api';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.getHealth();
      setHasApiKey(res.hasApiKey);
    } catch {
      setHasApiKey(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await api.getItems();
      setItems(res.items);
    } catch (err: any) {
      console.error('Failed to load items', err);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    loadItems();
  }, [fetchStatus, loadItems]);

  const handleSearch = async (query: string) => {
    setQueryLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const res = await api.query(query);
      setQueryResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to complete query');
      setQueryResult(null);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header itemCount={items.length} hasApiKey={hasApiKey} />

      {hasApiKey === false && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 font-medium flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            No <code>GEMINI_API_KEY</code> detected. Add your Gemini API key to <code>.env</code> in the project directory to enable embedding and answers.
          </span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {error && (
          <div className="mb-6 flex items-start space-x-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <IngestForm onItemIngested={loadItems} />
            <ItemsList
              items={items}
              loading={loadingItems}
              onItemDeleted={() => {
                loadItems();
                if (items.length <= 1) setQueryResult(null);
              }}
            />
          </div>

          <div className="lg:col-span-7">
            <QuerySection
              onSearch={handleSearch}
              loading={queryLoading}
              itemCount={items.length}
            />

            {queryResult ? (
              <AnswerCard result={queryResult} lastQuery={lastQuery} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">RAG Semantic Search Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Save notes or URLs on the left. When you ask a question, relevant chunks are matched with cosine similarity and synthesized into an answer with citations.
                </p>
                {items.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Try asking:
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      <button
                        type="button"
                        onClick={() => handleSearch('Summarize everything saved in my inbox')}
                        className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        "Summarize everything saved"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
