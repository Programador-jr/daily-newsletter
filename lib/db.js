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
      dbName: process.env.MONGODB_NAME || (process.env.VERCEL_ENV === 'production' ? 'kings_newsletter' : 'kings_newsletter_preview'),
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDatabase };
