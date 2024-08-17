import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
var router = express.Router();

import { addColor , getColors ,updateColor ,deleteColor} from '../controllers/colorController';

router.post('/addColor',isAuthenticated , addColor)
router.put('/updateColor',isAuthenticated , updateColor)
router.get('/getColors',isAuthenticated , getColors)
router.delete('/deleteColor',isAuthenticated , deleteColor)


export default router;
