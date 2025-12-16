import Users from '../models/users_model.js';
import bcrypt from "bcrypt";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Posts from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        let usuarios = await Users.find();
        res.json(usuarios);
    } catch (error) {
        res.status(400).json({ error });
    }
};

const getUser = async (req, res) => {
  try {
    let usuario = await Users.findById(req.params.userId)
      .populate("followers", "_id username imagen")
      .populate("following", "_id username imagen")
      .select("-password")
      .lean(); // Convierte el documento de Mongoose en un objeto plano

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Agrega la cantidad de seguidores y seguidos
    usuario.followersCount = usuario.followers.length;
    usuario.followingCount = usuario.following.length;

    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const user = await Users.findOne({ username })
      .populate("followers", "_id username imagen") // Popula los seguidores con sus IDs y usernames
      .populate("following", "_id username imagen")
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Agrega la cantidad de seguidores y seguidos
    user.followersCount = user.followers.length;
    user.followingCount = user.following.length;

    res.json(user);
  } catch (error) {
    console.error("Error al buscar usuario por username:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
// Registrar usuario
const registerUser = async (req, res) => {
    try {
        let body = req.body;

        let usuario = new Users({
            name: body.name,
            username: body.username.toLowerCase(),
            email: body.email,
            password: bcrypt.hashSync(body.password, 10)
        });
        let savedUser = await usuario.save();

        res.json({ user: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Iniciar sesión
const loginUser = async (req, res) => {
    try {
        let usuario = await Users.findOne({ email: req.body.email });
        if (!usuario) return res.status(400).json({ error: 'ok', msj: 'Wrong user or password' });

        const passwordValido = bcrypt.compareSync(req.body.password, usuario.password);
        if (!passwordValido) return res.status(400).json({ error: 'ok', msj: 'Wrong user or password' });

        const jwToken = jwt.sign(
            { usuario: { _id: usuario._id, name: usuario.name, username: usuario.username, email: usuario.email } },
            process.env.SEED,
            { expiresIn: process.env.EXPIRATION }
        );

        res.json({
            usuario: {
                _id: usuario._id,
                name: usuario.name,
                username: usuario.username,
                email: usuario.email
            },
            jwToken
        });
    } catch (err) {
        res.status(400).json({ error: 'ok', msj: 'server error' + err });
    }
};

const updateProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "profile_images",
      }
    );

    const user = await Users.findByIdAndUpdate(
      userId,
      { imagen: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({
      message: "Imagen actualizada",
      imageUrl: result.secure_url,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};



const followUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo." });
    }

    const user = await Users.findById(userId);
    const target = await Users.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (target.followers.includes(userId)) {
      return res.status(400).json({ message: "Ya sigues a este usuario." });
    }

    target.followers.push(userId);
    user.following.push(targetId);

    await target.save();
    await user.save();

    res.json({ message: "Ahora sigues a este usuario." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const targetId = req.params.id;

    const user = await Users.findById(userId);
    const target = await Users.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    target.followers = target.followers.filter((id) => id.toString() !== userId);
    user.following = user.following.filter((id) => id.toString() !== targetId);

    await target.save();
    await user.save();

    res.json({ message: "Has dejado de seguir a este usuario." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { userId, postId } = req.body; // Ahora esperamos postId

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    const isFavorite = user.favorites.some(favId => favId.toString() === postId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(favId => favId.toString() !== postId);
    } else {
      user.favorites.push(post._id);
    }

    await user.save();

    res.json({
      message: isFavorite ? "Post eliminado de favoritos" : "Post agregado a favoritos",
      isFavorite: !isFavorite,
    });
  } catch (error) {
    console.error("Error en toggleFavorite:", error);
    res.status(500).json({ message: "Error al togglear favorito", error });
  }
};


const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user.favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error del servidor al obtener favoritos" });
  }
};

export {
    getUsers,
    getUser,
    getUserByUsername,
    registerUser,
    loginUser,
    updateProfileImage,
    followUser,
    unfollowUser,
    toggleFavorite,
    getFavorites
};
