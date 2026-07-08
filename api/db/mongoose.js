import mongoose from "mongoose";
import Post from "../models/Post.js";
import Playlist from "../models/Playlist.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      autoIndex: false,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;

  // With autoIndex disabled, indexes are not built automatically. Sync the
  // schema-declared indexes once per cold start. The shared promise makes the
  // sync run exactly once even under concurrent cold-start requests, and a
  // failed sync must never reject connectDB: the app can serve traffic on
  // unsynced indexes, so log and clear the promise to allow a later retry.
  if (!cached.indexSync) {
    cached.indexSync = Promise.all([
      Post.syncIndexes(),
      Playlist.syncIndexes(),
    ]).catch((error) => {
      console.error("Index sync failed:", error.message);
      cached.indexSync = null;
    });
  }
  await cached.indexSync;

  return cached.conn;
};
