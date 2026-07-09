import express from 'express';
import { getStudentByRegisterNumber, registerStudent } from '../controllers/studentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/register/:registerNumber', auth, getStudentByRegisterNumber);
router.post('/', auth, registerStudent);

export default router;
