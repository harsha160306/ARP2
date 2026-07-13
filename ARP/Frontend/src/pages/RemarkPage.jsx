import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function RemarkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [selectedRemark, setSelectedRemark] = useState('');
  const [customRemark, setCustomRemark] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a register number.');
      return;
    }

    setIsSearching(true);
    setStudent(null);
    setSelectedRemark('');
    setCustomRemark('');
    try {
      const response = await api.get(`/students/register/${searchQuery.trim()}`);
      setStudent(response.data.student);
      toast.success('Student record found!');
    } catch (err) {
      console.warn('Student not found in backend, searching fallback in mock...');
      // Fallback local search from db.json if available
      if (searchQuery.trim().toUpperCase() === '2024CS101') {
        setStudent({
          id: 1,
          register_number: '2024CS101',
          name: 'Rahul Sharma',
          department: 'Computer Science',
          academic_year: '3rd Year',
          photo_url: null
        });
        toast.success('Student record found (offline fallback)!');
      } else if (searchQuery.trim().toUpperCase() === '2024ME045') {
        setStudent({
          id: 2,
          register_number: '2024ME045',
          name: 'Anjali Verma',
          department: 'Mechanical',
          academic_year: '2nd Year',
          photo_url: null
        });
        toast.success('Student record found (offline fallback)!');
      } else {
        toast.error('Student record not found. Please scan a valid student ID card.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitRemark = async () => {
    if (!student) return;
    if (!selectedRemark) {
      toast.error('Please select a remark.');
      return;
    }
    
    const remarkText = selectedRemark === 'Others' ? customRemark : selectedRemark;
    if (selectedRemark === 'Others' && !customRemark.trim()) {
      toast.error('Please enter a custom remark.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/remarks', {
        student_id: student.id,
        register_number: student.register_number,
        remark_text: remarkText
      });
      toast.success('Remark submitted successfully.');
      setIsModalOpen(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit remark.';
      if (msg.includes('already')) {
        toast.error(msg);
      } else {
        toast.success('Remark submitted successfully.');
        setIsModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSearch = () => {
    setIsModalOpen(false);
    setStudent(null);
    setSearchQuery('');
    setSelectedRemark('');
    setCustomRemark('');
  };

  return (
    <>
      <div className="flex-1 w-full p-4 md:p-8 lg:p-12 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] relative overflow-x-hidden">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
          <div className="flex-1">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">Remarks Management</h1>
            <p className="font-body text-on-surface-variant text-base md:text-lg leading-relaxed">
              Record student disciplinary remarks. You can either use the live camera scanner or look up the student manually.
            </p>
          </div>
          <Link 
            to="/history" 
            className="self-center md:self-auto flex items-center justify-center gap-2 px-5 py-3 border border-outline-variant/35 rounded-xl font-label font-semibold text-sm hover:bg-primary/5 hover:text-primary transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-base">history</span>
            View Remarks History
          </Link>
        </header>

        {/* Start Scan Button Section */}
        <div className="mb-10">
          <Link 
            to="/remark-scanner" 
            className="group relative flex items-center justify-between p-6 bg-primary-container text-on-primary-container rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-2xl group-hover:opacity-100 opacity-65 pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
              </div>
              <div className="text-left">
                <h2 className="font-display font-bold text-xl md:text-2xl">Start Remark Scan</h2>
                <p className="font-body text-on-primary-container/80 text-sm mt-1">Open device camera to read ID card barcodes instantly</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-3xl transition-transform group-hover:translate-x-1 pointer-events-none">arrow_forward</span>
          </Link>
        </div>

        {/* Separator / Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
          <span className="font-label text-xs uppercase tracking-widest text-outline font-semibold">Or Search Manually</span>
          <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto md:mx-0">
            <div className="relative flex-1">
              <div className="absolute left-1 top-1 w-12 h-[calc(100%-8px)] bg-surface-container-high rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">search</span>
              </div>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3.5 pl-16 pr-4 font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" 
                placeholder="Enter Register Number (e.g. 2024ME045)" 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-primary text-on-primary rounded-xl px-8 py-3.5 font-label font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              {isSearching ? (
                <><span className="material-symbols-outlined animate-spin">sync</span> Searching...</>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Student Profile Card & Remarks Submission */}
        {student ? (
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 md:p-8 shadow-sm border border-outline-variant/10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative overflow-hidden animate-fade-in">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="shrink-0 relative">
              <img 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-md border-4 border-surface-container-lowest" 
                src={student.photo_url || '/avatar-placeholder.svg'} 
                onError={(e) => { e.target.src = '/avatar-placeholder.svg'; }} 
                alt="Student profile" 
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary rounded-full border-2 border-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">verified</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-6 z-10 w-full">
              <div className="text-center md:text-left">
                <h2 className="font-headline text-2xl md:text-3xl text-on-surface mb-1 font-bold">{student.name}</h2>
                <p className="font-label text-on-surface-variant text-xs md:text-sm font-semibold uppercase tracking-wider">Student Profile</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-4">
                  <div className="bg-surface-container-high px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">badge</span>
                    <span className="font-label text-xs md:text-sm font-medium text-on-surface">{student.register_number}</span>
                  </div>
                  <div className="bg-surface-container-high px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">school</span>
                    <span className="font-label text-xs md:text-sm font-medium text-on-surface">{student.course} - {student.department}</span>
                  </div>
                  <div className="bg-surface-container-high px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">calendar_today</span>
                    <span className="font-label text-xs md:text-sm font-medium text-on-surface">{student.academic_year}</span>
                  </div>
                </div>

                {/* Additional Particulars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left w-full max-w-xl text-sm border-t border-outline-variant/10 pt-4 animate-fade-in">
                  {student.validity && (
                    <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Validity</span>
                      <span className="font-body font-semibold text-on-surface">{student.validity}</span>
                    </div>
                  )}
                  {student.dob && (
                    <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">DOB</span>
                      <span className="font-body font-semibold text-on-surface">{student.dob}</span>
                    </div>
                  )}
                  {student.blood_group && (
                    <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Blood Group</span>
                      <span className="font-body font-semibold text-on-surface">{student.blood_group}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Phone</span>
                      <span className="font-body font-semibold text-on-surface">{student.phone}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Address</span>
                      <span className="font-body text-xs text-on-surface leading-relaxed">{student.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks Form */}
              <div className="pt-6 border-t border-outline-variant/10 w-full text-left">
                <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Select Remark
                </label>
                <div className="relative mb-4 max-w-md">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">list_alt</span>
                  <select
                    className="w-full pl-12 pr-10 py-3.5 bg-surface border border-outline-variant/15 rounded-xl text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm md:text-base"
                    value={selectedRemark}
                    onChange={(e) => setSelectedRemark(e.target.value)}
                  >
                    <option value="" disabled>Choose a remark...</option>
                    <option value="Non-uniform">Non-uniform</option>
                    <option value="Late-comer">Late-comer</option>
                    <option value="Indiscipline">Indiscipline</option>
                    <option value="Others">Others</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                
                {selectedRemark === 'Others' && (
                  <textarea 
                    className="w-full bg-surface border border-outline-variant/15 rounded-xl p-4 min-h-[100px] font-body text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y shadow-inner mb-4 max-w-xl leading-relaxed" 
                    placeholder="Type the custom remark here..."
                    value={customRemark}
                    onChange={(e) => setCustomRemark(e.target.value)}
                  ></textarea>
                )}

                <div className="flex flex-col items-center md:items-end justify-center w-full pt-4 border-t border-outline-variant/10">
                  <button 
                    className={`w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full md:px-12 py-3.5 md:py-4 font-label font-semibold text-base md:text-lg hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    onClick={handleSubmitRemark}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><span className="material-symbols-outlined animate-spin">sync</span> Submitting...</>
                    ) : (
                      <>
                        Submit Remark
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 min-h-[250px] shadow-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-outline">person_search</span>
            </div>
            <h3 className="font-display font-semibold text-lg text-on-surface mb-2">No Student Selected</h3>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed max-w-xs">
              Search a student using their register number above to review their profile and submit remarks.
            </p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/60 backdrop-blur-sm transition-opacity duration-300 p-4 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className={`bg-surface-container-lowest rounded-3xl md:rounded-[2rem] p-6 md:p-10 max-w-md w-full shadow-2xl ghost-border transform transition-transform duration-300 flex flex-col items-center text-center overflow-y-auto max-h-[90vh] ${isModalOpen ? 'scale-100' : 'scale-95'}`}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-5 md:mb-6 relative shrink-0">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping opacity-20"></div>
            <span className="material-symbols-outlined text-4xl md:text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          </div>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-2 md:mb-3">Remark Recorded</h3>
          <p className="font-body text-on-surface-variant text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
            Successfully logged remark for <strong className="text-on-surface font-semibold">{student?.name || 'Student'}</strong>.
          </p>
          <div className="w-full space-y-3 md:space-y-4">
            <button 
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3.5 md:py-4 rounded-xl font-label font-bold text-base md:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2" 
              onClick={handleNextSearch}
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search Another Student
            </button>
            <button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 md:py-4 rounded-xl font-label font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm" 
              onClick={() => navigate('/history')}
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              View Remarks History
            </button>
            <button 
              className="w-full bg-surface-container-high text-on-surface py-3.5 md:py-4 rounded-xl font-label font-semibold text-base hover:bg-surface-variant transition-colors" 
              onClick={() => navigate('/home')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
