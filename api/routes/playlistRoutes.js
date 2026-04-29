import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addGameToPlaylist,
  removeGameFromPlaylist,
} from "../controllers/playlistController.js";

export const playlistRoutes = Router();

playlistRoutes.post("/",                    verificarToken, createPlaylist);
playlistRoutes.get("/user/:userId",         getUserPlaylists);
playlistRoutes.get("/:id",                  getPlaylistById);
playlistRoutes.put("/:id",                  verificarToken, updatePlaylist);
playlistRoutes.delete("/:id",              verificarToken, deletePlaylist);
playlistRoutes.post("/:id/games",           verificarToken, addGameToPlaylist);
playlistRoutes.delete("/:id/games/:gameId", verificarToken, removeGameFromPlaylist);
