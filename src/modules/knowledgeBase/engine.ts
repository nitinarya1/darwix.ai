import { KnowledgeChunk, SearchResult, RetrievalTestCase } from '../../types';
import { DataCleaningPipeline } from './pipeline';
import { RAW_BUSINESS_CORPUS } from './rawCorpus';

export class HybridKnowledgeEngine {
  private chunks: KnowledgeChunk[] = [];
  private pipeline: DataCleaningPipeline;
  private idfMap: Map<string, number> = new Map();
  private avgDocLen = 0;

  constructor() {
    this.pipeline = new DataCleaningPipeline();
    this.init();
  }

  public init(): void {
    const cleanedDocs = this.pipeline.processRawCorpus(RAW_BUSINESS_CORPUS);
    // Collect active chunks from non-duplicate documents
    this.chunks = cleanedDocs
      .filter(doc => !doc.is_near_duplicate)
      .flatMap(doc => doc.chunks);

    this.computeBM25Stats();
  }

  public getAllChunks(): KnowledgeChunk[] {
    return this.chunks;
  }

  private computeBM25Stats(): void {
    const N = this.chunks.length;
    let totalLen = 0;
    const docFreq: Map<string, number> = new Map();

    for (const chunk of this.chunks) {
      const words = this.tokenize(chunk.content);
      totalLen += words.length;
      const uniqueWords = new Set(words);
      for (const word of uniqueWords) {
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }

    this.avgDocLen = N > 0 ? totalLen / N : 1;

    for (const [word, df] of docFreq.entries()) {
      // Standard BM25 IDF formulation
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      this.idfMap.set(word, Math.max(0.1, idf));
    }
  }

  private tokenize(text: string): string[] {
    return (text.toLowerCase().match(/\b[a-z0-9$%.-]+\b/g) || []);
  }

  private scoreBM25(queryWords: string[], chunk: KnowledgeChunk): number {
    const docWords = this.tokenize(chunk.content);
    const docLen = docWords.length;
    const tfMap = new Map<string, number>();
    for (const w of docWords) {
      tfMap.set(w, (tfMap.get(w) || 0) + 1);
    }

    const k1 = 1.5;
    const b = 0.75;
    let score = 0;

    for (const q of queryWords) {
      const tf = tfMap.get(q) || 0;
      if (tf > 0) {
        const idf = this.idfMap.get(q) || 0.5;
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLen / this.avgDocLen));
        score += idf * (numerator / denominator);
      }
    }

    return score;
  }

  private cosineSimilarity(v1: number[], v2: number[]): number {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      normA += v1[i] * v1[i];
      normB += v2[i] * v2[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }

  private generateQueryEmbedding(query: string): number[] {
    const dims = 32;
    const vector = new Array(dims).fill(0);
    const clean = query.toLowerCase();

    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      const dim = (code * 17 + i * 31) % dims;
      vector[dim] += Math.sin(code + i);
    }

    const keyAxes: Record<string, number> = {
      'rate': 2, 'interest': 2, 'apr': 2, 'prime': 2, 'cost': 2,
      'eligibility': 7, 'operational': 7, 'revenue': 7, 'fico': 7, 'score': 7, 'seasonal': 7, 'months': 7,
      'objection': 12, 'traditional': 12, 'bank': 12, 'speed': 12, 'why': 12, 'expensive': 12,
      'disbursement': 18, 'wire': 18, 'ach': 18, 'settle': 18, 'instant': 18, 'fast': 18, 'quickly': 18,
      'escalation': 24, 'human': 24, 'transfer': 24, 'officer': 24, 'unsupported': 24,
      'prepayment': 29, 'grace': 29, 'fee': 29, 'penalty': 29, 'late': 29
    };

    for (const [term, axis] of Object.entries(keyAxes)) {
      if (clean.includes(term)) {
        vector[axis] += 3.5;
      }
    }

    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => Number((v / norm).toFixed(4)));
  }

  // Hybrid Search with Reciprocal Rank Fusion (RRF)
  public search(query: string, topK = 3): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const queryVec = this.generateQueryEmbedding(query);

    // Compute BM25 rankings
    const bm25Scores = this.chunks.map(chunk => ({
      chunk,
      score: this.scoreBM25(queryTokens, chunk)
    })).sort((a, b) => b.score - a.score);

    // Compute Dense semantic cosine rankings
    const denseScores = this.chunks.map(chunk => ({
      chunk,
      score: this.cosineSimilarity(queryVec, chunk.embedding)
    })).sort((a, b) => b.score - a.score);

    // Reciprocal Rank Fusion (RRF constant k = 60)
    const k = 60;
    const rrfScores = new Map<string, { chunk: KnowledgeChunk; rrf: number; bm25: number; dense: number }>();

    bm25Scores.forEach((item, rank) => {
      const id = item.chunk.chunk_id;
      const current = rrfScores.get(id) || { chunk: item.chunk, rrf: 0, bm25: item.score, dense: 0 };
      current.rrf += 1 / (k + rank + 1);
      current.bm25 = item.score;
      rrfScores.set(id, current);
    });

    denseScores.forEach((item, rank) => {
      const id = item.chunk.chunk_id;
      const current = rrfScores.get(id) || { chunk: item.chunk, rrf: 0, bm25: 0, dense: item.score };
      current.rrf += 1 / (k + rank + 1);
      current.dense = item.score;
      rrfScores.set(id, current);
    });

    const sorted = Array.from(rrfScores.values())
      .sort((a, b) => b.rrf - a.rrf)
      .slice(0, topK);

    return sorted.map(item => ({
      chunk: item.chunk,
      score: Number((item.rrf * 100).toFixed(2)),
      denseScore: Number(item.dense.toFixed(3)),
      bm25Score: Number(item.bm25.toFixed(2)),
      citation: `[Source: ${item.chunk.parent_record_id} | ${item.chunk.title} (v${item.chunk.version})]`,
      relevanceExplanation: `Hybrid RRF match combining lexical token overlap (BM25: ${item.bm25.toFixed(1)}) and dense vector semantic cosine (${item.dense.toFixed(2)}).`
    }));
  }

  // Required Retrieval Verification Test Cases (Question 2)
  public runRetrievalTests(): RetrievalTestCase[] {
    const testCases: { queryType: RetrievalTestCase['queryType']; question: string; expectedCategory: KnowledgeChunk['category']; expectedSubstring: string }[] = [
      {
        queryType: 'Product',
        question: 'What are the repayment terms and maximum loan amount for the SME Growth Line?',
        expectedCategory: 'product_terms',
        expectedSubstring: '$750,000'
      },
      {
        queryType: 'Policy',
        question: 'What is the minimum operational history and revenue required to qualify?',
        expectedCategory: 'qualification_rules',
        expectedSubstring: '24 consecutive months'
      },
      {
        queryType: 'Qualification',
        question: 'Can a seasonal business with 18 months of operation apply if average monthly revenue is $35,000?',
        expectedCategory: 'qualification_rules',
        expectedSubstring: '18 and 23 months'
      },
      {
        queryType: 'FAQ',
        question: 'How quickly are funds disbursed after underwriting approval?',
        expectedCategory: 'faq',
        expectedSubstring: 'ACH Transfers'
      },
      {
        queryType: 'Objection',
        question: 'Traditional banks offer 6% APR; why are your rates structured between 8.5% and 14%?',
        expectedCategory: 'objection_handling',
        expectedSubstring: 'Underwriting Speed and Certainty'
      }
    ];

    return testCases.map((tc, index) => {
      const results = this.search(tc.question, 1);
      const top = results[0];
      const hasSubstring = top ? top.chunk.content.includes(tc.expectedSubstring) : false;
      const categoryMatch = top ? top.chunk.category === tc.expectedCategory : false;

      let verdict: RetrievalTestCase['verdict'] = 'INCORRECT';
      if (hasSubstring && categoryMatch) {
        verdict = 'CORRECT';
      } else if (hasSubstring || categoryMatch) {
        verdict = 'PARTIALLY_CORRECT';
      }

      return {
        id: `RTC_00${index + 1}`,
        queryType: tc.queryType,
        userQuestion: tc.question,
        expectedCategory: tc.expectedCategory,
        retrievedChunkId: top ? top.chunk.chunk_id : 'NONE',
        sourceReference: top ? `${top.chunk.parent_record_id} (${top.chunk.source})` : 'None',
        relevanceExplanation: top ? top.relevanceExplanation : 'No chunk met retrieval threshold',
        verdict,
        confidenceScore: top ? Math.min(0.99, Number((top.denseScore * 0.6 + 0.35).toFixed(2))) : 0.0
      };
    });
  }
}

export const knowledgeEngineInstance = new HybridKnowledgeEngine();
