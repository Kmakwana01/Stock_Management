import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
var router = express.Router();

import { create , get , update , deleteWorker, getById } from '../controllers/workerController';

router.post('/create',isAuthenticated , create)
router.get('/get',isAuthenticated , get)
router.put('/update',isAuthenticated , update)
router.delete('/delete',isAuthenticated , deleteWorker)
router.get('/getById',isAuthenticated , getById)

export default router;