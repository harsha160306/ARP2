import express from 'express';
import { recordAttendance } from '../controllers/attendanceController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, recordAttendance);

export default router;
