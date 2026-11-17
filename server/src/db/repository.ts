import { getDatabase } from './connection.js';

export interface ItemRecord {
  id: string;
  type: 'text' | 'url';
  title: string;
  raw_content: string;
  source_url: string | null;
  created_at: string;
}

export interface ItemSummary extends ItemRecord {
  chunk_count: number;
}

export interface ChunkRecord {
  id: string;
  item_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
}

export interface StoredChunkWithItem {
  id: string;
  item_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  item_title: string;
  item_type: 'text' | 'url';
  source_url: string | null;
}

export class KnowledgeRepository {
  private db = getDatabase();

  saveItemWithChunks(item: ItemRecord, chunks: ChunkRecord[]): void {
    const insertItem = this.db.prepare(`
      INSERT INTO items (id, type, title, raw_content, source_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertChunk = this.db.prepare(`
      INSERT INTO chunks (id, item_id, chunk_index, content, embedding)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertItem.run(
      item.id,
      item.type,
      item.title,
      item.raw_content,
      item.source_url,
      item.created_at
    );

    for (const chunk of chunks) {
      insertChunk.run(
        chunk.id,
        chunk.item_id,
        chunk.chunk_index,
        chunk.content,
        JSON.stringify(chunk.embedding)
      );
    }
  }

  listItems(): ItemSummary[] {
    const stmt = this.db.prepare(`
      SELECT 
        i.id,
        i.type,
        i.title,
        i.raw_content,
        i.source_url,
        i.created_at,
        COUNT(c.id) as chunk_count
      FROM items i
      LEFT JOIN chunks c ON i.id = c.item_id
      GROUP BY i.id
      ORDER BY datetime(i.created_at) DESC
    `);

    return stmt.all() as unknown as ItemSummary[];
  }

  getItemById(id: string): ItemRecord | null {
    const stmt = this.db.prepare(`SELECT * FROM items WHERE id = ?`);
    const row = stmt.get(id);
    return (row as unknown as ItemRecord) || null;
  }

  deleteItem(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM items WHERE id = ?`);
    const result = stmt.run(id) as { changes?: number };
    return (result.changes ?? 0) > 0;
  }

  getAllChunksForSearch(): StoredChunkWithItem[] {
    const stmt = this.db.prepare(`
      SELECT 
        c.id,
        c.item_id,
        c.chunk_index,
        c.content,
        c.embedding,
        i.title as item_title,
        i.type as item_type,
        i.source_url
      FROM chunks c
      JOIN items i ON c.item_id = i.id
    `);

    const rows = stmt.all() as Array<{
      id: string;
      item_id: string;
      chunk_index: number;
      content: string;
      embedding: string;
      item_title: string;
      item_type: 'text' | 'url';
      source_url: string | null;
    }>;

    return rows.map((row) => ({
      ...row,
      embedding: JSON.parse(row.embedding) as number[],
    }));
  }
}

export const repository = new KnowledgeRepository();
