const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/disasteraid';

  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[DB] MongoDB Connected successfully.');
  } catch (error) {
    console.warn(`[DB] Local MongoDB connection failed (${error.message}).`);
    console.log('[DB] Initializing embedded MongoDB Memory Server for seamless local execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000,
        },
      });
      const memUri = memoryServer.getUri();
      console.log(`[DB] In-Memory MongoDB running at: ${memUri}`);
      await mongoose.connect(memUri);
      console.log('[DB] Connected to In-Memory MongoDB.');
      
      // Auto seed memory server with initial data
      const { autoSeedIfEmpty } = require('../seeds/seed');
      if (autoSeedIfEmpty) {
        await autoSeedIfEmpty();
      }
    } catch (memErr) {
      console.error('[DB] Failed to initialize in-memory DB:', memErr.message);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, closeDB };
