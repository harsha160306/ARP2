import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Fallback credentials when MySQL is unavailable
const FALLBACK_USERS = [
  { id: 1, username: 'hod_mic', password: 'HOD@123', role: 'HOD', name: 'MIC HOD' },
  { id: 2, username: 'incharge_mic', password: 'Incharge@123', role: 'Incharge', name: 'MIC Incharge' }
];

export const login = async (req, res) => {
  try {
    const { role, username, password } = req.body;

    if (!role || !username || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    let user = null;

    try {
      // Try MySQL first
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL
        )
      `);

      const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (rows[0].count === 0) {
        await pool.query(`INSERT INTO users (username, password, role, name) VALUES 
          ('hod_mic', 'HOD@123', 'HOD', 'MIC HOD'),
          ('incharge_mic', 'Incharge@123', 'Incharge', 'MIC Incharge')
        `);
      }

      const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND role = ?', [username, role]);
      if (users.length > 0) {
        user = users[0];
      }
    } catch (dbError) {
      console.warn('MySQL unavailable, using fallback credentials:', dbError.code || dbError.message);
      // Fallback to hardcoded users
      user = FALLBACK_USERS.find(u => u.username === username && u.role === role);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'super_secret_mic_key_2026',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
