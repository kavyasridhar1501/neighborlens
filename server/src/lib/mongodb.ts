import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

/**
 * Connects to MongoDB Atlas. Reuses connection if already open.
 */
export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log('✅ Connected to MongoDB');
}
