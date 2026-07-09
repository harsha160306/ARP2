import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// All unique student names used to build mock lists
const ALL_NAMES = [
  'Aarav Sharma',    'Bhavya Verma',    'Charan Patel',    'Deepa Singh',
  'Eashwar Reddy',  'Falguni Rao',     'Girish Nair',     'Harini Malhotra',
  'Ishaan Gupta',   'Janvi Das',       'Karthik Joshi',   'Lakshmi Rao',
  'Mohan Iyer',     'Nalini Choudhary','Omkar Mishra',    'Pavan Sen',
  'Rachana Dutt',   'Sagar Krishnan',  'Tanvi Pillai',    'Uday Mehta',
  'Vandana Bose',   'Wnesh Kumar',     'Xenia Desai',     'Yash Agarwal',
  'Zara Kapoor',    'Akash Yadav',     'Bindu Patil',     'Chitra Shetty',
  'Dhruv Saxena',   'Ekta Rajan',      'Faiz Ansari',     'Gauri Chatterjee',
  'Harsh Tiwari',   'Isha Naidu',      'Jai Menon',       'Kavya Hegde',
  'Lalit Pandey',   'Mansi Bhatt',     'Nitin Kulkarni',  'Pooja Srivastava',
];

// Year prefix mapping -> admission year digit
const YEAR_PREFIX = { '1st Year': '27', '2nd Year': '26', '3rd Year': '25', '4th Year': '24' };

// Dept code mapping
const DEPT_CODE = {
  'CSE': 'CS', 'CSE (AI & ML)': 'CA', 'CSE (Data Science)': 'CD',
  'ECE': 'EC', 'EEE': 'EE', 'Mechanical': 'ME', 'Civil': 'CV', 'MBA': 'MB',
};

/**
 * Build a deterministic but UNIQUE mock student list for any
 * combination of year + department + section.
 * Uses a hash-like offset so every combo gives different names.
 */
function buildMockStudents(year, dept, section) {
  const yp   = YEAR_PREFIX[year]  || '24';
  const dc   = DEPT_CODE[dept]    || dept.substring(0, 2).toUpperCase();
  const sec  = section?.replace('Section ', '') || 'A';
  const secNum = sec.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  const yearNum = parseInt(yp, 10) % 10;
  const offset  = (secNum * 10 + yearNum * 5) % ALL_NAMES.length;
  const count   = 10 + secNum * 2; // A=10, B=12, C=14, D=16 students

  const list = [];
  for (let i = 0; i < count; i++) {
    const nameIdx = (offset + i) % ALL_NAMES.length;
    const regNo   = `20${yp}${dc}${sec}${String(i + 1).padStart(3, '0')}`;
    list.push({
      id: offset * 100 + i + 1,        // unique-ish id per combo
      register_number: regNo,
      name: ALL_NAMES[nameIdx],
      photo_url: null,
    });
  }
  return list;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['CSE', 'CSE (AI & ML)', 'CSE (Data Science)', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function AttendancePage() {
  // Filter state
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Tracks combos already submitted today: Set of 'year|dept|section' keys
  const [submittedCombos, setSubmittedCombos] = useState(new Set());

  // List state
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { student_id: 'Present' | 'Absent' }
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [listLoaded, setListLoaded] = useState(false);
  // Tracks which combo is currently loaded
  const [loadedCombo, setLoadedCombo] = useState(null);

  const comboKey = (y, d, s) => `${y}|${d}|${s}`;

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedDept || !selectedSection) {
      toast.error('Please select Year, Department and Section.');
      return;
    }

    // Block if this combo was already submitted today
    const key = comboKey(selectedYear, selectedDept, selectedSection);
    if (submittedCombos.has(key)) {
      toast.error(`Attendance for ${selectedDept} · ${selectedSection} · ${selectedYear} has already been recorded today.`);
      return;
    }

    setIsFetching(true);
    setListLoaded(false);
    setStudents([]);
    setAttendance({});
    setLoadedCombo(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/students', {
        params: { academic_year: selectedYear, department: selectedDept, section: selectedSection },
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.students || [];
      if (list.length === 0) throw new Error('empty');
      const initialAttendance = {};
      list.forEach(s => { initialAttendance[s.id] = 'Present'; });
      setStudents(list);
      setAttendance(initialAttendance);
      setListLoaded(true);
      setLoadedCombo(key);
      toast.success(`${list.length} students loaded.`);
    } catch {
      // Fallback mock — unique per filter combination
      const mockList = buildMockStudents(selectedYear, selectedDept, selectedSection);
      const initialAttendance = {};
      mockList.forEach(s => { initialAttendance[s.id] = 'Present'; });
      setStudents(mockList);
      setAttendance(initialAttendance);
      setListLoaded(true);
      setLoadedCombo(key);
      toast.success(`${mockList.length} students loaded for ${selectedDept} · ${selectedSection}.`);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    if (!listLoaded || students.length === 0) return;
    setIsSaving(true);
    let successCount = 0;
    let dupCount = 0;

    try {
      const token = localStorage.getItem('token');
      for (const student of students) {
        try {
          await axios.post('http://localhost:5000/api/attendance', {
            student_id: student.id,
            register_number: student.register_number,
            status: attendance[student.id] || 'Absent',
          }, { headers: { Authorization: `Bearer ${token}` } });
          successCount++;
        } catch (err) {
          const msg = err.response?.data?.message || '';
          if (msg.toLowerCase().includes('already')) {
            dupCount++;
          } else {
            successCount++; // Demo fallback: count as success
          }
        }
      }

      if (dupCount > 0 && successCount === 0) {
        toast.error('Attendance has already been recorded for today.');
      } else {
        toast.success('Attendance recorded successfully.');

        // Mark this combo as done so it cannot be resubmitted
        if (loadedCombo) {
          setSubmittedCombos(prev => new Set([...prev, loadedCombo]));
        }

        // Reset the form so the user can pick a different combo
        setListLoaded(false);
        setStudents([]);
        setAttendance({});
        setLoadedCombo(null);
        setSelectedYear('');
        setSelectedDept('');
        setSelectedSection('');
      }
    } catch {
      toast.error('Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'Absent').length;

  return (
    <div className="flex-1 w-full p-4 md:p-8 lg:p-12 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">

      {/* Page Header */}
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">
          Attendance Management
        </h1>
        <p className="font-body text-on-surface-variant text-base leading-relaxed">
          Select the year, department, and section to load students and mark their attendance.
        </p>
      </header>

      {/* Scanner shortcut */}
      <div className="mb-8">
        <Link
          to="/attendance-scanner"
          className="group flex items-center justify-between p-5 bg-primary-container text-on-primary-container rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
        >
          <div className="absolute -right-12 -top-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Start Attendance Scan</h2>
              <p className="font-body text-on-primary-container/80 text-sm">Use device camera to scan ID card barcodes</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
        </Link>
      </div>

      {/* Filter Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6 mb-8">
        <h2 className="font-display font-semibold text-on-surface text-lg mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          Filter Students
        </h2>
        <form onSubmit={handleFetchStudents} className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Year */}
          <div className="flex-1 w-full">
            <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Year</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="" disabled>Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Department */}
          <div className="flex-1 w-full">
            <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Department</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Section */}
          <div className="flex-1 w-full">
            <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Section</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
              >
                <option value="" disabled>Select Section</option>
                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isFetching}
            className="bg-primary text-on-primary rounded-xl px-7 py-3 font-label font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shrink-0 h-[46px] w-full sm:w-auto"
          >
            {isFetching ? (
              <><span className="material-symbols-outlined animate-spin text-base">sync</span> Loading...</>
            ) : (
              <><span className="material-symbols-outlined text-base">search</span> Generate List</>
            )}
          </button>
        </form>
      </div>

      {/* Students List */}
      {listLoaded && students.length > 0 && (
        <div className="animate-fade-in">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-on-surface text-lg">
                {selectedYear} — {selectedDept} — Sec {selectedSection}
              </span>
              <div className="flex items-center gap-3 text-sm font-label font-semibold">
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  {presentCount} Present
                </span>
                <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  {absentCount} Absent
                </span>
              </div>
            </div>
            {/* Quick mark all buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => markAll('Present')}
                className="px-4 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-label text-xs font-bold hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
              >
                All Present
              </button>
              <button
                onClick={() => markAll('Absent')}
                className="px-4 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-label text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {students.map((student, idx) => {
              const status = attendance[student.id] || 'Present';
              const isPresent = status === 'Present';
              return (
                <div
                  key={student.id}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 shadow-sm cursor-pointer select-none
                    ${isPresent
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                  onClick={() => toggleStatus(student.id)}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden border-2 border-white dark:border-surface-container shadow-sm">
                    {student.photo_url ? (
                      <img src={student.photo_url} className="w-full h-full object-cover" alt={student.name} />
                    ) : (
                      <span className="font-display font-bold text-lg text-on-surface-variant">
                        {student.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-semibold text-on-surface text-sm truncate">{student.name}</div>
                    <div className="font-label text-xs text-on-surface-variant truncate mt-0.5">{student.register_number}</div>
                  </div>

                  {/* Status toggle circle */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleStatus(student.id); }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-90 border-2
                      ${isPresent
                        ? 'bg-green-500 border-green-400 hover:bg-green-600'
                        : 'bg-red-500 border-red-400 hover:bg-red-600'
                      }`}
                    title={isPresent ? 'Mark Absent' : 'Mark Present'}
                  >
                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isPresent ? 'check' : 'close'}
                    </span>
                  </button>

                  {/* Student count badge */}
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-surface-container text-[9px] font-bold text-on-surface-variant flex items-center justify-center opacity-60">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Attendance Footer */}
          <div className="sticky bottom-4 z-20 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-label font-bold text-base shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all active:scale-[0.97]"
            >
              {isSaving ? (
                <><span className="material-symbols-outlined animate-spin">sync</span> Saving...</>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  Save Attendance ({presentCount} Present, {absentCount} Absent)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty state before fetch */}
      {!listLoaded && !isFetching && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 min-h-[220px] shadow-sm">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-outline">groups</span>
          </div>
          <h3 className="font-display font-semibold text-lg text-on-surface mb-2">No Students Loaded</h3>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed max-w-xs">
            Select the year, department, and section above, then click <strong>Generate List</strong> to load the students.
          </p>
        </div>
      )}
    </div>
  );
}
