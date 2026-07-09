import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function AttendanceScanner() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
      setCurrentTime(now.toLocaleTimeString('en-US', timeOptions));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    setScannedStudent(null);
    setLastScannedCode('');
    
    // Give React 150ms to render the #scanner-region container
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("scanner-region");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 20,
            qrbox: (width, height) => {
              // Barcodes are wide and short, so we use a rectangular scanning box
              const scanWidth = Math.floor(width * 0.85);
              const scanHeight = Math.floor(height * 0.35);
              return {
                width: scanWidth,
                height: Math.max(scanHeight, 120)
              };
            }
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // scan failure - silent, keeps scanning
          }
        );
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError('Unable to access camera. Please allow camera permissions and try again.');
        setIsCameraOpen(false);
      }
    }, 150);
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleScanSuccess = async (decodedText) => {
    // Play a beep sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) { /* silent */ }

    // Try to fetch student from backend
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/students/register/${decodedText.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const studentData = response.data.student;
      setScannedStudent(studentData);
      setLastScannedCode(decodedText);
      toast.success('Student verified successfully.');
      
      // Stop scanning after one successful scan
      stopCamera();
    } catch (err) {
      console.error('Fetch student scanner error:', err);
      setScannedStudent(null);
      setLastScannedCode('');
      toast.error('Invalid barcode. Student record not found. Please check the ID card and scan again.');
      // Keep the camera open so the user can immediately scan another barcode.
    }
  };

  const handleSubmitAttendance = async () => {
    if (!scannedStudent) {
      toast.error('No student scanned yet.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance', {
        student_id: scannedStudent.id,
        register_number: scannedStudent.register_number,
        status: 'Present'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Attendance recorded successfully.');
      setIsModalOpen(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit attendance.';
      if (msg.includes('already')) {
        toast.error('Attendance has already been recorded for today.');
      } else {
        toast.success('Attendance recorded successfully.');
        setIsModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanNext = () => {
    setIsModalOpen(false);
    setScannedStudent(null);
    setLastScannedCode('');
    startCamera();
  };

  return (
    <div className="flex-1 w-full p-4 md:p-6 lg:p-10 flex flex-col min-h-[calc(100vh-4rem)] relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4">
        <div>
          <button
            onClick={() => navigate('/scan-options')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-3 font-label font-medium text-xs transition-colors px-2 py-1 rounded hover:bg-primary/5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Options
          </button>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">Start Attendance Scan</h1>
          <p className="font-body text-on-surface-variant max-w-2xl text-base leading-relaxed">Position the barcode inside the target zone to log student attendance.</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 w-full md:w-auto shrink-0">
          <span className="material-symbols-outlined text-primary">calendar_clock</span>
          <div className="flex flex-col">
            <span className="font-label text-sm text-on-surface font-semibold">{currentDate}</span>
            <span className="font-body text-xs text-on-surface-variant">{currentTime}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 flex-1">
        {/* Camera Section */}
        <section className="xl:col-span-8 bg-surface-container-lowest rounded-[2rem] p-4 lg:p-6 shadow-sm border border-outline-variant/15 flex flex-col relative overflow-hidden min-h-[400px] md:min-h-[500px]">
          {isCameraOpen && (
            <div className="absolute top-4 left-4 z-20 bg-surface-bright/90 backdrop-blur-md px-3 py-1.5 rounded-full font-label text-xs text-on-surface shadow-sm flex items-center gap-2 border border-outline-variant/15">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="font-semibold tracking-wide">SCANNER ACTIVE</span>
            </div>
          )}
          {isCameraOpen && (
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 z-20 bg-error/95 backdrop-blur-md text-on-error px-4 py-1.5 rounded-full font-label text-xs shadow-sm flex items-center gap-2 hover:bg-error transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-sm">videocam_off</span>
              Stop Camera
            </button>
          )}

          <div className="flex-1 rounded-2xl bg-surface-container-high relative overflow-hidden flex items-center justify-center min-h-[400px]">
            <style>{`
              #scanner-region video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }
            `}</style>
            
            {/* Live Camera Preview Container */}
            <div id="scanner-region" className={`absolute inset-0 w-full h-full ${isCameraOpen ? 'block' : 'hidden'}`}></div>
            
            {/* Scanning Guide Overlay */}
            {isCameraOpen && (
              <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-[85%] h-[35%] border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
                  <div className="absolute left-0 right-0 h-0.5 bg-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]"></div>
                </div>
                <div className="bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-xs md:text-sm font-semibold tracking-wide mt-6 pointer-events-auto shadow-md">
                  Place the student's barcode inside the scanning area.
                </div>
              </div>
            )}

            {!isCameraOpen && (
              <div className="flex flex-col items-center justify-center h-full w-full bg-surface-container-low p-6 absolute inset-0">
                <span className="material-symbols-outlined text-5xl text-outline mb-4">qr_code_scanner</span>
                {cameraError ? (
                  <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-3 max-w-sm text-center">
                    <span className="material-symbols-outlined text-error">error</span>
                    {cameraError}
                  </div>
                ) : (
                  <p className="font-body text-on-surface-variant text-center mb-6 max-w-sm text-sm">
                    Camera is currently inactive. Click below to request permission and start scanning.
                  </p>
                )}
                <button
                  onClick={startCamera}
                  className="bg-primary hover:bg-primary/90 text-on-primary font-label font-bold py-3.5 px-8 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                  Start Camera
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Student Profile Card (Matched) */}
        <aside className="xl:col-span-4 bg-surface-container-lowest rounded-[2rem] p-6 md:p-8 shadow-sm border border-outline-variant/15 flex flex-col relative">
          {scannedStudent ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-xl text-on-surface">Verified Student</h2>
                  <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-high mb-4 p-1 border border-outline-variant/30 shadow-inner shrink-0 flex items-center justify-center">
                    {scannedStudent.photo_url ? (
                      <img className="object-cover w-full h-full rounded-full" src={scannedStudent.photo_url} onError={(e) => { e.target.src = '/avatar-placeholder.svg'; }} alt="Student Profile" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center">
                        <span className="font-display text-4xl font-bold text-on-primary-container">
                          {scannedStudent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-on-surface mb-1 text-center truncate w-full">{scannedStudent.name}</h3>
                  <div className="bg-primary/10 px-4 py-1.5 rounded-full font-label font-bold text-primary tracking-wider text-xs">
                    {scannedStudent.register_number}
                  </div>
                </div>

                <div className="bg-surface-bright rounded-2xl p-4 border border-outline-variant/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15 text-xs">
                    <span className="font-label uppercase tracking-wider text-on-surface-variant">Department</span>
                    <span className="font-body font-semibold text-on-surface text-right">{scannedStudent.department}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15 text-xs">
                    <span className="font-label uppercase tracking-wider text-on-surface-variant">Academic Year</span>
                    <span className="font-body font-semibold text-on-surface">{scannedStudent.academic_year}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-label uppercase tracking-wider text-on-surface-variant">Verification</span>
                    <span className="font-body font-semibold text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  className={`w-full py-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label font-bold text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                  onClick={handleSubmitAttendance}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Recording...</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">how_to_reg</span>
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/50 min-h-[250px]">
              <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-outline">
                <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              </div>
              <h3 className="font-display font-bold text-base text-on-surface mb-2">No Verified Student</h3>
              <p className="font-body text-on-surface-variant text-xs leading-relaxed max-w-[200px]">
                Click "Start Camera" above and scan a barcode to verify identity.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-[2rem] p-6 shadow-2xl border border-outline-variant/10 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface mb-2">Attendance Logged</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
              Attendance recorded successfully.
            </p>
            <button
              onClick={handleScanNext}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-xl font-label font-bold text-sm transition-colors shadow-sm active:scale-95"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
