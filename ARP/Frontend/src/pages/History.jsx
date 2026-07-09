import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/* ------------------------------------------------------------------ */
/* Mock data – used as fallback when backend is unreachable             */
/* ------------------------------------------------------------------ */
const MOCK_NAMES = [
  'Rahul Sharma', 'Anjali Verma', 'Eleanor Vance', 'Priya Patel',
  'Vikram Singh', 'Amit Kumar', 'Sneha Reddy', 'Arjun Rao',
  'Divya Nair', 'Karan Malhotra', 'Neha Gupta', 'Rohan Das',
  'Siddharth Joshi', 'Aditi Rao', 'Vijay Iyer', 'Pooja Choudhury',
];

const REMARK_TYPES = ['Non-uniform', 'Late-comer', 'Indiscipline', 'Others'];

function buildMock(dept, year, section) {
  const prefix = dept.substring(0, 2).toUpperCase();
  const count = 10 + Math.floor(Math.random() * 8);
  const presentList = [];
  const remarkList  = [];

  for (let i = 0; i < count; i++) {
    const regNo  = `2024${prefix}${String(i + 1).padStart(3, '0')}`;
    const name   = MOCK_NAMES[i % MOCK_NAMES.length];
    const status = Math.random() > 0.3 ? 'Present' : 'Absent';

    if (status === 'Present') {
      presentList.push({ name, registerNumber: regNo });
    }

    if (Math.random() > 0.7) {
      remarkList.push({
        name,
        registerNumber: regNo,
        remark: REMARK_TYPES[Math.floor(Math.random() * REMARK_TYPES.length)],
      });
    }
  }

  return { presentList, remarkList, totalStudents: count };
}

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */
const YEARS       = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['CSE', 'CSE (AI & ML)', 'CSE (Data Science)', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA'];
const SECTIONS    = ['A', 'B', 'C', 'D'];

/* ================================================================== */
export default function History() {
  /* ── filter state ─────────────────────────────────────────── */
  const [selectedYear,    setSelectedYear]    = useState('');
  const [selectedDept,    setSelectedDept]    = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  /* ── data state ────────────────────────────────────────────── */
  const [presentList,   setPresentList]   = useState([]);
  const [remarkList,    setRemarkList]    = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [dataLoaded,    setDataLoaded]    = useState(false);

  /* ── UI toggles ────────────────────────────────────────────── */
  const [showPresent,  setShowPresent]  = useState(false);
  const [showRemarks,  setShowRemarks]  = useState(false);
  const [isFetching,   setIsFetching]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── today's date label ──────────────────────────────────────*/
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  /* ────────────────────────────────────────────────────────────
     Fetch from backend; fall back to mock on any error
  ─────────────────────────────────────────────────────────── */
  const handleFetch = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedDept || !selectedSection) {
      toast.error('Please select Year, Department, and Section.');
      return;
    }

    setIsFetching(true);
    setDataLoaded(false);

    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().slice(0, 10);

      const [attRes, remRes] = await Promise.all([
        axios.get('http://localhost:5000/api/attendance/history', {
          params: { year: selectedYear, department: selectedDept, section: selectedSection, date: today },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        axios.get('http://localhost:5000/api/remarks/history', {
          params: { year: selectedYear, department: selectedDept, section: selectedSection, date: today },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (attRes && attRes.data) {
        const pList = (attRes.data.records || [])
          .filter(r => r.status === 'Present')
          .map(r => ({ name: r.name, registerNumber: r.register_number }));
        const rList = (remRes?.data?.records || [])
          .map(r => ({ name: r.name, registerNumber: r.register_number, remark: r.remark }));

        setPresentList(pList);
        setRemarkList(rList);
        setTotalStudents(attRes.data.total || pList.length + 5);
        setDataLoaded(true);
        toast.success('Today\'s history loaded.');
      } else {
        throw new Error('Backend unavailable');
      }
    } catch {
      // Fallback
      const mock = buildMock(selectedDept, selectedYear, selectedSection);
      setPresentList(mock.presentList);
      setRemarkList(mock.remarkList);
      setTotalStudents(mock.totalStudents);
      setDataLoaded(true);
      toast.success('Today\'s history loaded (demo data).');
    } finally {
      setIsFetching(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     Generate Word Document
  ─────────────────────────────────────────────────────────── */
  const handleDownloadDocx = async () => {
    if (!dataLoaded) { toast.error('Please load data first.'); return; }
    setIsGenerating(true);

    try {
      const userName = localStorage.getItem('userName') || 'System User';

      const makeTable = (rows, headers) => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: headers.map(h =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                shading: { fill: 'D9D9D9' },
              })
            ),
          }),
          ...rows.map(r =>
            new TableRow({
              children: r.map(cell =>
                new TableCell({ children: [new Paragraph({ text: String(cell) })] })
              ),
            })
          ),
        ],
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: 'MODERN INSTITUTE COLLEGE', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "Today's Attendance & Remarks Report", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: '' }),
            new Paragraph({ children: [new TextRun({ text: 'Date: ', bold: true }), new TextRun(todayLabel)] }),
            new Paragraph({ children: [new TextRun({ text: 'Year: ', bold: true }), new TextRun(selectedYear)] }),
            new Paragraph({ children: [new TextRun({ text: 'Department: ', bold: true }), new TextRun(selectedDept)] }),
            new Paragraph({ children: [new TextRun({ text: 'Section: ', bold: true }), new TextRun(selectedSection)] }),
            new Paragraph({ text: '' }),

            new Paragraph({ text: `Attendance Summary`, heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ children: [new TextRun({ text: 'Total Students: ', bold: true }), new TextRun(String(totalStudents))] }),
            new Paragraph({ children: [new TextRun({ text: 'Total Present: ', bold: true }), new TextRun(String(presentList.length))] }),
            new Paragraph({ children: [new TextRun({ text: 'Total Absent: ', bold: true }), new TextRun(String(totalStudents - presentList.length))] }),
            new Paragraph({ text: '' }),

            new Paragraph({ text: 'Present Students', heading: HeadingLevel.HEADING_3 }),
            makeTable(
              presentList.map((s, i) => [i + 1, s.name, s.registerNumber]),
              ['#', 'Student Name', 'Register No']
            ),
            new Paragraph({ text: '' }),

            new Paragraph({ text: `Remarks Summary (${remarkList.length} records)`, heading: HeadingLevel.HEADING_3 }),
            makeTable(
              remarkList.map((r, i) => [i + 1, r.name, r.registerNumber, r.remark]),
              ['#', 'Student Name', 'Register No', 'Remark']
            ),
            new Paragraph({ text: '' }),
            new Paragraph({ children: [new TextRun({ text: 'Generated By: ', bold: true }), new TextRun(userName)] }),
            new Paragraph({ children: [new TextRun({ text: 'Generated At: ', bold: true }), new TextRun(new Date().toLocaleString('en-IN'))] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Attendance_Report_${selectedDept}_${selectedSection}_${new Date().toISOString().slice(0, 10)}.docx`);
      toast.success('Word document downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate document.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ================================================================== */
  return (
    <div className="flex-1 w-full p-4 md:p-8 lg:p-12 overflow-y-auto bg-surface">
      <div className="w-full max-w-4xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-3xl md:text-4xl">history</span>
            Attendance & Remarks History
          </h1>
          <p className="font-body text-on-surface-variant text-base">
            View today's attendance summary and remarks by year, department, and section.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container rounded-full text-xs font-label font-semibold text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">today</span>
            {todayLabel}
          </div>
        </div>

        {/* ── Filter Card ─────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6">
          <h2 className="font-display font-semibold text-on-surface text-base mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            Select Filter
          </h2>
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4 items-end">
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
                  {YEARS.map(y => <option key={y}>{y}</option>)}
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
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
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
                  {SECTIONS.map(s => <option key={s}>Section {s}</option>)}
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
              {isFetching
                ? <><span className="material-symbols-outlined animate-spin text-base">sync</span> Loading...</>
                : <><span className="material-symbols-outlined text-base">search</span> Fetch History</>}
            </button>
          </form>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────── */}
        {dataLoaded && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Present Count Card */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <span className="font-label text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-3">
                  Today's Attendance
                </span>
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 my-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  {presentList.length}
                </div>
                <div className="font-body text-sm text-blue-600 dark:text-blue-300 font-semibold">Students Present</div>
                <div className="mt-2 text-xs font-label text-blue-500/80 dark:text-blue-400/70">
                  out of {totalStudents} total · {totalStudents - presentList.length} absent
                </div>
              </div>

              {/* Remarks Count Card */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <span className="font-label text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-3">
                  Today's Remarks
                </span>
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 my-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>comment</span>
                  {remarkList.length}
                </div>
                <div className="font-body text-sm text-blue-600 dark:text-blue-300 font-semibold">Remarks Submitted</div>
                <div className="mt-2 text-xs font-label text-blue-500/80 dark:text-blue-400/70">
                  {selectedDept} · Sec {selectedSection?.replace('Section ', '')} · {selectedYear}
                </div>
              </div>
            </div>

            {/* ── Present Students Dropdown ─────────────────────────────── */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowPresent(p => !p)}
                className="w-full px-6 py-4 flex items-center justify-between font-display font-semibold text-on-surface hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </span>
                  <span>Present Students
                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-label font-bold rounded-full">
                      {presentList.length}
                    </span>
                  </span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 text-outline ${showPresent ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {showPresent && (
                <div className="border-t border-outline-variant/15 p-4 md:p-5 bg-surface/50 animate-fade-in max-h-72 overflow-y-auto">
                  {presentList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {presentList.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-body text-sm font-semibold text-on-surface truncate">{s.name}</div>
                            <div className="font-label text-xs text-on-surface-variant truncate">{s.registerNumber}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-label font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shrink-0">
                            Present
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-on-surface-variant py-4">No present records for today.</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Remarks Students Dropdown ─────────────────────────────── */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowRemarks(p => !p)}
                className="w-full px-6 py-4 flex items-center justify-between font-display font-semibold text-on-surface hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>comment</span>
                  </span>
                  <span>Remark Students
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-label font-bold rounded-full">
                      {remarkList.length}
                    </span>
                  </span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 text-outline ${showRemarks ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {showRemarks && (
                <div className="border-t border-outline-variant/15 p-4 md:p-5 bg-surface/50 animate-fade-in max-h-72 overflow-y-auto">
                  {remarkList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {remarkList.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-body text-sm font-semibold text-on-surface truncate">{r.name}</div>
                            <div className="font-label text-xs text-on-surface-variant truncate">{r.registerNumber}</div>
                            <div className="font-label text-xs text-primary font-semibold mt-0.5 truncate">{r.remark}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-on-surface-variant py-4">No remarks submitted today.</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Word Document Download ────────────────────────────────── */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadDocx}
                disabled={isGenerating}
                className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 px-10 rounded-2xl font-label font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              >
                {isGenerating
                  ? <><span className="material-symbols-outlined animate-spin">sync</span> Generating...</>
                  : <><span className="material-symbols-outlined">description</span> Download Word Report (.docx)</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!dataLoaded && !isFetching && (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm min-h-[200px]">
            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-outline">history</span>
            </div>
            <h3 className="font-display font-semibold text-lg text-on-surface mb-1">No Data Loaded</h3>
            <p className="font-body text-on-surface-variant text-sm max-w-xs leading-relaxed">
              Select a year, department, and section above and click <strong>Fetch History</strong> to view today's records.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
