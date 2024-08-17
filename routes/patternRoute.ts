import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import {
    getPatternsForStock,
    addPattern,
    getPatternList,
    updatePattern,
    deletePattern
} from '../controllers/patternController';
const router = express.Router();

router.get('/getPatterns', isAuthenticated , getPatternsForStock)
router.post('/addPattern', isAuthenticated , addPattern)
router.get('/getPatternList', isAuthenticated , getPatternList)
router.patch('/updatePattern', isAuthenticated , updatePattern)
router.delete('/deletePattern', isAuthenticated , deletePattern)

export default router;
