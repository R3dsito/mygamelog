import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imagen: {
        type: String,
        required: false        
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }], // Usuarios que siguen a este usuario
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }], // Usuarios que este usuario sigue
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]  // Posts favoritos del usuario
});

export default mongoose.model('Users', usuarioSchema);
