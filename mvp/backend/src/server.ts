import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import publicRoutes from './routes/public.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: NODE_ENV } });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/', publicRoutes);

if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: { message: NODE_ENV === 'production' ? 'Internal server error' : err.message } });
});

app.listen(PORT, () => {
  console.log(`DynamicMenu MVP backend running on http://localhost:${PORT}`);
});
