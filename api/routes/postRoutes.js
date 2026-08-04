import express from "express";
import {
  createPost,
  getPostsByGameId,
  updatePost,
  deletePost,
  showPostsById,
  getLatestPosts,
  toggleLike,
  getScoreByGameId,
  getUserReviewForGame,
  getPostById,
} from "../controllers/postController.js";
import { verificarToken } from "../middlewares/auth.js";

const postRoutes = express.Router();

// Crear un post
postRoutes.post("/", verificarToken, createPost);

// Rutas estáticas primero (antes de /:gameId para evitar conflictos)
postRoutes.get("/latest", getLatestPosts);
postRoutes.get("/detail/:postId", getPostById);
postRoutes.get("/user/:userId", showPostsById);
postRoutes.get("/user/:userId/game/:gameId", getUserReviewForGame);
postRoutes.get("/score/:gameId", getScoreByGameId);
postRoutes.post("/:id/like", verificarToken, toggleLike);

// Obtener todos los posts de un juego
postRoutes.get("/:gameId", getPostsByGameId);

// Actualizar un post
postRoutes.put("/:id", verificarToken, updatePost);

// Eliminar un post
postRoutes.delete("/:id", verificarToken, deletePost);

export { postRoutes };
