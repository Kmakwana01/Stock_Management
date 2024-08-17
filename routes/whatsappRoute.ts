import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
var router = express.Router();

import { sendMessage } from '../controllers/whatsappController';

router.post('/sendMessage',isAuthenticated , sendMessage)

export default router;