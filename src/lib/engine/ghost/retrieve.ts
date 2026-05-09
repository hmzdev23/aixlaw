import { tokenize, type PrecedentChunk } from "./chunker";

/**
 * Lightweight BM25 over precedent chunks.
 *
 * No external embeddings — keeps the engine portable for the hackathon and
 * removes a dependency. Scoring quality is "good enough" for a 17-clause corpus.
 *
 * If we move to embeddings later, replace `score` and keep the Retriever
 * surface unchanged.
 */

const K1 = 1.5;
const B = 0.75;

export interface RetrievalHit {
  chunk: PrecedentChunk;
  score: number;
}

export class Retriever {
  private readonly chunks: PrecedentChunk[];
  private readonly avgLen: number;
  private readonly df: Map<string, number>;
  private readonly N: number;

  constructor(chunks: PrecedentChunk[]) {
    this.chunks = chunks;
    this.N = chunks.length;
    this.avgLen =
      chunks.reduce((sum, c) => sum + c.tokens.length, 0) /
      Math.max(1, chunks.length);
    this.df = new Map();
    for (const c of chunks) {
      const seen = new Set<string>();
      for (const t of c.tokens) {
        if (seen.has(t)) continue;
        seen.add(t);
        this.df.set(t, (this.df.get(t) ?? 0) + 1);
      }
    }
  }

  search(query: string, k = 4): RetrievalHit[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const scores: RetrievalHit[] = this.chunks.map((chunk) => {
      let s = 0;
      const docLen = Math.max(1, chunk.tokens.length);
      const tf = countTerms(chunk.tokens);
      for (const q of queryTokens) {
        const f = tf.get(q) ?? 0;
        if (f === 0) continue;
        const dfQ = this.df.get(q) ?? 0;
        const idf = Math.log(1 + (this.N - dfQ + 0.5) / (dfQ + 0.5));
        s += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * docLen) / this.avgLen)));
      }
      return { chunk, score: s };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.filter((h) => h.score > 0).slice(0, k);
  }

  /** Total number of indexed chunks. */
  size(): number {
    return this.chunks.length;
  }
}

function countTerms(tokens: string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of tokens) out.set(t, (out.get(t) ?? 0) + 1);
  return out;
}
