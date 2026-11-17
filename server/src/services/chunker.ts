export interface ChunkOptions {
  targetSize?: number;
  overlap?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const targetSize = options.targetSize ?? 600;
  const overlap = options.overlap ?? 100;

  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  if (normalized.length <= targetSize) {
    return [normalized];
  }

  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (trimmedPara.length > targetSize) {
      const sentences = splitIntoSentences(trimmedPara);
      for (const sentence of sentences) {
        if ((current + ' ' + sentence).trim().length <= targetSize) {
          current = current ? `${current} ${sentence}` : sentence;
        } else {
          if (current) {
            chunks.push(current.trim());
            const tail = current.slice(-overlap);
            current = `${tail} ${sentence}`.trim();
          } else {
            const hardSlices = sliceHard(sentence, targetSize, overlap);
            chunks.push(...hardSlices.slice(0, -1));
            current = hardSlices[hardSlices.length - 1] || '';
          }
        }
      }
    } else {
      if ((current + '\n\n' + trimmedPara).trim().length <= targetSize) {
        current = current ? `${current}\n\n${trimmedPara}` : trimmedPara;
      } else {
        if (current) {
          chunks.push(current.trim());
          const tail = current.slice(-overlap);
          current = `${tail}\n\n${trimmedPara}`.trim();
        } else {
          current = trimmedPara;
        }
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 20);
}

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  if (!matches) return [text];
  return matches.map((m) => m.trim()).filter(Boolean);
}

function sliceHard(text: string, size: number, overlap: number): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    result.push(text.slice(i, i + size).trim());
    i += size - overlap;
  }
  return result;
}
