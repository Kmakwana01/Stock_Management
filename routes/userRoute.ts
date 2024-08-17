import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { upload } from '../utils/multer';
import {
    
    addNewUser,
    getUserList,
    updateUserDetails,
    deleteUser,
    getProfile,
    getUsersListForMaking,
} from '../controllers/userController';

const router = express.Router();

router.post('/addNewUser', isAuthenticated, upload.any(), addNewUser)
router.get('/getUserList', isAuthenticated, getUserList)
router.put('/updateUserDetails', isAuthenticated, upload.any(), updateUserDetails)
router.delete('/deleteUser', isAuthenticated, deleteUser)
router.get('/getProfile', isAuthenticated, getProfile)
router.get('/getUsersListForMaking', isAuthenticated, getUsersListForMaking)

export default router;

