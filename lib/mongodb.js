import mongoose from 'mongoose';

const globalCache = globalThis;
globalCache.__travelenfieldMongo ||= { connection: null, promise: null };

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured. Add it to .env.local or the deployment environment.');
  const cache = globalCache.__travelenfieldMongo;
  if (cache.connection && mongoose.connection.readyState === 1) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
