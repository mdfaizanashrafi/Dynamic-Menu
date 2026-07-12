import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { AuthenticatedRequest, Category, Item, MenuCategory } from '../types/index.js';

const router = Router();

const categorySchema = z.object({ name: z.string().min(1).max(100) });
const categoryIdSchema = z.object({ id: z.coerce.number().int().positive() });

const itemSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative(),
  available: z.boolean().default(true),
});

const itemUpdateSchema = itemSchema.partial().extend({ id: z.number().int().positive() });
const itemIdSchema = z.object({ id: z.coerce.number().int().positive() });

function assertOwnership(userId: number | undefined, resourceUserId: number, res: any): boolean {
  if (userId !== resourceUserId) {
    res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    return false;
  }
  return true;
}

router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order, id').all(req.userId) as Category[];
  const items = db.prepare('SELECT * FROM items WHERE category_id IN (SELECT id FROM categories WHERE user_id = ?)').all(req.userId) as Item[];

  const menu: MenuCategory[] = categories.map(category => ({
    ...category,
    items: items.filter(item => item.category_id === category.id),
  }));

  res.json({ success: true, data: menu });
});

router.post('/categories', authenticate, validateBody(categorySchema), (req: AuthenticatedRequest, res) => {
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM categories WHERE user_id = ?').get(req.userId) as { max_order: number };
  const result = db
    .prepare('INSERT INTO categories (user_id, name, sort_order) VALUES (?, ?, ?)')
    .run(req.userId, req.body.name, maxOrder.max_order + 1);

  res.status(201).json({
    success: true,
    data: { id: Number(result.lastInsertRowid), user_id: req.userId, name: req.body.name, sort_order: maxOrder.max_order + 1 },
  });
});

router.put('/categories/:id', authenticate, validateParams(categoryIdSchema), validateBody(categorySchema), (req: AuthenticatedRequest, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as Category | undefined;
  if (!category || !assertOwnership(req.userId, category.user_id, res)) return;

  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(req.body.name, req.params.id);
  res.json({ success: true, data: { ...category, name: req.body.name } });
});

router.delete('/categories/:id', authenticate, validateParams(categoryIdSchema), (req: AuthenticatedRequest, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as Category | undefined;
  if (!category || !assertOwnership(req.userId, category.user_id, res)) return;

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true, data: { id: Number(req.params.id) } });
});

router.post('/items', authenticate, validateBody(itemSchema), (req: AuthenticatedRequest, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.body.categoryId) as Category | undefined;
  if (!category || !assertOwnership(req.userId, category.user_id, res)) return;

  const result = db
    .prepare('INSERT INTO items (category_id, name, description, price, available) VALUES (?, ?, ?, ?, ?)')
    .run(req.body.categoryId, req.body.name, req.body.description ?? null, req.body.price, req.body.available ? 1 : 0);

  res.status(201).json({
    success: true,
    data: {
      id: Number(result.lastInsertRowid),
      category_id: req.body.categoryId,
      name: req.body.name,
      description: req.body.description ?? null,
      price: req.body.price,
      available: req.body.available ? 1 : 0,
    },
  });
});

router.put('/items/:id', authenticate, validateParams(itemIdSchema), validateBody(itemUpdateSchema), (req: AuthenticatedRequest, res) => {
  const item = db.prepare('SELECT items.*, categories.user_id FROM items JOIN categories ON items.category_id = categories.id WHERE items.id = ?').get(req.params.id) as
    | (Item & { user_id: number })
    | undefined;

  if (!item || !assertOwnership(req.userId, item.user_id, res)) return;

  const updates: Partial<Item> = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description ?? null;
  if (req.body.price !== undefined) updates.price = req.body.price;
  if (req.body.available !== undefined) updates.available = req.body.available ? 1 : 0;
  if (req.body.categoryId !== undefined) updates.category_id = req.body.categoryId;

  const fields = Object.keys(updates);
  if (fields.length === 0) {
    res.json({ success: true, data: item });
    return;
  }

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = [...fields.map(f => updates[f as keyof Item]), req.params.id];
  db.prepare(`UPDATE items SET ${setClause} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as Item;
  res.json({ success: true, data: updated });
});

router.delete('/items/:id', authenticate, validateParams(itemIdSchema), (req: AuthenticatedRequest, res) => {
  const item = db.prepare('SELECT items.*, categories.user_id FROM items JOIN categories ON items.category_id = categories.id WHERE items.id = ?').get(req.params.id) as
    | (Item & { user_id: number })
    | undefined;

  if (!item || !assertOwnership(req.userId, item.user_id, res)) return;

  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ success: true, data: { id: Number(req.params.id) } });
});

export default router;
