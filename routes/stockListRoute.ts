import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import {
    addStock,
    getStockList,
    getStockLists,
    updateStock,
    deleteStock,
    getSingleStock
} from '../controllers/stockListController';
import { upload } from '../utils/multer';

const router = express.Router();

router.post('/addStock', upload.any() ,isAuthenticated, addStock)
router.get('/getStockList', isAuthenticated, getStockList)
router.get('/getStockLists', isAuthenticated, getStockLists)
router.put('/updateStock', upload.any() , isAuthenticated, updateStock)
router.delete('/deleteStock', isAuthenticated, deleteStock)
router.get('/getSingleStock', isAuthenticated, getSingleStock)

export default router;
