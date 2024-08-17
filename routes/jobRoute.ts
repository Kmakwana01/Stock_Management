import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { upload } from '../utils/multer';
const router = express.Router();
import {
    addJob,
    getJobList,
    getSingleJob,
    updateJob,
    deleteJob,
    assignJob,
    jobProcessStatus,
    completeJob,
    jobProcessUpdate,
    jobProcessDelete,
    jobPatternAddProcess,
    jobPatternDeleteProcess,
    jobPatternUpdateProcess,
    jobPatternCompleteProcess,
    jobPatternDelete,
    jobRoleDelete,
} from '../controllers/jobController'

router.post('/addJob', upload.any() , isAuthenticated , addJob)
router.get('/getJobList', isAuthenticated, getJobList)
router.get('/getSingleJob', isAuthenticated, getSingleJob)
router.put('/updateJob', isAuthenticated, updateJob)
router.delete('/deleteJob', isAuthenticated, deleteJob)
router.post('/assignJob', isAuthenticated, assignJob)
router.post('/jobProcessStatus', isAuthenticated, jobProcessStatus)
router.post('/completeJob', isAuthenticated, completeJob)
router.put('/jobProcessUpdate', isAuthenticated, jobProcessUpdate)
router.delete('/jobProcessDelete', isAuthenticated, jobProcessDelete)
router.post('/jobPatternAddProcess', isAuthenticated, jobPatternAddProcess)
router.delete('/jobPatternDeleteProcess', isAuthenticated, jobPatternDeleteProcess)
router.put('/jobPatternUpdateProcess', isAuthenticated, jobPatternUpdateProcess)
router.put('/jobPatternCompleteProcess', isAuthenticated, jobPatternCompleteProcess)
router.delete('/jobPatternDelete', isAuthenticated, jobPatternDelete)
router.delete('/jobRoleDelete', isAuthenticated, jobRoleDelete)

export default router;