import api from "@/api/axiosInstance";

const useManagePlaylists = () => {
  const createPlaylist = (name, description) =>
    api.post("/playlists", { name, description });

  const updatePlaylist = (id, data) =>
    api.put(`/playlists/${id}`, data);

  const deletePlaylist = (id) =>
    api.delete(`/playlists/${id}`);

  const addGame = (playlistId, game) =>
    api.post(`/playlists/${playlistId}/games`, game);

  const removeGame = (playlistId, gameId) =>
    api.delete(`/playlists/${playlistId}/games/${gameId}`);

  return { createPlaylist, updatePlaylist, deletePlaylist, addGame, removeGame };
};

export default useManagePlaylists;
