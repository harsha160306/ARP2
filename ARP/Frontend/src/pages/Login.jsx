import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const [role,         setRole        ] = useState('');
  const [username,     setUsername    ] = useState('');
  const [password,     setPassword    ] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading   ] = useState(false);
  const [error,        setError       ] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { role, username, password });
      const { user, token } = response.data;
      login(user, token);
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface">

      {/* ── Left decorative panel (hidden on mobile) ─────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-primary/5 flex-col items-center justify-center p-12 relative overflow-hidden border-r border-outline-variant/20">
        {/* dot grid backdrop */}
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

        {/* Gradient blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl primary-gradient flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-on-surface mb-3 tracking-tight">
            MIC Attendance
          </h1>
          <p className="font-body text-on-surface-variant text-[15px] leading-relaxed mb-10">
            Modern Institute College's staff portal for managing daily student attendance and disciplinary remarks.
          </p>

          {/* Feature list */}
          {[
            { icon: 'qr_code_scanner', text: 'Barcode ID card scanning' },
            { icon: 'how_to_reg',      text: 'Class-based attendance marking' },
            { icon: 'rate_review',     text: 'Disciplinary remark logging' },
            { icon: 'monitoring',      text: 'Exportable history reports' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 mb-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[16px]">{f.icon}</span>
              </div>
              <span className="font-label text-[13.5px] text-on-surface-variant font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-on-surface">MIC Attendance</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-1.5">Sign in to your account</h2>
            <p className="font-body text-on-surface-variant text-sm">Enter your credentials to access the staff portal.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-3 animate-shake">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <span className="font-label text-[13px] font-medium text-red-700 dark:text-red-400">
                Invalid role, username, or password.
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role */}
            <div>
              <label className="block font-label text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5" htmlFor="role">
                Role
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">badge</span>
                <select
                  id="role" name="role" required
                  value={role} onChange={e => setRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-body text-sm appearance-none focus:outline-none transition-all"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="HOD">HOD</option>
                  <option value="Incharge">Incharge</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block font-label text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">person</span>
                <input
                  id="username" name="username" type="text" required
                  placeholder="Enter username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-body text-sm placeholder:text-outline focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-label text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                <input
                  id="password" name="password" required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-body text-sm placeholder:text-outline focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a href="#" className="font-label text-[12px] text-primary hover:underline underline-offset-2">
                Forgot credentials?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 primary-gradient text-white font-label font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[.98] flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Signing in...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">login</span> Sign In</>
              )}
            </button>
          </form>

          <p className="mt-10 text-center font-label text-[11px] text-outline uppercase tracking-widest">
            © {new Date().getFullYear()} Modern Institute College · Secure Portal
          </p>
        </div>
      </div>
    </div>
  );
}
