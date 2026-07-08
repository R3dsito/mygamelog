import mongoose from "mongoose";
import Post from "../models/Post.js";
import Playlist from "../models/Playlist.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      autoIndex: false,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;

  // With autoIndex disabled, indexes are not built automatically. Sync the
  // schema-declared indexes once per cold start (guarded by a global flag so
  // this does not run on every request that reuses the cached connection).
  if (!global.indexesSynced) {
    await Promise.all([Post.syncIndexes(), Playlist.syncIndexes()]);
    global.indexesSynced = true;
  }

  return cached.conn;
};
