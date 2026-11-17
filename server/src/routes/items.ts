import { Router, Request, Response, NextFunction } from 'express';
import { repository } from '../db/repository.js';
import { AppError } from '../middleware/errorHandler.js';

export const itemsRouter = Router();

itemsRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = repository.listItems();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

itemsRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = repository.getItemById(id);
    if (!item) {
      throw new AppError(404, `Item with id ${id} not found`);
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

itemsRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = repository.deleteItem(id);
    if (!deleted) {
      throw new AppError(404, `Item with id ${id} not found`);
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
});
