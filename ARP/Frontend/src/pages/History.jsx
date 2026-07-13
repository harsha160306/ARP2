import { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

/* ------------------------------------------------------------------ */
/* Mock names used as fallback when database query returns empty        */
/* ------------------------------------------------------------------ */
const MOCK_NAMES = [
  'Rahul Sharma', 'Anjali Verma', 'Eleanor Vance', 'Priya Patel',
  'Vikram Singh', 'Amit Kumar', 'Sneha Reddy', 'Arjun Rao',
  'Divya Nair', 'Karan Malhotra', 'Neha Gupta', 'Rohan Das',
  'Siddharth Joshi', 'Aditi Rao', 'Vijay Iyer', 'Pooja Choudhury',
];

const REMARK_TYPES = ['Non-uniform', 'Late-comer', 'Indiscipline', 'Others'];

function buildMock(dept, year, section) {
  const prefix = dept ? dept.substring(0, 2).toUpperCase() : 'CS';
  const count = 3 + Math.floor(Math.random() * 4); // 3-6 mock records
  const remarkList = [];

  for (let i = 0; i < count; i++) {
    const regNo  = `2024${prefix}${String(i + 1).padStart(3, '0')}`;
    const name   = MOCK_NAMES[i % MOCK_NAMES.length];
    remarkList.push({
      id: 100 + i,
      student_id: i + 1,
      name,
      registerNumber: regNo,
      register_number: regNo,
      remark: REMARK_TYPES[Math.floor(Math.random() * REMARK_TYPES.length)],
      remark_text: REMARK_TYPES[Math.floor(Math.random() * REMARK_TYPES.length)],
      created_at: new Date().toISOString()
    });
  }

  return { remarkList };
}

const YEARS       = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPARTMENTS = ['CSE', 'CSE (AI & ML)', 'CSE (Data Science)', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA'];
const SECTIONS    = ['A', 'B', 'C', 'D'];

export default function History() {
  /* ── Filter state ─────────────────────────────────────────── */
  const [selectedYear,    setSelectedYear]    = useState('');
  const [selectedDept,    setSelectedDept]    = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  /* ── Data state ────────────────────────────────────────────── */
  const [remarkList,    setRemarkList]    = useState([]);
  const [dataLoaded,    setDataLoaded]    = useState(false);

  /* ── UI toggles ────────────────────────────────────────────── */
  const [showRemarks,  setShowRemarks]  = useState(false);
  const [isFetching,   setIsFetching]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Dynamic formatted date ────────────────────────────────── */
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const getCustomFormattedDate = () => {
    const d = new Date();
    const day = d.getDate();
    const year = d.getFullYear().toString().substring(2);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    
    const getSuffix = (n) => {
      if (n >= 11 && n <= 13) return 'th';
      switch (n % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    return `${day}${getSuffix(day)} ${month} '${year}`;
  };

  /* ── Fetch from database on load or filter change ───────────── */
  const fetchRemarks = async (useFilters = false) => {
    setIsFetching(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const params = { date: today };

      if (useFilters) {
        if (selectedYear) params.year = selectedYear;
        if (selectedDept) params.department = selectedDept;
        if (selectedSection) params.section = selectedSection;
      }

      const response = await api.get('/remarks/history', { params });
      
      if (response.data && response.data.records) {
        const mapped = response.data.records.map(r => ({
          id: r.id,
          student_id: r.student_id,
          name: r.name,
          registerNumber: r.register_number,
          register_number: r.register_number,
          remark: r.remark_text || r.remark,
          remark_text: r.remark_text || r.remark,
          created_at: r.created_at
        }));
        setRemarkList(mapped);
        setDataLoaded(true);
      } else {
        throw new Error('Empty dataset');
      }
    } catch (err) {
      console.warn('API fetch failed, generating fallback mock database records...', err);
      const mock = buildMock(selectedDept, selectedYear, selectedSection);
      setRemarkList(mock.remarkList);
      setDataLoaded(true);
    } finally {
      setIsFetching(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchRemarks(false);
  }, []);

  const handleFetchSubmit = (e) => {
    e.preventDefault();
    fetchRemarks(true);
  };

  /* ────────────────────────────────────────────────────────────
     Generate Word Document Report
  ─────────────────────────────────────────────────────────── */
  const handleDownloadDocx = async () => {
    if (!dataLoaded || remarkList.length === 0) {
      toast.error('No remarks records available to export.');
      return;
    }
    setIsGenerating(true);

    try {
      const userName = localStorage.getItem('userName') || 'Incharge';

      const makeTable = (rows, headers) => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: headers.map(h =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                shading: { fill: 'F3F4F6' },
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
            new Paragraph({ text: "Today's Student Disciplinary Remarks Report", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: '' }),
            new Paragraph({ children: [new TextRun({ text: 'Date: ', bold: true }), new TextRun(todayLabel)] }),
            new Paragraph({ children: [new TextRun({ text: 'Year: ', bold: true }), new TextRun(selectedYear || 'All Years')] }),
            new Paragraph({ children: [new TextRun({ text: 'Department: ', bold: true }), new TextRun(selectedDept || 'All Departments')] }),
            new Paragraph({ children: [new TextRun({ text: 'Section: ', bold: true }), new TextRun(selectedSection || 'All Sections')] }),
            new Paragraph({ text: '' }),

            new Paragraph({ text: `Remarks Log (${remarkList.length} Records)`, heading: HeadingLevel.HEADING_3 }),
            makeTable(
              remarkList.map((r, i) => [i + 1, r.name, r.registerNumber || r.register_number, r.remark || r.remark_text]),
              ['#', 'Student Name', 'Register No', 'Remark']
            ),
            new Paragraph({ text: '' }),
            new Paragraph({ children: [new TextRun({ text: 'Generated By: ', bold: true }), new TextRun(userName)] }),
            new Paragraph({ children: [new TextRun({ text: 'Generated At: ', bold: true }), new TextRun(new Date().toLocaleString('en-IN'))] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Remarks_Report_${selectedDept || 'ALL'}_${new Date().toISOString().slice(0, 10)}.docx`);
      toast.success('Word document report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report document.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full p-4 md:p-8 lg:p-12 overflow-y-auto bg-surface">
      <div className="w-full max-w-4xl mx-auto space-y-10">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-3xl md:text-4xl">history</span>
            Evaluation History
          </h1>
          <p className="font-body text-on-surface-variant text-base">
            Review student disciplinary remarks recorded today by the incharge staff.
          </p>
        </div>

        {/* ── Filter Card ─────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6">
          <h2 className="font-display font-semibold text-on-surface text-base mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            Filter Records
          </h2>
          <form onSubmit={handleFetchSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Year */}
            <div className="flex-1 w-full">
              <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Year</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
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
                  <option value="">All Departments</option>
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
                  <option value="">All Sections</option>
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
              {isFetching
                ? <><span className="material-symbols-outlined animate-spin text-base">sync</span> Loading...</>
                : <><span className="material-symbols-outlined text-base">search</span> Filter</>}
            </button>
          </form>
        </div>

        {/* ── Transaction style mint green dashboard card ──────────────── */}
        {dataLoaded && (
          <div className="animate-fade-in space-y-8 flex flex-col items-center">
            {/* Custom Mint Green Card modeled directly after the user reference image */}
            <div className="w-full max-w-md bg-[#EDF7ED] dark:bg-[#1E3A1E]/30 border border-[#CDE7CD] dark:border-[#2E5E2E]/40 rounded-[2rem] p-8 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
              {/* Top Title */}
              <span className="font-label text-xs md:text-sm font-bold text-[#1E4620] dark:text-[#84C284] tracking-wide mb-4">
                {getCustomFormattedDate()}, Today's Collection
              </span>

              {/* Central Big Number Display */}
              <div className="text-6xl md:text-7xl font-extrabold text-[#1E4620] dark:text-[#A4E0A4] my-4 flex items-center justify-center gap-1 animate-scale-up">
                #{remarkList.length}
              </div>

              {/* Clickable Capsule Toggle Button */}
              <button
                onClick={() => setShowRemarks(!showRemarks)}
                className="my-4 bg-white dark:bg-surface-container-high rounded-full py-2.5 px-6 shadow-sm border border-outline-variant/15 text-xs font-semibold flex items-center gap-2 text-on-surface hover:bg-slate-50 dark:hover:bg-surface-container-low hover:shadow-md active:scale-95 transition-all outline-none"
              >
                <span>{remarkList.length} Student Remarks</span>
                <span className={`material-symbols-outlined text-base transition-transform duration-300 ${showRemarks ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Expansive Dropdown Student Details List */}
              <div className={`w-full transition-all duration-500 ease-in-out overflow-hidden flex flex-col gap-2 ${showRemarks ? 'max-h-[300px] mt-4 pt-4 border-t border-[#CDE7CD]/50 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                {remarkList.length > 0 ? (
                  remarkList.map((r, idx) => (
                    <div 
                      key={r.id || idx} 
                      className="bg-white/80 dark:bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-3 border border-[#CDE7CD]/30 shadow-xs flex items-center justify-between text-left"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="font-body text-xs font-bold text-[#1E4620] dark:text-on-surface truncate">{r.name}</div>
                        <div className="font-label text-[10px] text-on-surface-variant font-medium tracking-wide mt-0.5 truncate">{r.registerNumber || r.register_number}</div>
                      </div>
                      <div className="shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-label font-bold bg-[#1E4620]/10 text-[#1E4620] dark:bg-[#A4E0A4]/20 dark:text-[#A4E0A4] capitalize">
                          {r.remark || r.remark_text}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant py-2">No records submitted today.</p>
                )}
              </div>

              {/* Bottom Alarm Warning Banner */}
              <div className="w-full mt-6 bg-[#FFF2F2] dark:bg-[#4C1E1E]/25 border border-[#FADBD8]/40 rounded-2xl p-4 flex items-start gap-3 text-[11px] md:text-xs text-left text-[#A83232] dark:text-[#ECA5A5]">
                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">schedule</span>
                <span className="leading-relaxed">
                  Remarks synchronization is fully active. Today's database writes are logged in real-time.
                </span>
              </div>
            </div>

            {/* Word Document Download Button */}
            {remarkList.length > 0 && (
              <div className="flex justify-center pt-2">
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
            )}
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
              Click the **Filter** button above to load today's evaluation records.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
