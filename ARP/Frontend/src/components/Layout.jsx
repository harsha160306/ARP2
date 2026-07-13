import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, theme, toggleTheme } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userName = user?.name || localStorage.getItem('userName') || 'MIC Staff';
  const userRole = user?.role || localStorage.getItem('userRole') || 'Staff';

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { path: '/home',         icon: 'space_dashboard',  label: 'Dashboard'    },
    { path: '/registration', icon: 'person_add',       label: 'Enrollment'   },
    { path: '/remark-scanner', icon: 'qr_code_scanner',  label: 'Scanner'      },
    { path: '/remark',       icon: 'rate_review',      label: 'Remarks'      },
    { path: '/history',      icon: 'monitoring',       label: 'History'      },
  ];

  const filteredNavLinks = navLinks;

  const currentPage = navLinks.find(l => location.pathname.startsWith(l.path))?.label || 'Dashboard';

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex antialiased overflow-hidden w-full">

      {/* ── Mobile overlay ──────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ═══════════════════ SIDEBAR ════════════════════════════ */}
      <nav className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-surface-container-lowest dark:bg-surface-container-lowest
        border-r border-outline-variant/20
        sidebar-shadow transition-all duration-300 ease-in-out
        w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-[72px] lg:w-64
      `}>

        {/* Logo strip */}
        <div className="flex items-center gap-3 px-4 py-5 lg:px-6 border-b border-outline-variant/15">
          <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div className="md:hidden lg:block">
            <div className="font-display font-bold text-[15px] text-on-surface leading-tight">MIC</div>
            <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest leading-tight">Attendance</div>
          </div>
          {/* Mobile close */}
          <button
            className="ml-auto md:hidden p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {filteredNavLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                title={link.label}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group
                  md:justify-center lg:justify-start
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {link.icon}
                </span>
                <span className={`md:hidden lg:inline font-label font-semibold text-[13.5px] ${isActive ? 'text-primary' : ''}`}>
                  {link.label}
                </span>
                {isActive && (
                  <span className="ml-auto md:hidden lg:block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User section */}
        <div className="border-t border-outline-variant/15 p-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors md:justify-center lg:justify-start"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="md:hidden lg:inline font-label text-[13px] font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors md:justify-center lg:justify-start group"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="md:hidden lg:inline font-label text-[13px] font-medium">Sign Out</span>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 py-2 mt-1 md:justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="md:hidden lg:block min-w-0">
              <div className="font-label font-semibold text-[13px] text-on-surface truncate">{userName}</div>
              <div className="font-label text-[11px] text-on-surface-variant truncate">{userRole}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═════════════════ MAIN AREA ════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[72px] lg:ml-64 w-full transition-all duration-300">

        {/* ── Top header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-30 h-[60px] shrink-0
          bg-surface-container-lowest/90 dark:bg-surface-container-lowest/90
          backdrop-blur-xl border-b border-outline-variant/20
          flex items-center justify-between px-5 md:px-8 gap-4">

          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-label text-on-surface-variant">MIC</span>
              <span className="text-outline-variant">/</span>
              <span className="font-label font-semibold text-on-surface">{currentPage}</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-xs font-label text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </div>

            <Link
              to="/registration"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl primary-gradient text-white font-label font-semibold text-[13px] shadow-sm hover:shadow-md hover:opacity-95 transition-all active:scale-[.97]"
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              <span className="hidden sm:inline">Enroll</span>
            </Link>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────── */}
        <main className="flex-1 flex flex-col w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
