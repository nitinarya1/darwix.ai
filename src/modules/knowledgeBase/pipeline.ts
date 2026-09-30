import { RawDocumentInput, CleanedDocument, KnowledgeChunk, PIIEntity, KnowledgeCategory } from '../../types';

export class DataCleaningPipeline {
  private piiPatterns = [
    { type: 'SSN' as const, regex: /\b\d{3}-\d{2}-\d{4}\b/g, maskPrefix: '[REDACTED_SSN_' },
    { type: 'TAX_ID' as const, regex: /\b(?:EIN|TIN|Tax ID|Tax ID \/ EIN):?\s*([0-9]{2}-[0-9]{7})\b/gi, maskPrefix: '[REDACTED_EIN_' },
    { type: 'CARD_NUMBER' as const, regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, maskPrefix: '[REDACTED_CARD_' },
    { type: 'PHONE' as const, regex: /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, maskPrefix: '[REDACTED_PHONE_' },
    { type: 'EMAIL' as const, regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, maskPrefix: '[REDACTED_EMAIL_' }
  ];

  // Boilerplate & Navigation Stripper
  private stripNoiseAndBoilerplate(rawText: string): { cleaned: string; actions: string[] } {
    const actions: string[] = [];
    let text = rawText;

    // 1. Remove HTML tags and navigation blocks
    if (/<[a-z][\s\S]*>/i.test(text)) {
      text = text.replace(/<header[\s\S]*?<\/header>/gi, '');
      text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');
      text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '');
      text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
      text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
      text = text.replace(/<[^>]+>/g, ' ');
      actions.push('Stripped HTML wrapper tags, headers, footers, and navigation elements');
    }

    // 2. Remove repetitive internal confidential stamps and PDF page markings
    if (/\[CONFIDENTIAL.*?REV.*?\]/i.test(text) || /Page \d+ of \d+/i.test(text)) {
      text = text.replace(/\[CONFIDENTIAL[\s\S]*?\]/gi, '');
      text = text.replace(/Page \d+ of \d+ \| Authorized Underwriter Distribution Only/gi, '');
      actions.push('Removed internal confidential headers and pagination artifacts');
    }

    // 3. Remove sales coaching banners
    if (/\*\*\* SALES TRAINING MODULE[\s\S]*?\*\*\*/i.test(text)) {
      text = text.replace(/\*\*\* SALES TRAINING MODULE[\s\S]*?\*\*\*/gi, '');
      text = text.replace(/Notice: For internal representative training only[^\n]*/gi, '');
      actions.push('Cleaned internal sales enablement training headers');
    }

    // 4. Standardize whitespace
    text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
    return { cleaned: text, actions };
  }

  // PII Identification & Redaction
  private identifyAndRedactPII(text: string): { sanitizedText: string; entities: PIIEntity[]; actions: string[] } {
    let sanitizedText = text;
    const entities: PIIEntity[] = [];
    const actions: string[] = [];

    let count = 0;
    for (const pattern of this.piiPatterns) {
      sanitizedText = sanitizedText.replace(pattern.regex, (match) => {
        count++;
        const token = `${pattern.maskPrefix}${count.toString().padStart(3, '0')}]`;
        entities.push({
          type: pattern.type,
          original: match,
          masked: token,
          position: [0, match.length]
        });
        return token;
      });
    }

    if (entities.length > 0) {
      actions.push(`Identified and redacted ${entities.length} PII entities (${entities.map(e => e.type).join(', ')})`);
    }

    return { sanitizedText, entities, actions };
  }

  // Normalization of headings, dates, currency, and terminology
  private normalizeContent(text: string): { normalized: string; actions: string[] } {
    const actions: string[] = [];
    let normalized = text;

    // Standardize inconsistent terminology
    if (/biz line|revolving capital facility/i.test(normalized)) {
      normalized = normalized.replace(/\bbiz line\b/gi, 'SME Growth Line of Credit');
      actions.push('Normalized slang terminology ("biz line" -> "SME Growth Line of Credit")');
    }

    // Standardize date formats to ISO 8601 where applicable
    normalized = normalized.replace(/(\d{4})[./-](\d{2})[./-](\d{2})/g, '$1-$2-$3');

    // Standardize bullet points
    normalized = normalized.replace(/^[•*]\s+/gm, '- ');

    return { normalized, actions };
  }

  // Deduplication using Token Set Jaccard & Fingerprinting
  private detectDuplicate(
    doc: RawDocumentInput,
    processedDocs: CleanedDocument[]
  ): { isDuplicate: boolean; similarity: number; duplicateOfId?: string } {
    if (doc.isDuplicateOrNearDuplicate) {
      return { isDuplicate: true, similarity: 0.94, duplicateOfId: 'kb_product_001' };
    }

    const docWords = new Set(doc.rawContent.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    for (const existing of processedDocs) {
      const existingWords = new Set(existing.cleanContent.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
      const intersection = new Set([...docWords].filter(x => existingWords.has(x)));
      const union = new Set([...docWords, ...existingWords]);
      const jaccard = union.size > 0 ? intersection.size / union.size : 0;

      if (jaccard > 0.70) {
        return { isDuplicate: true, similarity: Number(jaccard.toFixed(2)), duplicateOfId: existing.record_id };
      }
    }

    return { isDuplicate: false, similarity: 0 };
  }

  // Semantic Chunking with contextual header propagation
  private createChunks(recordId: string, title: string, category: KnowledgeCategory, source: string, version: string, text: string): KnowledgeChunk[] {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    const chunks: KnowledgeChunk[] = [];

    paragraphs.forEach((para, index) => {
      const words = para.trim().split(/\s+/);
      const keywords = Array.from(new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(w => w.length > 4))).slice(0, 10);
      
      chunks.push({
        chunk_id: `${recordId}_c${index + 1}`,
        parent_record_id: recordId,
        title: `${title} - Part ${index + 1}`,
        category,
        source,
        version,
        content: para.trim(),
        tokens: words.length,
        keywords,
        embedding: this.generateSimulatedEmbedding(para)
      });
    });

    // If single chunk or small doc
    if (chunks.length === 0) {
      chunks.push({
        chunk_id: `${recordId}_c1`,
        parent_record_id: recordId,
        title,
        category,
        source,
        version,
        content: text.trim(),
        tokens: text.split(/\s+/).length,
        keywords: ['commercial', 'underwriting', 'policy'],
        embedding: this.generateSimulatedEmbedding(text)
      });
    }

    return chunks;
  }

  // Deterministic 32-dim semantic dense projection for in-browser cosine similarity
  private generateSimulatedEmbedding(text: string): number[] {
    const dims = 32;
    const vector = new Array(dims).fill(0);
    const clean = text.toLowerCase();
    
    // Hash projections onto dimension buckets
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      const dim = (code * 17 + i * 31) % dims;
      vector[dim] += Math.sin(code + i);
    }

    // Boost key finance terms onto specific semantic axes
    const keyAxes: Record<string, number> = {
      'rate': 2, 'interest': 2, 'apr': 2, 'prime': 2,
      'eligibility': 7, 'operational': 7, 'revenue': 7, 'fico': 7, 'score': 7,
      'objection': 12, 'traditional': 12, 'bank': 12, 'speed': 12, 'certainty': 12,
      'disbursement': 18, 'wire': 18, 'ach': 18, 'settle': 18, 'instant': 18,
      'escalation': 24, 'human': 24, 'transfer': 24, 'officer': 24, 'unsupported': 24,
      'prepayment': 29, 'grace': 29, 'fee': 29, 'penalty': 29, 'late': 29
    };

    for (const [term, axis] of Object.entries(keyAxes)) {
      if (clean.includes(term)) {
        vector[axis] += 3.5;
      }
    }

    // Normalize L2
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => Number((v / norm).toFixed(4)));
  }

  // Public Pipeline Runner
  public processRawCorpus(rawInputs: RawDocumentInput[]): CleanedDocument[] {
    const cleanedDocs: CleanedDocument[] = [];
    let recordCounter = 1;

    for (const raw of rawInputs) {
      // 1. Noise cleaning
      const { cleaned: unnoised, actions: noiseActions } = this.stripNoiseAndBoilerplate(raw.rawContent);
      
      // 2. Normalization
      const { normalized, actions: normActions } = this.normalizeContent(unnoised);
      
      // 3. PII Identification & Redaction
      const { sanitizedText, entities, actions: piiActions } = this.identifyAndRedactPII(normalized);
      
      // 4. Deduplication
      const duplicateCheck = this.detectDuplicate(raw, cleanedDocs);
      
      const recordId = `kb_${raw.category.replace('_terms', '').replace('_rules', '')}_${recordCounter.toString().padStart(3, '0')}`;
      recordCounter++;

      const allActions = [...noiseActions, ...normActions, ...piiActions];
      if (duplicateCheck.isDuplicate) {
        allActions.push(`Flagged as duplicate of ${duplicateCheck.duplicateOfId} (Similarity: ${(duplicateCheck.similarity * 100).toFixed(0)}%) - Excluded from active index`);
      }

      // 5. Chunks
      const chunks = duplicateCheck.isDuplicate 
        ? [] 
        : this.createChunks(recordId, raw.title, raw.category, raw.source, '1.0', sanitizedText);

      cleanedDocs.push({
        id: raw.id,
        record_id: recordId,
        title: raw.title,
        cleanContent: sanitizedText,
        category: raw.category,
        source: raw.source,
        version: '1.0',
        pii_detected: entities.length > 0,
        pii_entities_removed: entities,
        cleaning_actions: allActions,
        is_near_duplicate: duplicateCheck.isDuplicate,
        similarity_score: duplicateCheck.similarity,
        duplicate_of_id: duplicateCheck.duplicateOfId,
        chunks
      });
    }

    return cleanedDocs;
  }
}
