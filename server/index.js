import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Destination, Trip, Category, Blog, Page, Enquiry, User } from './models.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelenfield';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let databasePromise;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!databasePromise) databasePromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 }).catch(error => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
};

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api', async (_req, res, next) => {
  try { await connectDatabase(); next(); }
  catch (error) { console.error('MongoDB connection failed:', error.message); res.status(503).json({ error: 'Database is temporarily unavailable. Please try again shortly.' }); }
});
app.get('/api/bootstrap', async (_req, res, next) => { try {
  const [destinations, trips, categories, blogs] = await Promise.all([
    Destination.find().lean(), Trip.find().lean(), Category.find().lean(), Blog.find().sort({ publishedAt: -1 }).limit(6).lean(),
  ]); res.json({ destinations, trips, categories, blogs });
} catch (error) { next(error); } });
app.get('/api/destinations', async (_req, res, next) => { try { res.json(await Destination.find().lean()); } catch (e) { next(e); } });
app.get('/api/destinations/:slug', async (req, res, next) => { try { const item = await Destination.findOne({ slug: req.params.slug }).lean(); item ? res.json(item) : res.status(404).json({ error: 'Destination not found' }); } catch (e) { next(e); } });
app.get('/api/trips', async (req, res, next) => { try {
  const query = {}; if (req.query.category && req.query.category !== 'all') query.categories = req.query.category;
  if (req.query.destination) query.destinationSlug = req.query.destination;
  res.json(await Trip.find(query).lean());
} catch (e) { next(e); } });
app.get('/api/trips/:slug', async (req, res, next) => { try { const item = await Trip.findOne({ slug: req.params.slug }).lean(); item ? res.json(item) : res.status(404).json({ error: 'Trip not found' }); } catch (e) { next(e); } });
app.get('/api/categories/:slug', async (req, res, next) => { try { const item = await Category.findOne({ slug: req.params.slug }).lean(); item ? res.json(item) : res.status(404).json({ error: 'Category not found' }); } catch (e) { next(e); } });
app.get('/api/blogs', async (_req, res, next) => { try { res.json(await Blog.find().sort({ publishedAt: -1 }).lean()); } catch (e) { next(e); } });
app.get('/api/blogs/:slug', async (req, res, next) => { try { const item = await Blog.findOne({ slug: req.params.slug }).lean(); item ? res.json(item) : res.status(404).json({ error: 'Article not found' }); } catch (e) { next(e); } });
app.get('/api/pages/:slug', async (req, res, next) => { try { const item = await Page.findOne({ slug: req.params.slug }).lean(); item ? res.json(item) : res.status(404).json({ error: 'Page not found' }); } catch (e) { next(e); } });
app.post('/api/enquiries', async (req, res, next) => { try { const enquiry = await Enquiry.create(req.body); res.status(201).json({ ok: true, id: enquiry.id }); } catch (e) { next(e); } });
app.post('/api/auth/signup', async (req, res, next) => { try {
  const { name, email, phone, password } = req.body; if (!name || !email || !password || password.length < 6) return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  const passwordHash = await bcrypt.hash(password, 10); const user = await User.create({ name, email, phone, passwordHash });
  res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
} catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'Email already registered' }); next(e); } });
app.post('/api/auth/login', async (req, res, next) => { try {
  const user = await User.findOne({ email: req.body.email }); const valid = user && await bcrypt.compare(req.body.password || '', user.passwordHash);
  valid ? res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }) : res.status(401).json({ error: 'Invalid email or password' });
} catch (e) { next(e); } });
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Something went wrong' }); });
app.use(express.static(path.join(root, 'dist')));
app.get('/{*splat}', (req, res) => res.sendFile(path.join(root, req.path === '/' ? 'dist/index.html' : 'dist/app.html')));

if (!process.env.VERCEL) {
  app.listen(port, '127.0.0.1', () => console.log(`TravelEnfield API running at http://127.0.0.1:${port}`));
  connectDatabase().then(() => console.log('MongoDB connected')).catch(error => console.error('MongoDB connection failed:', error.message));
}

export default app;
