import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler.js';
import { scrapeUrl } from '../services/scraper.js';
import { chunkText } from '../services/chunker.js';
import { generateBatchEmbeddings } from '../services/embedding.js';
import { repository, ItemRecord, ChunkRecord } from '../db/repository.js';

export const ingestRouter = Router();

ingestRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, content, title } = req.body;

    if (!type || !['text', 'url'].includes(type)) {
      throw new AppError(400, "Field 'type' must be either 'text' or 'url'");
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new AppError(400, "Field 'content' must be a non-empty string");
    }

    let itemTitle = title ? String(title).trim() : '';
    let rawContent = '';
    let sourceUrl: string | null = null;

    if (type === 'url') {
      sourceUrl = content.trim();
      const scraped = await scrapeUrl(sourceUrl);
      rawContent = scraped.content;
      if (!itemTitle) {
        itemTitle = scraped.title || sourceUrl;
      }
    } else {
      rawContent = content.trim();
      if (!itemTitle) {
        const firstLine = rawContent.split('\n')[0].trim();
        itemTitle = firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
      }
    }

    const chunkTexts = chunkText(rawContent);
    if (chunkTexts.length === 0) {
      throw new AppError(422, 'Content does not contain enough text to extract meaningful chunks');
    }

    const embeddings = await generateBatchEmbeddings(chunkTexts);

    const itemId = randomUUID();
    const now = new Date().toISOString();

    const itemRecord: ItemRecord = {
      id: itemId,
      type,
      title: itemTitle,
      raw_content: rawContent,
      source_url: sourceUrl,
      created_at: now,
    };

    const chunkRecords: ChunkRecord[] = chunkTexts.map((textChunk, index) => ({
      id: randomUUID(),
      item_id: itemId,
      chunk_index: index,
      content: textChunk,
      embedding: embeddings[index],
    }));

    repository.saveItemWithChunks(itemRecord, chunkRecords);

    res.status(201).json({
      success: true,
      item: {
        id: itemId,
        type,
        title: itemTitle,
        source_url: sourceUrl,
        created_at: now,
        chunk_count: chunkRecords.length,
      },
    });
  } catch (err) {
    next(err);
  }
});
