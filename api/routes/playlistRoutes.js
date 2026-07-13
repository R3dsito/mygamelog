import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
  createPlaylist,
  getTrendingPlaylists,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addGameToPlaylist,
  removeGameFromPlaylist,
} from "../controllers/playlistController.js";

export const playlistRoutes = Router();

playlistRoutes.post("/",                    verificarToken, createPlaylist);
// Static routes first so they are not captured by /:id
playlistRoutes.get("/trending",             getTrendingPlaylists);
playlistRoutes.get("/user/:userId",         getUserPlaylists);
playlistRoutes.get("/:id",                  getPlaylistById);
playlistRoutes.put("/:id",                  verificarToken, updatePlaylist);
playlistRoutes.delete("/:id",              verificarToken, deletePlaylist);
playlistRoutes.post("/:id/games",           verificarToken, addGameToPlaylist);
playlistRoutes.delete("/:id/games/:gameId", verificarToken, removeGameFromPlaylist);
