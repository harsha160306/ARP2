import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize local JSON file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [
      { id: 1, username: 'hod_mic', password: 'HOD@123', role: 'HOD', name: 'MIC HOD' },
      { id: 2, username: 'incharge_mic', password: 'Incharge@123', role: 'Incharge', name: 'MIC Incharge' }
    ],
    students: [
      { 
        id: 1, 
        register_number: '2024CS101', 
        name: 'Rahul Sharma', 
        department: 'Computer Science', 
        academic_year: '3rd Year', 
        section: 'A', 
        semester: 'V', 
        email: 'rahul@gmail.com', 
        phone: '9876543210', 
        photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM-pyl2GLRMVnjxwsCXyp4bZU_dGsSv6BzQCj0OKi8NlhK2UyNps1HU1jaO-RKjb9B_updyWAjRKfBDg572WWob87YdE1z3TdQcV8a2ef1wKEeFrB9sEdd27i_dIOWCyUVlMu7yFK_wIg3BX_KEVleXsL8hvR0fdmFsvCxZPM2qBBvYkaKN8J6PNGNIJVFnkkqqKKD13x4T5B4-oy5GOfVTfsdQ1i_tgyeDusR7TI6zX1MarWjuJGvuY-hBnEByhJW71sEbmPwDrB' 
      },
      { 
        id: 2, 
        register_number: '2024ME045', 
        name: 'Anjali Verma', 
        department: 'Mechanical', 
        academic_year: '2nd Year', 
        section: 'B', 
        semester: 'III', 
        email: 'anjali@gmail.com', 
        phone: '9876543211', 
        photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTuEzyi6BX288E_wzMVHXWMUOfXKPnfoPAH-0dsuJNUGciaHdnYoTT5IyMfM-JJZ7OW1ZV70AIG19OH-9tzOJmQq8qbSS0Xg34ph03JJs5GmH2skFMmBT1Xw7a2IL6TSpY0ftt8RCdDU_LuiAX1WBu9ZPaWZzIH6GwRQIVRSprKZ-2ZlDKud2OZ_VEYon1QNT90Cs_CwlzK6xDNIjcFck0Y3tFfIkkamZS7duB52mqHKmOgPa_uVfZVj72aDAEqz9luXXxnSkVE_YB' 
      }
    ],
    remarks: []
  }, null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// A mock pool that intercepts queries and simulates SQL operations using the JSON file
const mockPool = {
  isMock: true,
  query: async (sql, params = []) => {
    const data = readData();
    const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. Create table queries
    if (cleanSql.startsWith('create table')) {
      return [[]];
    }

    // 2. Select users count
    if (cleanSql.includes('select count(*) as count from users')) {
      return [[{ count: data.users.length }]];
    }

    // 3. Insert users
    if (cleanSql.startsWith('insert into users')) {
      return [[]];
    }

    // 4. Select user by username & role
    if (cleanSql.includes('select * from users where username = ? and role = ?')) {
      const [username, role] = params;
      const found = data.users.filter(u => u.username === username && u.role === role);
      return [found];
    }

    // 5. Select student by register_number
    if (cleanSql.includes('select * from students where register_number = ?')) {
      const [regNum] = params;
      const found = data.students.filter(s => s.register_number === regNum);
      return [found];
    }

    // 5.5 Insert student
    if (cleanSql.startsWith('insert into students')) {
      const [register_number, name, course, department, academic_year, validity, dob, blood_group, address, section, semester, email, phone, photo_url] = params;
      
      const duplicate = data.students.find(s => s.register_number === register_number);
      if (duplicate) {
        const err = new Error('Duplicate entry');
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }

      const newRecord = {
        id: data.students.length + 1,
        register_number,
        name,
        course: course || '-',
        department,
        academic_year,
        validity: validity || '-',
        dob: dob || null,
        blood_group: blood_group || '',
        address: address || '',
        section: section || '-',
        semester: semester || '-',
        email: email || '',
        phone: phone || '',
        photo_url: photo_url || null,
        created_at: new Date().toISOString()
      };
      data.students.push(newRecord);
      writeData(data);
      return [{ insertId: newRecord.id }];
    }

    // 8. Insert remark
    if (cleanSql.startsWith('insert into remarks')) {
      const [studentId, remarkText, recordedBy] = params;
      const newRecord = {
        id: data.remarks.length + 1,
        student_id: studentId,
        remark_text: remarkText,
        recorded_by: recordedBy,
        created_at: new Date().toISOString()
      };
      data.remarks.push(newRecord);
      writeData(data);
      return [{ insertId: newRecord.id }];
    }

    // 9. Select remarks history with joins and parameters
    if (cleanSql.includes('select') && cleanSql.includes('from remarks') && cleanSql.includes('join students')) {
      const searchDate = params[0];
      const recordedBy = params[1];
      
      let filterYear = null;
      let filterDept = null;
      let filterSec = null;
      
      let paramIdx = 2;
      if (cleanSql.includes('s.academic_year = ?')) {
        filterYear = params[paramIdx++];
      }
      if (cleanSql.includes('s.department = ?')) {
        filterDept = params[paramIdx++];
      }
      if (cleanSql.includes('s.section = ?')) {
        filterSec = params[paramIdx++];
      }

      const results = [];
      data.remarks.forEach(r => {
        const dateMatch = r.created_at.startsWith(searchDate);
        const userMatch = Number(r.recorded_by) === Number(recordedBy);
        
        if (dateMatch && userMatch) {
          const s = data.students.find(student => student.id === r.student_id);
          if (s) {
            const yearMatch = !filterYear || s.academic_year === filterYear;
            const deptMatch = !filterDept || s.department === filterDept;
            const secMatch = !filterSec || s.section === filterSec;
            
            if (yearMatch && deptMatch && secMatch) {
              results.push({
                id: r.id,
                student_id: r.student_id,
                remark_text: r.remark_text,
                remark: r.remark_text,
                recorded_by: r.recorded_by,
                created_at: r.created_at,
                name: s.name,
                register_number: s.register_number,
                course: s.course || 'BTech',
                department: s.department,
                academic_year: s.academic_year,
                section: s.section
              });
            }
          }
        }
      });
      return [results];
    }

    console.warn('Unhandled mock query:', sql, params);
    return [[]];
  }
};

let pool;
try {
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mic_attendance',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Verify connection
  const connection = await tempPool.getConnection();
  connection.release();
  pool = tempPool;
  console.log('Connected to MySQL successfully.');
} catch (err) {
  console.warn('MySQL unavailable. Falling back to local file-based database (db.json):', err.message);
  pool = mockPool;
}

export default pool;
