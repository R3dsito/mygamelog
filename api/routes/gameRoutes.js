import express from 'express';

import {
     getGameById, getRandomGamesController, searchGamesController
  } from '../controllers/gameController.js';
  
const gameRoutes = express.Router();


gameRoutes.get('/random', getRandomGamesController);
gameRoutes.get('/search', searchGamesController);
gameRoutes.get('/:id', getGameById);



export {gameRoutes};