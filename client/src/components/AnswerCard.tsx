import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Quote, Layers } from 'lucide-react';
import { QueryResult } from '../api';

interface AnswerCardProps {
  result: QueryResult | null;
  lastQuery: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ result, lastQuery }) => {
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  if (!result) return null;

  const toggleSource = (sourceNumber: number) => {
    setExpandedSources((prev) => ({
      ...prev,
      [sourceNumber]: !prev[sourceNumber],
    }));
  };

  const renderFormattedInline = (str: string) => {
    const parts = str.split(/(\[Source \d+\]|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (/^\[Source \d+\]$/.test(part)) {
        return (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 mx-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatAnswer = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-800">
                {renderFormattedInline(trimmed.slice(2))}
              </li>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-slate-800">
              {renderFormattedInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <div className="text-xs font-medium text-slate-400 mb-1">Answer to:</div>
        <h3 className="text-base font-semibold text-slate-800 italic">"{lastQuery}"</h3>
      </div>

      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
        {formatAnswer(result.answer)}
      </div>

      {result.sources.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Layers className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Retrieved Sources & Context ({result.sources.length})
            </h4>
          </div>

          <div className="space-y-2.5">
            {result.sources.map((source) => {
              const isExpanded = expandedSources[source.sourceNumber] ?? true;
              return (
                <div
                  key={source.chunkId}
                  className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleSource(source.sourceNumber)}
                    className="p-3 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer text-xs select-none"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded text-[11px]">
                        Source {source.sourceNumber}
                      </span>
                      <span className="font-medium text-slate-800 truncate" title={source.title}>
                        {source.title}
                      </span>
                      {source.sourceUrl && (
                        <a
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                          title="Open original link"
                        >
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {(source.score * 100).toFixed(0)}% match
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 text-xs text-slate-600 bg-white border-t border-slate-100 leading-normal flex items-start space-x-2">
                      <Quote className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                      <p className="font-serif italic text-slate-700">{source.snippet}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
