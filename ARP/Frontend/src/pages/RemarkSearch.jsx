import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RemarkSearch() {
  const [activeTab, setActiveTab] = useState('remark'); // 'attendance' or 'remark'
  const [selectedRemark, setSelectedRemark] = useState('');
  const [customRemark, setCustomRemark] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('remark'); // 'attendance' or 'remark'
  const navigate = useNavigate();

  const handleSubmit = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex-1 w-full p-4 md:p-8 lg:p-12 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] relative overflow-x-hidden">
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-6">Student Evaluation</h1>
          {/* Toggle Switch */}
          <div className="inline-flex bg-surface-container rounded-full p-1 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 sm:flex-none px-6 md:px-8 py-2.5 rounded-full font-label text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Attendance
            </button>
            <button 
              onClick={() => setActiveTab('remark')}
              className={`flex-1 sm:flex-none px-6 md:px-8 py-2.5 rounded-full font-label text-sm font-medium transition-colors ${activeTab === 'remark' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Remark
            </button>
          </div>
        </header>

        {/* Search Field */}
        <div className="mb-10 md:mb-12">
          <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3 font-semibold text-center md:text-left">Locate Record</label>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto md:mx-0">
            <div className="relative flex-1">
              <div className="absolute left-1 top-1 w-12 h-[calc(100%-8px)] bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">search</span>
              </div>
              <input className="w-full bg-surface border border-outline-variant/15 rounded-xl py-3.5 pl-16 pr-4 font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" placeholder="Enter Register Number" type="text" defaultValue="2024ME045" />
            </div>
            <button className="bg-primary text-on-primary rounded-xl px-8 py-3.5 font-label font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
              Search
            </button>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 md:mb-10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl"></div>
          <div className="shrink-0 relative">
            <img className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-md border-4 border-surface-container-lowest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTuEzyi6BX288E_wzMVHXWMUOfXKPnfoPAH-0dsuJNUGciaHdnYoTT5IyMfM-JJZ7OW1ZV70AIG19OH-9tzOJmQq8qbSS0Xg34ph03JJs5GmH2skFMmBT1Xw7a2IL6TSpY0ftt8RCdDU_LuiAX1WBu9ZPaWZzIH6GwRQIVRSprKZ-2ZlDKud2OZ_VEYon1QNT90Cs_CwlzK6xDNIjcFck0Y3tFfIkkamZS7duB52mqHKmOgPa_uVfZVj72aDAEqz9luXXxnSkVE_YB" onError={(e) => { e.target.src = '/avatar-placeholder.svg'; }} alt="Student profile" />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary rounded-full border-2 border-surface-container-lowest flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px]">verified</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3 md:gap-4 z-10 text-center md:text-left w-full">
            <div>
              <h2 className="font-headline text-2xl md:text-3xl text-on-surface mb-1">Anjali Verma</h2>
              <p className="font-label text-on-surface-variant text-xs md:text-sm">Undergraduate Scholar</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-2">
              <div className="bg-surface-container px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">badge</span>
                <span className="font-label text-xs md:text-sm font-medium text-on-surface">2024ME045</span>
              </div>
              <div className="bg-surface-container px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">precision_manufacturing</span>
                <span className="font-label text-xs md:text-sm font-medium text-on-surface">Mechanical</span>
              </div>
              <div className="bg-surface-container px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-outline-variant/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] md:text-[18px]">school</span>
                <span className="font-label text-xs md:text-sm font-medium text-on-surface">2nd Year</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area based on activeTab */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
          {activeTab === 'remark' ? (
            <>
              <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 font-semibold flex items-center gap-2 justify-center md:justify-start">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Select Remark
              </label>
              <div className="relative mb-6">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">list_alt</span>
                <select
                  className="w-full pl-12 pr-10 py-3.5 md:py-4 bg-surface border border-outline-variant/15 rounded-xl text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm md:text-base"
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
                  className="w-full bg-surface border border-outline-variant/15 rounded-xl p-4 md:p-5 min-h-[100px] md:min-h-[120px] font-body text-on-surface text-sm md:text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y shadow-inner mb-6 leading-relaxed" 
                  placeholder="Type the custom remark here..."
                  value={customRemark}
                  onChange={(e) => setCustomRemark(e.target.value)}
                ></textarea>
              )}

              <button 
                className="bg-primary text-on-primary rounded-full w-full md:w-auto md:px-12 py-3.5 md:py-4 font-label font-semibold text-base md:text-lg hover:bg-primary/90 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 md:float-right"
                onClick={() => handleSubmit('remark')}
              >
                Submit Remark <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="clear-both hidden md:block"></div>
            </>
          ) : (
            <div className="flex flex-col items-center md:items-end justify-center w-full">
              <button 
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full md:px-12 py-3.5 md:py-4 font-label font-semibold text-base md:text-lg hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                onClick={() => handleSubmit('attendance')}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                Submit Attendance
              </button>
            </div>
          )}
        </div>
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
          <h3 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-2 md:mb-3">
            {modalType === 'attendance' ? 'Attendance Recorded' : 'Remark Recorded'}
          </h3>
          <p className="font-body text-on-surface-variant text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
            {modalType === 'attendance' 
              ? <>Successfully logged today's attendance for <strong className="text-on-surface font-semibold">Anjali Verma</strong>.</>
              : <>Successfully logged remark for <strong className="text-on-surface font-semibold">Anjali Verma</strong>.</>
            }
          </p>
          <div className="w-full space-y-3 md:space-y-4">
            <button 
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3.5 md:py-4 rounded-xl font-label font-bold text-base md:text-lg shadow-sm hover:shadow-md transition-all" 
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRemark('');
                setCustomRemark('');
              }}
            >
              Search Another Student
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
