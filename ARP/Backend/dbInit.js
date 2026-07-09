import pool from './db.js';

const initializeDB = async () => {
  try {
    console.log('Initializing Database Tables...');

    // Students Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        register_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        course VARCHAR(50) NOT NULL,
        department VARCHAR(100) NOT NULL,
        academic_year VARCHAR(50) NOT NULL,
        validity VARCHAR(50) NOT NULL,
        dob VARCHAR(50),
        blood_group VARCHAR(10),
        address TEXT,
        section VARCHAR(10) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late', 'On Duty', 'Medical Leave') NOT NULL,
        recorded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id),
        UNIQUE KEY unique_attendance_per_day (student_id, date)
      )
    `);

    // Remarks Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS remarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        remark_text TEXT NOT NULL,
        recorded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id)
      )
    `);

    console.log('Database tables verified/created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initializeDB();
