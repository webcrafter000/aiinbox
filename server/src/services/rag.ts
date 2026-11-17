import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { generateEmbedding } from './embedding.js';
import { searchSimilarChunks, ScoredChunk } from './vectorStore.js';

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

export interface RagResponse {
  answer: string;
  sources: CitedSource[];
}

export async function answerQuestion(query: string): Promise<RagResponse> {
  const queryEmbedding = await generateEmbedding(query);
  const relevantChunks: ScoredChunk[] = searchSimilarChunks(queryEmbedding, 4, 0.2);

  if (relevantChunks.length === 0) {
    return {
      answer:
        'I could not find any relevant information in your saved knowledge inbox to answer this question.',
      sources: [],
    };
  }

  const sources: CitedSource[] = relevantChunks.map((chunk, idx) => ({
    sourceNumber: idx + 1,
    chunkId: chunk.id,
    itemId: chunk.item_id,
    title: chunk.item_title,
    type: chunk.item_type,
    sourceUrl: chunk.source_url,
    snippet: chunk.content,
    score: Math.round(chunk.score * 100) / 100,
  }));

  const contextBlock = sources
    .map(
      (s) =>
        `[Source ${s.sourceNumber}] (Title: "${s.title}"${s.sourceUrl ? `, URL: ${s.sourceUrl}` : ''}):\n${s.snippet}`
    )
    .join('\n\n---\n\n');

  const systemInstruction = `
You are an AI assistant answering questions based solely on the user's saved knowledge inbox context provided below.
Rules:
1. Answer the question accurately using ONLY facts directly mentioned in the Context.
2. If the context does not contain enough information to answer completely, state clearly what is unknown.
3. Every time you state a fact from a source, cite it inline using [Source X] (e.g., "...as described in [Source 1]").
4. Keep the response clear, structured, and concise.
`.trim();

  const prompt = `
Context:
${contextBlock}

Question:
${query}
`.trim();

  const client = getClient();
  const model = client.getGenerativeModel({
    model: config.generationModel,
    systemInstruction,
  });

  const response = await model.generateContent(prompt);
  const answerText = response.response.text();

  return {
    answer: answerText,
    sources,
  };
}
