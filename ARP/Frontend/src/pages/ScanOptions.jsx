import { Link, useNavigate } from 'react-router-dom';

export default function ScanOptions() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 relative p-6 md:p-12 lg:p-20 max-w-6xl mx-auto w-full flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-tertiary/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col h-full w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 font-label font-medium text-sm transition-colors active:scale-95 self-start px-3 py-2 rounded-lg hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to Home
        </button>

        {/* Page Header */}
        <div className="mb-8 md:mb-12 max-w-2xl">
          <div className="flex items-center gap-2 text-primary mb-4">
            <span className="material-symbols-outlined">center_focus_strong</span>
            <span className="font-label text-sm uppercase tracking-widest font-medium">Scanner Options</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface leading-tight tracking-tight mb-4">
            Select Scan Action
          </h2>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed">
            Choose an operation to proceed. The camera will open only after you reach the selected scanner page.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 flex-1">
          {/* Card 1: Attendance */}
          <div className="group relative rounded-3xl p-1 bg-surface-container-low ghost-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:diffused-shadow cursor-pointer flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative h-full glass-panel rounded-[1.35rem] p-6 md:p-8 lg:p-10 flex flex-col items-start">
              <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6 md:mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4 text-on-surface">Start Attendance Scan</h3>
              <p className="font-body text-on-surface-variant mb-8 md:mb-10 text-sm md:text-base leading-relaxed flex-1">
                Scan a student's ID card to record attendance. The system will automatically log the timestamp and current location.
              </p>
              <Link to="/attendance-scanner" className="mt-auto inline-flex items-center gap-3 bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all hover:shadow-lg active:scale-95 w-full sm:w-auto justify-center">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>Start Attendance Scan</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Remark */}
          <div className="group relative rounded-3xl p-1 bg-surface-container-low ghost-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:diffused-shadow cursor-pointer flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative h-full glass-panel rounded-[1.35rem] p-6 md:p-8 lg:p-10 flex flex-col items-start">
              <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6 md:mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>comment</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4 text-on-surface">Start Remark Scan</h3>
              <p className="font-body text-on-surface-variant mb-8 md:mb-10 text-sm md:text-base leading-relaxed flex-1">
                Scan a student's ID card to add a discipline remark. Attaches directly to the student's central academic profile.
              </p>
              <Link to="/remark-scanner" className="mt-auto inline-flex items-center gap-3 bg-gradient-to-r from-primary to-surface-tint text-on-primary font-label font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all hover:shadow-lg active:scale-95 w-full sm:w-auto justify-center">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span>Start Remark Scan</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
