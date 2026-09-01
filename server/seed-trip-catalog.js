import 'dotenv/config';
import mongoose from 'mongoose';
import { Destination, Trip } from './models.js';
import { destinations, trips } from './seed.js';

async function syncTripCatalog() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelenfield', {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  await Destination.bulkWrite(destinations.map(destination => ({
    updateOne: {
      filter: { slug: destination.slug },
      update: { $set: destination },
      upsert: true,
    },
  })));

  await Trip.bulkWrite(trips.map(trip => ({
    updateOne: {
      filter: { slug: trip.slug },
      update: { $set: trip },
      upsert: true,
    },
  })));

  console.log(`Synced ${destinations.length} destinations and ${trips.length} trips without deleting other collections.`);
  await mongoose.disconnect();
}

syncTripCatalog().catch(async error => {
  console.error('Trip catalogue sync failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
