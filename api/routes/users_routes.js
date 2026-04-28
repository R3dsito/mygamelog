import express  from 'express';
import { getUsers, getUser, getUserByUsername, registerUser, loginUser, updateUser, searchUsers, followUser,
    unfollowUser, toggleFavorite, getFavorites, updateProfileImage, uploadBannerImage } from '../controllers/users_controller.js';
import { verificarToken } from '../middlewares/auth.js';
import { upload } from "../middlewares/uploadImages.js";

const userRoutes = express.Router();

// get all users
userRoutes.get('/',  getUsers);

userRoutes.get('/find/username/:username', getUserByUsername);
userRoutes.get('/find/:userId', getUser);
// register user
userRoutes.post('/register', registerUser);

// login user
userRoutes.post('/login', loginUser);
userRoutes.post("/upload-profile-image/:userId", verificarToken, upload.single("profileImage"), updateProfileImage);
userRoutes.post("/upload-banner-image/:userId", verificarToken, upload.single("bannerImage"), uploadBannerImage);
 userRoutes.get("/search", searchUsers);
 userRoutes.put("/update/:userId", verificarToken, updateUser);
userRoutes.post('/follow/:id', verificarToken, followUser);
userRoutes.post('/unfollow/:id', verificarToken, unfollowUser);
userRoutes.post('/favorites', verificarToken, toggleFavorite);
userRoutes.get('/favorites/:userId', getFavorites);
userRoutes.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro de búsqueda." });
  }

  try {
    // Busca usuarios cuyo username coincida parcialmente con el query
    const users = await User.find({
      username: { $regex: query, $options: 'i' } // 'i' para que sea case-insensitive
    }).select('_id username'); // Selecciona solo los campos _id y username

    res.json(users);
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ error: "Error del servidor al buscar usuarios." });
  }
});

export {userRoutes};
