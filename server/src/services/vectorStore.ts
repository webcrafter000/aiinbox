import { repository, StoredChunkWithItem } from '../db/repository.js';

export interface ScoredChunk extends StoredChunkWithItem {
  score: number;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

export function searchSimilarChunks(
  queryEmbedding: number[],
  topK = 4,
  minThreshold = 0.25
): ScoredChunk[] {
  const allChunks = repository.getAllChunksForSearch();
  if (allChunks.length === 0) return [];

  const scored: ScoredChunk[] = allChunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return scored
    .filter((c) => c.score >= minThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
