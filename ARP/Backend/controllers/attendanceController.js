import pool from '../db.js';

export const recordAttendance = async (req, res) => {
  try {
    const { student_id, register_number, status } = req.body;
    const recorded_by = req.user.id;
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (!register_number || !status) {
      return res.status(400).json({ message: 'Register number and status are required.' });
    }

    // 1. Find student ID if not provided (e.g. offline/mock scanner might just pass register number)
    let sId = student_id;
    if (!sId) {
      const [students] = await pool.query('SELECT * FROM students WHERE register_number = ?', [register_number]);
      if (students.length === 0) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      sId = students[0].id;
    }

    // 2. Check for duplicate attendance for this student on this date
    const [existing] = await pool.query('SELECT * FROM attendance WHERE student_id = ? AND date = ?', [sId, date]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Attendance has already been recorded for today.' });
    }

    // 3. Insert record
    await pool.query(
      'INSERT INTO attendance (student_id, date, status, recorded_by) VALUES (?, ?, ?, ?)',
      [sId, date, status, recorded_by]
    );

    res.status(201).json({ message: 'Attendance recorded successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Attendance has already been recorded for today.' });
    }
    console.error('Record attendance error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
