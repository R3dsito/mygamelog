import express from 'express';
import mongoose from 'mongoose';
import { userRoutes, gameRoutes, postRoutes, playlistRoutes } from './routes/index.js';
import 'dotenv/config';
import cors from "cors"
import { connectDB } from "./db/mongoose.js";



// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB conectado'))
//   .catch(err => console.error('No se pudo conectar con MongoDB..', err));

const app = express();


app.use(cors({
  origin: ['https://mygamelog.vercel.app', 'http://localhost:5173'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get('/',(req, res) => {
    res.send("myGameLog API");
});
app.use('/posts' , postRoutes)
app.use('/games', gameRoutes);
app.use('/users', userRoutes);
app.use('/playlists', playlistRoutes);
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3002;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;