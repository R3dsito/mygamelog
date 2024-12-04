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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", postSchema);
