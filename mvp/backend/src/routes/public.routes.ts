import { Router } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import { db } from '../db.js';
import { validateParams } from '../middleware/validate.js';
import { Category, Item } from '../types/index.js';

const router = Router();

const slugSchema = z.object({ slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/) });

function getMenuBySlug(slug: string) {
  const user = db.prepare('SELECT id, restaurant_name, slug FROM users WHERE slug = ?').get(slug) as
    | { id: number; restaurant_name: string; slug: string }
    | undefined;

  if (!user) return null;

  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order, id').all(user.id) as Category[];
  const items = db.prepare('SELECT * FROM items WHERE category_id IN (SELECT id FROM categories WHERE user_id = ?) AND available = 1').all(user.id) as Item[];

  return {
    restaurant: { name: user.restaurant_name, slug: user.slug },
    categories: categories.map(category => ({
      ...category,
      items: items.filter(item => item.category_id === category.id),
    })),
  };
}

router.get('/api/public/menu/:slug', validateParams(slugSchema), (req, res) => {
  const slug = req.params.slug as string;
  const menu = getMenuBySlug(slug);
  if (!menu) {
    res.status(404).json({ success: false, error: { message: 'Restaurant not found' } });
    return;
  }
  res.json({ success: true, data: menu });
});

router.get('/api/public/qr/:slug', validateParams(slugSchema), async (req, res) => {
  const slug = req.params.slug as string;
  const user = db.prepare('SELECT id FROM users WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (!user) {
    res.status(404).json({ success: false, error: { message: 'Restaurant not found' } });
    return;
  }

  const host = req.get('host') || `localhost:${process.env.PORT || 3001}`;
  const publicUrl = `${req.protocol}://${host}/m/${slug}`;
  try {
    const dataUrl = await QRCode.toDataURL(publicUrl, { width: 400, margin: 2 });
    res.json({ success: true, data: { url: publicUrl, qrDataUrl: dataUrl } });
  } catch {
    res.status(500).json({ success: false, error: { message: 'Failed to generate QR code' } });
  }
});

router.get('/m/:slug', validateParams(slugSchema), (req, res) => {
  const slug = req.params.slug as string;
  const menu = getMenuBySlug(slug);
  if (!menu) {
    res.status(404).send('<h1>Restaurant not found</h1>');
    return;
  }

  const categoriesHtml = menu.categories
    .map(
      category => `
        <section class="category">
          <h2>${escapeHtml(category.name)}</h2>
          <div class="items">
            ${category.items
              .map(
                item => `
                  <article class="item">
                    <div class="item-header">
                      <h3>${escapeHtml(item.name)}</h3>
                      <span class="price">$${item.price.toFixed(2)}</span>
                    </div>
                    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
                  </article>
                `
              )
              .join('')}
          </div>
        </section>
      `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(menu.restaurant.name)} — Menu</title>
  <style>
    :root { --bg: #f8fafc; --card: #ffffff; --text: #1e293b; --muted: #64748b; --accent: #f97316; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: var(--bg); color: var(--text); }
    header { text-align: center; padding: 2rem 1rem; background: var(--accent); color: white; }
    h1 { margin: 0; font-size: 1.75rem; }
    main { max-width: 640px; margin: 0 auto; padding: 1rem; }
    .category { margin-bottom: 2rem; }
    .category h2 { font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 0.25rem; }
    .item { background: var(--card); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
    .item h3 { margin: 0; font-size: 1.1rem; }
    .price { font-weight: 700; color: var(--accent); white-space: nowrap; }
    .item p { margin: 0.5rem 0 0; color: var(--muted); font-size: 0.95rem; }
    footer { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  <header><h1>${escapeHtml(menu.restaurant.name)}</h1></header>
  <main>${categoriesHtml || '<p>No items available yet.</p>'}</main>
  <footer>Powered by DynamicMenu</footer>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default router;
