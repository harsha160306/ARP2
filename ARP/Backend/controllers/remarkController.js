import pool from '../db.js';

export const recordRemark = async (req, res) => {
  try {
    const { student_id, register_number, remark_text } = req.body;
    const recorded_by = req.user.id;

    if (!register_number || !remark_text) {
      return res.status(400).json({ message: 'Register number and remark text are required.' });
    }

    // 1. Find student ID if not provided (e.g. offline/mock scanner)
    let sId = student_id;
    if (!sId) {
      const [students] = await pool.query('SELECT * FROM students WHERE register_number = ?', [register_number]);
      if (students.length === 0) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      sId = students[0].id;
    }

    // 2. Insert record
    await pool.query(
      'INSERT INTO remarks (student_id, remark_text, recorded_by) VALUES (?, ?, ?)',
      [sId, remark_text, recorded_by]
    );

    res.status(201).json({ message: 'Remark recorded successfully.' });
  } catch (error) {
    console.error('Record remark error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getRemarksHistory = async (req, res) => {
  try {
    const { year, department, section, date } = req.query;
    const recorded_by = req.user.id;
    const searchDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Fetch remarks recorded by this user today, joined with student details
    // We construct the query. If database is MySQL, we run standard SQL JOIN query.
    // The query is simulated in mockPool inside db.js if MySQL is unavailable.
    let queryStr = `
      SELECT r.*, s.name, s.register_number, s.course, s.department, s.academic_year, s.section 
      FROM remarks r 
      JOIN students s ON r.student_id = s.id 
      WHERE DATE(r.created_at) = ? AND r.recorded_by = ?
    `;
    const queryParams = [searchDate, recorded_by];

    // Filter by year if provided
    if (year) {
      queryStr += ' AND s.academic_year = ?';
      queryParams.push(year);
    }
    // Filter by department if provided
    if (department) {
      queryStr += ' AND s.department = ?';
      queryParams.push(department);
    }
    // Filter by section if provided
    if (section) {
      queryStr += ' AND s.section = ?';
      queryParams.push(section);
    }

    const [rows] = await pool.query(queryStr, queryParams);

    res.status(200).json({
      date: searchDate,
      total: rows.length,
      records: rows
    });
  } catch (error) {
    console.error('Fetch remarks history error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
