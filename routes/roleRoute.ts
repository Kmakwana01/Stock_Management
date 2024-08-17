import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { upload } from '../utils/multer';
import {
create,
get,
update,
deleteRole,
getById,
getByClient
} from '../controllers/roleController';

const router = express.Router();

router.post('/create', isAuthenticated , create)
router.get('/get', isAuthenticated , get)
router.get('/getById', isAuthenticated , getById)
router.get('/getByClient', isAuthenticated , getByClient)
router.put('/update', isAuthenticated , update)
router.delete('/delete', isAuthenticated , deleteRole)

export default router;
