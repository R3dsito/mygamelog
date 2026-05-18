import Users from '../models/users_model.js';
import bcrypt from "bcrypt";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Posts from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

// escapa caracteres especiales de regex para evitar ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUsers = async (req, res) => {
    try {
        let usuarios = await Users.find().select("-password");
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

const getUser = async (req, res) => {
  if (!isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "ID inválido" });
  }
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
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    let usuario = new Users({
      name,
      username: username.toLowerCase(),
      email,
      password: bcrypt.hashSync(password, 10),
    });

    let savedUser = await usuario.save();
    const { password: _, ...userData } = savedUser.toObject();

    res.json({ user: userData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Iniciar sesión
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    let usuario = await Users.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: 'Email inválido', msj: 'Wrong user or password' });
    }

    const passwordValido = bcrypt.compareSync(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ error: 'Contraseña inválida', msj: 'Wrong user or password' });
    }

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


const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query requerida" });
    }

    const users = await Users.find({
      username: { $regex: escapeRegex(q), $options: "i" }
    })
      .select("_id username imagen")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searchUsers:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const updateUser = async (req, res) => {
  if (req.usuario._id.toString() !== req.params.userId) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const { name, username, email, bio } = req.body;

  if (!name?.trim() || !username?.trim()) {
    return res.status(400).json({ message: "Nombre y usuario son obligatorios" });
  }
  if (bio && bio.length > 160) {
    return res.status(400).json({ message: "La bio no puede superar los 160 caracteres" });
  }

  try {
    const user = await Users.findByIdAndUpdate(
      req.params.userId,
      { name: name.trim(), username: username.trim().toLowerCase(), email, bio },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
    }
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};


const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const updateProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.usuario._id.toString() !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Formato de imagen no permitido" });
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

const uploadBannerImage = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.usuario._id.toString() !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Formato de imagen no permitido" });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "banner_images" }
    );

    const user = await Users.findByIdAndUpdate(
      userId,
      { bannerImage: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({ message: "Banner actualizado", imageUrl: result.secure_url, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};

const followUser = async (req, res) => {
  try {
    const userId = req.usuario._id.toString();
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
    const userId = req.usuario._id.toString();
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
    const userId = req.usuario._id.toString();
    const { postId } = req.body;

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

const changePassword = async (req, res) => {
  if (req.usuario._id.toString() !== req.params.userId) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "La nueva contraseña debe ser diferente a la actual" });
  }

  try {
    const user = await Users.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const valid = bcrypt.compareSync(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "La contraseña actual es incorrecta" });

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
};

export {
    getUsers,
    getUser,
    getUserByUsername,
    registerUser,
    loginUser,
    searchUsers,
    updateUser,
    updateProfileImage,
    uploadBannerImage,
    changePassword,
    followUser,
    unfollowUser,
    toggleFavorite,
    getFavorites
};
