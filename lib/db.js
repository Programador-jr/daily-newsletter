const mongoose = require('mongoose');
const { requireEnvironment } = require('./config');

let cached = global.__mongooseConnection;

if (!cached) {
  cached = global.__mongooseConnection = { conn: null, promise: null };
}

async function connectDatabase() {
  if (cached.conn) return cached.conn;

  requireEnvironment(['MONGODB_URI']);

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_NAME || process.env.MONGODB_DB_NAME || (process.env.VERCEL_ENV === 'production' ? 'kings_newsletter' : 'kings_newsletter_preview'),
      bufferCommands: false
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // A rejected connection attempt must not poison this process permanently.
    // A later request can retry after a transient Atlas/network interruption.
    cached.promise = null;
    throw error;
  }
}

module.exports = { connectDatabase };
