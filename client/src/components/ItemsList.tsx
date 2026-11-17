import React from 'react';
import { FileText, Globe, Trash2, ExternalLink, Inbox } from 'lucide-react';
import { Item, api } from '../api';

interface ItemsListProps {
  items: Item[];
  loading: boolean;
  onItemDeleted: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({ items, loading, onItemDeleted }) => {
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" and its indexed chunks?`)) return;
    try {
      await api.deleteItem(id);
      onItemDeleted();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
          Saved Knowledge ({items.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1">
        {loading && items.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading saved items...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 stroke-1 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Inbox is empty</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Add a text note or paste a web URL to begin building your knowledge base.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-start justify-between space-x-3"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="mt-0.5 p-1.5 rounded bg-white shadow-2xs text-slate-600">
                  {item.type === 'url' ? (
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-semibold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Open external link"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {item.raw_content}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400">
                    <span>{formatDate(item.created_at)}</span>
                    <span>•</span>
                    <span className="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {item.chunk_count} {item.chunk_count === 1 ? 'chunk' : 'chunks'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id, item.title)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
