export interface Item {
  id: string;
  type: 'text' | 'url';
  title: string;
  raw_content: string;
  source_url: string | null;
  created_at: string;
  chunk_count: number;
}

export interface CitedSource {
  sourceNumber: number;
  chunkId: string;
  itemId: string;
  title: string;
  type: 'text' | 'url';
  sourceUrl: string | null;
  snippet: string;
  score: number;
}

export interface QueryResult {
  answer: string;
  sources: CitedSource[];
}

export interface IngestPayload {
  type: 'text' | 'url';
  content: string;
  title?: string;
}

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  getHealth: () => request<{ status: string; hasApiKey: boolean }>('/health'),
  getItems: () => request<{ items: Item[] }>('/items'),
  deleteItem: (id: string) => request<{ success: boolean }>(`/items/${id}`, { method: 'DELETE' }),
  ingest: (payload: IngestPayload) =>
    request<{ success: boolean; item: Item }>('/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  query: (query: string) =>
    request<QueryResult>('/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
