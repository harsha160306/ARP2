import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_ADDON_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME || 'mic_attendance',
  port: parseInt(process.env.MYSQL_ADDON_PORT || '3306', 10),
};

const initializeDB = async () => {
  let connection;
  try {
    console.log('Connecting to MySQL database for initialization...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully. Initializing Database Tables...');

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);
    console.log('- Users table verified/created.');

    // Seed Users
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      await connection.query(`
        INSERT INTO users (username, password, role, name) VALUES 
        ('hod_mic', 'HOD@123', 'HOD', 'MIC HOD'),
        ('incharge_mic', 'Incharge@123', 'Incharge', 'MIC Incharge')
      `);
      console.log('- Default test logins seeded.');
    } else {
      console.log('- Users table already has data. Skipping user seeding.');
    }

    // 2. Students Table
    await connection.query(`
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
    console.log('- Students table verified/created.');

    // Seed Students
    const [studentRows] = await connection.query('SELECT COUNT(*) as count FROM students');
    if (studentRows[0].count === 0) {
      await connection.query(`
        INSERT INTO students (register_number, name, course, department, academic_year, validity, dob, blood_group, address, section, semester, email, phone, photo_url) VALUES 
        ('2024CS101', 'Rahul Sharma', 'B.Tech', 'Computer Science', '3rd Year', '2027', NULL, NULL, NULL, 'A', 'V', 'rahul@gmail.com', '9876543210', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM-pyl2GLRMVnjxwsCXyp4bZU_dGsSv6BzQCj0OKi8NlhK2UyNps1HU1jaO-RKjb9B_updyWAjRKfBDg572WWob87YdE1z3TdQcV8a2ef1wKEeFrB9sEdd27i_dIOWCyUVlMu7yFK_wIg3BX_KEVleXsL8hvR0fdmFsvCxZPM2qBBvYkaKN8J6PNGNIJVFnkkqqKKD13x4T5B4-oy5GOfVTfsdQ1i_tgyeDusR7TI6zX1MarWjuJGvuY-hBnEByhJW71sEbmPwDrB'),
        ('2024ME045', 'Anjali Verma', 'B.Tech', 'Mechanical', '2nd Year', '2028', NULL, NULL, NULL, 'B', 'III', 'anjali@gmail.com', '9876543211', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTuEzyi6BX288E_wzMVHXWMUOfXKPnfoPAH-0dsuJNUGciaHdnYoTT5IyMfM-JJZ7OW1ZV70AIG19OH-9tzOJmQq8qbSS0Xg34ph03JJs5GmH2skFMmBT1Xw7a2IL6TSpY0ftt8RCdDU_LuiAX1WBu9ZPaWZzIH6GwRQIVRSprKZ-2ZlDKud2OZ_VEYon1QNT90Cs_CwlzK6xDNIjcFck0Y3tFfIkkamZS7duB52mqHKmOgPa_uVfZVj72aDAEqz9luXXxnSkVE_YB')
      `);
      console.log('- Default test students seeded.');
    } else {
      console.log('- Students table already has data. Skipping student seeding.');
    }

    // 3. Remarks Table
    await connection.query(`
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
    console.log('- Remarks table verified/created.');

    console.log('Database initialization and seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initializeDB();
