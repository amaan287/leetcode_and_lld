import OpenAI from 'openai';
import { getEnv } from '../config/env';
import { DSARepository } from '../repositories/DSARepository';
import { DSAProblem } from '../models/DSAProblem';

interface SimilarityResult {
  problem: DSAProblem;
  similarity: number;
}

export class EmbeddingSearchService {
  private openai: OpenAI;

  constructor(private dsaRepository: DSARepository) {
    const env = getEnv();
    this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
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
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  async searchByCompany(companyName: string, role: string = 'SDE'): Promise<DSAProblem[]> {
    const searchQuery = `${companyName} ${role} interview questions software engineering coding problems`;
    
    // Create embedding for the search query
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: [searchQuery],
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Retrieve all problems with embeddings
    const problems = await this.dsaRepository.findProblemsWithEmbeddings();

    // Calculate cosine similarity and find most similar problems
    const similarities: SimilarityResult[] = [];

    for (const problem of problems) {
      if (problem.title_embeddings_OAI) {
        const similarity = this.cosineSimilarity(queryEmbedding, problem.title_embeddings_OAI);
        similarities.push({
          problem,
          similarity,
        });
      }
    }

    // Sort by similarity (highest first) and return top 50
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, 50).map(result => result.problem);
  }
}

