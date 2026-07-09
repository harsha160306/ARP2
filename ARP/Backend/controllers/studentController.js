import pool from '../db.js';

export const getStudentByRegisterNumber = async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const [students] = await pool.query('SELECT * FROM students WHERE register_number = ?', [registerNumber]);

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.status(200).json({ student: students[0] });
  } catch (error) {
    console.error('Fetch student error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { register_number, name, course, department, academic_year, validity, dob, blood_group, address, email, phone, photo_url } = req.body;

    if (!register_number || !name || !course || !department || !academic_year || !validity) {
      return res.status(400).json({ message: 'Required fields: Register number, name, course, department, academic year, validity.' });
    }

    const [existing] = await pool.query('SELECT * FROM students WHERE register_number = ?', [register_number]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Registration number already exists.' });
    }

    await pool.query(
      'INSERT INTO students (register_number, name, course, department, academic_year, validity, dob, blood_group, address, section, semester, email, phone, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [register_number, name, course, department, academic_year, validity, dob || null, blood_group || '', address || '', '-', '-', email || '', phone || '', photo_url || null]
    );

    res.status(201).json({ message: 'Student registered successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Registration number already exists.' });
    }
    console.error('Register student error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
