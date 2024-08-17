import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { upload } from '../utils/multer';
import {
   saleCreate,
   saleDelete,
   saleGet,
   saleUpdate
} from '../controllers/saleController';

const router = express.Router();


router.post('/create', isAuthenticated , saleCreate)
router.get('/getSaleList', isAuthenticated , saleGet)
router.put('/update', isAuthenticated , saleUpdate)
router.delete('/delete', isAuthenticated , saleDelete)

export default router;
