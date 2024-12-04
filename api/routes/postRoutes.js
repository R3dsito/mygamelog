import express from "express";
import {
  createPost,
  getPostsByGameId,
  updatePost,
  deletePost,
  showPostsById,
  getLatestPosts
} from "../controllers/postController.js";

const postRoutes = express.Router();

// Crear un post
postRoutes.post("/", createPost);

// Obtener todos los posts de un juego
postRoutes.get("/:gameId", getPostsByGameId);

// Actualizar un post
postRoutes.put("/:id", updatePost);

// Eliminar un post
postRoutes.delete("/:id", deletePost);

postRoutes.get("/user/:userId", showPostsById)
postRoutes.get('/latest', getLatestPosts);

export { postRoutes };
