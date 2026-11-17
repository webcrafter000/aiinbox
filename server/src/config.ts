import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export interface Config {
  port: number;
  geminiApiKey: string;
  dbPath: string;
  embeddingModel: string;
  generationModel: string;
}

export function loadConfig(): Config {
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  const port = parseInt(process.env.PORT || '3001', 10);
  const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../knowledge.db');
  const embeddingModel = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
  const generationModel = process.env.GENERATION_MODEL || 'gemini-3.6-flash';

  return {
    port,
    geminiApiKey,
    dbPath,
    embeddingModel,
    generationModel,
  };
}

export const config = loadConfig();
