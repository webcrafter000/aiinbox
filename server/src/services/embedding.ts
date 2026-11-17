import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: config.embeddingModel });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();
  const model = client.getGenerativeModel({ model: config.embeddingModel });

  const BATCH_SIZE = 10;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const requests = batch.map((t) => ({
      content: { role: 'user', parts: [{ text: t }] },
    }));

    const response = await model.batchEmbedContents({ requests });
    for (const item of response.embeddings) {
      results.push(item.values);
    }
  }

  return results;
}
