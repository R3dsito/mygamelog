import Playlist from "../models/Playlist.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "El nombre es requerido" });

    const playlist = await Playlist.create({
      userId: req.usuario._id,
      name,
      description,
      games: [],
    });
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist no encontrada" });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist no encontrada" });
    if (playlist.userId.toString() !== req.usuario._id.toString())
      return res.status(403).json({ message: "No autorizado" });

    const { name, description } = req.body;
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist no encontrada" });
    if (playlist.userId.toString() !== req.usuario._id.toString())
      return res.status(403).json({ message: "No autorizado" });

    await playlist.deleteOne();
    res.json({ message: "Playlist eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addGameToPlaylist = async (req, res) => {
  try {
    const { gameId, gameName, imageUrl } = req.body;
    if (!gameId || !gameName || !imageUrl)
      return res.status(400).json({ message: "gameId, gameName e imageUrl son requeridos" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist no encontrada" });
    if (playlist.userId.toString() !== req.usuario._id.toString())
      return res.status(403).json({ message: "No autorizado" });

    const alreadyAdded = playlist.games.some((g) => g.gameId === gameId);
    if (alreadyAdded)
      return res.status(400).json({ message: "El juego ya está en la playlist" });

    playlist.games.push({ gameId, gameName, imageUrl });
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeGameFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist no encontrada" });
    if (playlist.userId.toString() !== req.usuario._id.toString())
      return res.status(403).json({ message: "No autorizado" });

    playlist.games = playlist.games.filter((g) => g.gameId !== req.params.gameId);
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
