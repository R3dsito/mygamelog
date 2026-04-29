import mongoose from "mongoose";

// Almacena datos agregados de puntuación por juego.
// scoreSum permite actualizaciones incrementales O(1) sin reconsultar todos los posts.
const gameScoreSchema = new mongoose.Schema(
  {
    gameId:       { type: String, required: true, unique: true },
    averageScore: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    scoreSum:     { type: Number, default: 0 }, // suma de todos los ratings
  },
  { timestamps: true }
);

export default mongoose.model("GameScore", gameScoreSchema);
