import express  from 'express';
import {createMessage,getMessages} from "../controllers/messages_controllers.js"

const messagesRoutes = express.Router();

messagesRoutes.post('/', createMessage);
messagesRoutes.get('/:chatId', getMessages);


export {messagesRoutes};