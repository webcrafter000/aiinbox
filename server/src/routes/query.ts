import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { answerQuestion } from '../services/rag.js';

export const queryRouter = Router();

queryRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new AppError(400, "Field 'query' must be a non-empty string");
    }

    const result = await answerQuestion(query.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});
