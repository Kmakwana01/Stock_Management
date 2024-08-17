import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
var router = express.Router();

import { create , get , update , deleteCustomer, getById } from '../controllers/customerController';

router.post('/create',isAuthenticated , create)
router.get('/get',isAuthenticated , get)
router.put('/update',isAuthenticated , update)
router.delete('/delete',isAuthenticated , deleteCustomer)
router.get('/getById',isAuthenticated , getById)

export default router;