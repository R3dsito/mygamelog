import mongoose from "mongoose";

const gameItemSchema = new mongoose.Schema(
  {
    gameId:   { type: String, required: true },
    gameName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    addedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

const playlistSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    name:        { type: String, required: true, maxlength: 50 },
    description: { type: String, maxlength: 200 },
    games:       [gameItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);
