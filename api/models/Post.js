import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  gameName:{
    type: String,
    required: true
  },
  imageUrl:{
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Un usuario solo puede dejar una review por juego
postSchema.index({ userId: 1, gameId: 1 }, { unique: true });

// Support game-detail lookups by gameId
postSchema.index({ gameId: 1 });

// Support latest-posts/feed ordering by creation date
postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
