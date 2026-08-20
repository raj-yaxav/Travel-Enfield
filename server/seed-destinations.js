import 'dotenv/config';
import mongoose from 'mongoose';
import { Destination } from './models.js';
import { destinations } from './seed.js';

async function seedDestinations() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelenfield');
  await Destination.bulkWrite(destinations.map(destination => ({
    updateOne: {
      filter: { slug: destination.slug },
      update: { $set: destination },
      upsert: true,
    },
  })));
  console.log(`Upserted ${destinations.length} destination records without deleting existing collections.`);
  await mongoose.disconnect();
}

seedDestinations().catch(async error => {
  console.error('Destination seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
