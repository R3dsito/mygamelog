import express from 'express';

import {
    getRandomGameById
  } from '../controllers/randomController.js';
  
const randomRoutes = express.Router();



randomRoutes.get('/random', getRandomGameById);


export {randomRoutes};