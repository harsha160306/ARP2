import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CARDS = [
  {
    to:          '/remark-scanner',
    icon:        'qr_code_scanner',
    title:       'Open Scanner',
    subtitle:    'Scan barcode',
    description: 'Launch the webcam scanner to verify student ID cards instantly for discipline remarks.',
    cta:         'Open Scanner',
    accent:      'indigo',
  },
  {
    to:          '/remark',
    icon:        'rate_review',
    title:       'Remarks',
    subtitle:    'Disciplinary notes',
    description: 'Record student disciplinary remarks after scanning their ID card or searching by register number.',
    cta:         'Open Remarks',
    accent:      'violet',
  },
];

const ACCENT = {
  indigo: {
    icon:   'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    bar:    'bg-indigo-600',
    cta:    'bg-indigo-600 hover:bg-indigo-700 text-white',
    glow:   'group-hover:bg-indigo-500/10',
  },
  violet: {
    icon:   'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
    bar:    'bg-violet-600',
    cta:    'bg-violet-600 hover:bg-violet-700 text-white',
    glow:   'group-hover:bg-violet-500/10',
  },
};

const QUICK_LINKS = [
  { to: '/history',      icon: 'monitoring',   label: 'View History' },
  { to: '/registration', icon: 'person_add',   label: 'Enroll Student' },
  { to: '/remark-scanner', icon: 'qr_code_scanner', label: 'Launch Scanner' },
];

export default function Home() {
  const { user } = useAppContext();
  const userName = user?.name || localStorage.getItem('userName') || 'User';
  const userRole = user?.role || localStorage.getItem('userRole') || 'Staff';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const allowedCards = CARDS;

  const allowedQuickLinks = QUICK_LINKS;

  return (
    <div className="flex-1 p-5 md:p-8 xl:p-12 overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Hero greeting ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-label text-on-surface-variant text-sm mb-1">{dateStr}</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
              {greeting}, <span className="text-primary">{userName}</span> 👋
            </h1>
            <p className="font-body text-on-surface-variant text-sm mt-1.5">
              MIC Attendance & Remarks — Staff Portal
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-label text-emerald-700 dark:text-emerald-400 text-sm font-semibold">System Online</span>
          </div>
        </div>

        {/* ── Action cards ─────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allowedCards.map((card) => {
            const a = ACCENT[card.accent];
            return (
              <div
                key={card.to}
                className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Colour accent bar */}
                <div className={`h-1 w-full ${a.bar}`} />

                {/* Glow blob */}
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${a.glow} pointer-events-none`} />

                <div className="flex flex-col flex-1 p-6 relative z-10">
                  {/* Icon + meta */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-[16px] text-on-surface leading-tight">{card.title}</h2>
                      <p className="font-label text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">{card.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-body text-[13.5px] text-on-surface-variant leading-relaxed flex-1 mb-6">
                    {card.description}
                  </p>

                  {/* CTA */}
                  <Link
                    to={card.to}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-label font-semibold text-[13px] transition-all duration-200 active:scale-[.97] shadow-sm ${a.cta}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    {card.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Stats row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Today\'s Date',  value: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), icon: 'today',         color: 'text-blue-600' },
            { label: 'Academic Year',  value: '2024–25',  icon: 'school',        color: 'text-indigo-600' },
            { label: 'Portal Status',  value: 'Active',   icon: 'verified',      color: 'text-emerald-600' },
            { label: 'Role',           value: user?.role || localStorage.getItem('userRole') || 'Staff', icon: 'badge', color: 'text-violet-600' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-lowest card-shadow rounded-xl px-4 py-4 flex items-center gap-3">
              <span className={`material-symbols-outlined text-[22px] shrink-0 ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <div className="min-w-0">
                <div className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider truncate">{s.label}</div>
                <div className="font-display font-bold text-[15px] text-on-surface truncate">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick links ──────────────────────────────────────── */}
        <div>
          <h3 className="font-display font-semibold text-[14px] text-on-surface-variant uppercase tracking-widest mb-4">Quick Access</h3>
          <div className="flex flex-wrap gap-3">
            {allowedQuickLinks.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest card-shadow rounded-xl text-[13px] font-label font-semibold text-on-surface hover:bg-primary/5 hover:text-primary transition-all duration-150"
              >
                <span className="material-symbols-outlined text-[16px]">{q.icon}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
