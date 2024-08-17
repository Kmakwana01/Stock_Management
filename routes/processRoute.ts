import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { upload } from '../utils/multer';
import {
    addProcess,
    getProcess,
    updateProcess,
    deleteProcess
} from '../controllers/processController';

const router = express.Router();


router.post('/addProcess', isAuthenticated , addProcess)
router.get('/getProcess', isAuthenticated , getProcess)
router.put('/updateProcess', isAuthenticated , updateProcess)
router.delete('/deleteProcess', isAuthenticated , deleteProcess)

export default router;
