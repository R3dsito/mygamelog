import express  from 'express';
import { getUsers, getUser, getUserByUsername, registerUser, loginUser, updateUser, searchUsers, followUser,
    unfollowUser, toggleFavorite, getFavorites, updateProfileImage, uploadBannerImage, changePassword } from '../controllers/users_controller.js';
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
userRoutes.post('/change-password/:userId', verificarToken, changePassword);
userRoutes.post('/follow/:id', verificarToken, followUser);
userRoutes.post('/unfollow/:id', verificarToken, unfollowUser);
userRoutes.post('/favorites', verificarToken, toggleFavorite);
userRoutes.get('/favorites/:userId', getFavorites);

export {userRoutes};
