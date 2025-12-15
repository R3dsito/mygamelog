import express from 'express';
import mongoose from 'mongoose';
import { userRoutes, projectroutes, taskroutes, gameRoutes, postRoutes } from './routes/index.js';
import 'dotenv/config';
import cors from "cors"



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('No se pudo conectar con MongoDB..', err));

const app = express();


app.use(cors());



app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get('/',(req, res) => {
    res.send("kanban database");
});
// app.use("/uploads", express.static("uploads"));
app.use('/posts' , postRoutes)
app.use('/games', gameRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectroutes);
app.use('/tasks', taskroutes);
export default app;

// const port = process.env.PORT || 3002;
// app.listen(port, () => {
//    })