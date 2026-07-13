import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MIC Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
