import Post from "../models/Post.js";
import Users from "../models/users_model.js";

export const createPost = async (req, res) => {
  try {
    const { gameId, userId, gameName, imageUrl, content, rating } = req.body;
    const newPost = new Post({ gameId, userId, gameName, imageUrl, content, rating });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el post." });
  }
};

export const getPostsByGameId = async (req, res) => {
  try {
    const { gameId } = req.params;
    const posts = await Post.find({ gameId }).populate("userId", "username");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los posts." });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content, rating },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el post." });
  }
};

// Eliminar un post por ID
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el post." });
  }
};

export const showPostsById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ userId }).populate('gameId', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los posts', error });
  }
};



export const getLatestPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
      .limit(10) // Limitar a los últimos 10 posts
      .populate("userId", "username"); // Poblar el campo userId con el username
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los últimos posts." });
  }
};