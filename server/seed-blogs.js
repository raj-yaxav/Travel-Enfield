import 'dotenv/config';
import mongoose from 'mongoose';
import { Blog } from './models.js';
import { blogs } from './seed.js';

async function seedBlogs() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelenfield');
  await Blog.bulkWrite(blogs.map(blog => ({
    updateOne: { filter: { slug: blog.slug }, update: { $set: blog }, upsert: true },
  })));
  console.log(`Upserted ${blogs.length} blog records without deleting existing collections.`);
  await mongoose.disconnect();
}

seedBlogs().catch(async error => {
  console.error('Blog seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
