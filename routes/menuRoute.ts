import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
import { addMenu ,deleteMenu ,getMenu, updateMenu } from '../controllers/menuController';
var router = express.Router();

router.post('/addMenu',isAuthenticated , addMenu)
router.get('/getMenu',isAuthenticated , getMenu)
router.put('/updateMenu',isAuthenticated , updateMenu)
router.delete('/deleteMenu',isAuthenticated , deleteMenu)

export default router;
