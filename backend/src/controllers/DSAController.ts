import type { Context } from 'hono';
import { z } from 'zod';
import { DSAService } from '../services/DSAService';
import { EmbeddingSearchService } from '../services/EmbeddingSearchService';
import { AppError, createErrorResponse } from '../utils/errors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const createListSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
});

const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

const addProblemSchema = z.object({
  problemId: z.string(),
});

const toggleStatusSchema = z.object({
  isCompleted: z.boolean(),
});

const companySearchSchema = z.object({
  companyName: z.string().min(1),
  role: z.string().optional().default('SDE'),
});

export class DSAController {
  constructor(
    private dsaService: DSAService,
    private embeddingService: EmbeddingSearchService
  ) {}

  async createList(c: Context) {
    try {
      const user = c.get('user');
      const body = await c.req.json();
      const data = createListSchema.parse(body);

      const list = await this.dsaService.createList(user.userId, data.name, data.isPublic ?? false);

      return c.json({
        _id: list._id?.toString(),
        userId: list.userId.toString(),
        name: list.name,
        isPublic: list.isPublic,
        problemIds: list.problemIds.map(id => id.toString()),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return c.json(
          createErrorResponse(
            new AppError(
              400,
              firstIssue?.message || 'Validation error',
              'VALIDATION_ERROR'
            )
          ),
          400 as ContentfulStatusCode
        );
      }
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }

  async getMyLists(c: Context) {
    try {
      const user = c.get('user');
      const lists = await this.dsaService.getUserLists(user.userId);

      return c.json(lists.map(list => ({
        _id: list._id?.toString(),
        userId: list.userId.toString(),
        name: list.name,
        isPublic: list.isPublic,
        problemIds: list.problemIds.map(id => id.toString()),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      })));
    } catch (error) {
      return c.json(createErrorResponse(error), 500);
    }
  }

  async getPublicLists(c: Context) {
    try {
      const lists = await this.dsaService.getPublicLists();

      return c.json(lists.map(list => ({
        _id: list._id?.toString(),
        userId: list.userId.toString(),
        name: list.name,
        isPublic: list.isPublic,
        problemIds: list.problemIds.map(id => id.toString()),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      })));
    } catch (error) {
      return c.json(createErrorResponse(error), 500);
    }
  }

  async getList(c: Context) {
    try {
      const listId = c.req.param('id');
      const user = c.get('user');
      
      const result = await this.dsaService.getListWithProblems(listId, user.userId);

      return c.json({
        list: {
          _id: result.list._id?.toString(),
          userId: result.list.userId.toString(),
          name: result.list.name,
          isPublic: result.list.isPublic,
          createdAt: result.list.createdAt,
          updatedAt: result.list.updatedAt,
        },
        problems: result.problems.map(p => ({
          problem: {
            _id: p.problem._id?.toString(),
            frontendQuestionId: p.problem.frontendQuestionId,
            title: p.problem.title,
            titleSlug: p.problem.titleSlug,
            difficulty: p.problem.difficulty,
            acRate: p.problem.acRate,
            topicTags: p.problem.topicTags || [],
            paidOnly: p.problem.paidOnly || false,
            hasSolution: p.problem.hasSolution || false,
            hasVideoSolution: p.problem.hasVideoSolution || false,
          },
          status: p.status ? {
            isCompleted: p.status.isCompleted,
            checkedAt: p.status.checkedAt,
          } : null,
        })),
      });
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }

  async updateList(c: Context) {
    try {
      const listId = c.req.param('id');
      const user = c.get('user');
      const body = await c.req.json();
      const data = updateListSchema.parse(body);

      const list = await this.dsaService.updateList(listId, user.userId, data);

      return c.json({
        _id: list._id?.toString(),
        userId: list.userId.toString(),
        name: list.name,
        isPublic: list.isPublic,
        problemIds: list.problemIds.map(id => id.toString()),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return c.json(
          createErrorResponse(
            new AppError(
              400,
              firstIssue?.message || 'Validation error',
              'VALIDATION_ERROR'
            )
          ),
          400 as ContentfulStatusCode
        );
      }
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }

  async deleteList(c: Context) {
    try {
      const listId = c.req.param('id');
      const user = c.get('user');

      await this.dsaService.deleteList(listId, user.userId);

      return c.json({ message: 'List deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }

  async addProblem(c: Context) {
    try {
      const listId = c.req.param('id');
      const user = c.get('user');
      const body = await c.req.json();
      const data = addProblemSchema.parse(body);

      await this.dsaService.addProblemToList(listId, data.problemId, user.userId);

      return c.json({ message: 'Problem added to list' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return c.json(
          createErrorResponse(
            new AppError(
              400,
              firstIssue?.message || 'Validation error',
              'VALIDATION_ERROR'
            )
          ), 400 as ContentfulStatusCode
        );
      }
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode );
    }
  }

  async removeProblem(c: Context) {
    try {
      const listId = c.req.param('id');
      const problemId = c.req.param('problemId');
      const user = c.get('user');

      await this.dsaService.removeProblemFromList(listId, problemId, user.userId);

      return c.json({ message: 'Problem removed from list' });
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }

  async toggleProblemStatus(c: Context) {
    try {
      const listId = c.req.param('id');
      const problemId = c.req.param('problemId');
      const user = c.get('user');
      const body = await c.req.json();
      const data = toggleStatusSchema.parse(body);

      await this.dsaService.toggleProblemStatus(listId, problemId, user.userId, data.isCompleted);

      return c.json({ message: 'Problem status updated' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return c.json(
          createErrorResponse(
            new AppError(
              400,
              firstIssue?.message || 'Validation error',
              'VALIDATION_ERROR'
            )
          ),
          400 as ContentfulStatusCode
        );
      }
      if (error instanceof AppError) {
        return c.json(createErrorResponse(error), error.statusCode as ContentfulStatusCode);
      }
      return c.json(createErrorResponse(error), 500);
    }
  }

  async searchByCompany(c: Context) {
    try {
      const body = await c.req.json();
      const data = companySearchSchema.parse(body);

      const problems = await this.embeddingService.searchByCompany(data.companyName, data.role);

      return c.json(problems.map(p => ({
        _id: p._id?.toString(),
        frontendQuestionId: p.frontendQuestionId,
        title: p.title,
        titleSlug: p.titleSlug,
        difficulty: p.difficulty,
        acRate: p.acRate,
        topicTags: p.topicTags || [],
        paidOnly: p.paidOnly || false,
        hasSolution: p.hasSolution || false,
        hasVideoSolution: p.hasVideoSolution || false,
      })));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return c.json(
          createErrorResponse(
            new AppError(
              400,
              firstIssue?.message || 'Validation error',
              'VALIDATION_ERROR'
            )
          ), 400 as ContentfulStatusCode
        );
      }
      return c.json(createErrorResponse(error), 500 as ContentfulStatusCode);
    }
  }
}

