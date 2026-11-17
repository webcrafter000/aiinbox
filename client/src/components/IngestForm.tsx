import React, { useState } from 'react';
import { FileText, Globe, Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { api, IngestPayload } from '../api';

interface IngestFormProps {
  onItemIngested: () => void;
}

export const IngestForm: React.FC<IngestFormProps> = ({ onItemIngested }) => {
  const [tab, setTab] = useState<'text' | 'url'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload: IngestPayload = {
      type: tab,
      content: content.trim(),
      ...(title.trim() ? { title: title.trim() } : {}),
    };

    try {
      const res = await api.ingest(payload);
      setTitle('');
      setContent('');
      setSuccessMsg(`Ingested "${res.item.title}" (${res.item.chunk_count} chunks generated)`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onItemIngested();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest item');
    } finally {
      setLoading(false);
    }
  };

  const isPastedUrl = tab === 'text' && /^https?:\/\/[^\s]+$/i.test(content.trim());

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
          Add Knowledge
        </h2>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab('text');
              setError(null);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
              tab === 'text'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('url');
              setError(null);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
              tab === 'url'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web URL</span>
          </button>
        </div>
      </div>

      {isPastedUrl && (
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-800">
          <span>You pasted a link into "Note". Want to scrape the full webpage?</span>
          <button
            type="button"
            onClick={() => setTab('url')}
            className="ml-2 font-semibold text-blue-700 underline hover:text-blue-900 shrink-0 cursor-pointer"
          >
            Switch to Web URL
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Title <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={tab === 'text' ? 'e.g., Weekly Team Sync' : 'e.g., System Architecture Guide'}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {tab === 'text' ? 'Note Content *' : 'Web URL *'}
          </label>
          {tab === 'text' ? (
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write notes, guidelines, meeting summaries, or research here..."
              required
              disabled={loading}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y"
            />
          ) : (
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com/article"
              required
              disabled={loading}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{tab === 'url' ? 'Fetching & Indexing...' : 'Chunking & Embedding...'}</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Save & Index</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
