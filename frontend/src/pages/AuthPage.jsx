import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        login(form.username, form.password);
      } else {
        if (!form.displayName.trim()) throw new Error('Ism majburiy');
        if (form.password.length < 4) throw new Error('Parol kamida 4 ta belgidan iborat bo\'lishi kerak');
        if (form.password !== form.confirm) throw new Error('Parollar mos kelmadi');
        register(form.username, form.displayName, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <div className="auth-logo-text">ChitChat</div>
        </div>

        <div className="auth-title">
          {mode === 'login' ? 'Xush kelibsiz!' : 'Ro\'yxatdan o\'tish'}
        </div>
        <div className="auth-subtitle">
          {mode === 'login'
            ? 'Hisobingizga kiring va suhbatlashishni boshlang'
            : 'Yangi hisob yarating va jamoaga qo\'shiling'
          }
        </div>

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="auth-field">
            <label className="auth-label">Foydalanuvchi nomi</label>
            <input
              className="auth-input"
              type="text"
              placeholder="masalan: jahongir"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              required
              autoFocus
            />
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Ism (ko'rsatiladigan nom)</label>
              <input
                className="auth-input"
                type="text"
                placeholder="masalan: Jahongir Zokirov"
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Parol</label>
            <div className="password-input-wrapper">
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rish'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Parolni tasdiqlang</label>
              <div className="password-input-wrapper">
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? '⏳ Yuklanmoqda...' : mode === 'login' ? '🚀 Kirish' : '✨ Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Hisob yo'qmi? <button onClick={() => { setMode('register'); setError(''); }}>Ro'yxatdan o'ting</button></>
          ) : (
            <>Allaqachon hisobingiz bormi? <button onClick={() => { setMode('login'); setError(''); }}>Kiring</button></>
          )}
        </div>

        {mode === 'login' && (
          <div className="auth-demo-hint">
            <span>Demo kirish:</span> foydalanuvchi nomi <code>asilbek</code>, parol <code>12345</code>
          </div>
        )}
      </div>

      <style>{`
        .auth-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-app);
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-sidebar);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 36px 32px;
          box-shadow: var(--shadow);
          animation: authSlideIn 0.4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes authSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .auth-logo-icon {
          width: 42px; height: 42px;
          background: var(--brand);
          border-radius: var(--r-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }
        .auth-logo-text {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .auth-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 28px;
          line-height: 1.5;
        }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .auth-input {
          padding: 11px 14px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--r-sm);
          outline: none;
          font-size: 0.9rem;
          color: var(--text-primary);
          transition: border-color var(--t), box-shadow var(--t);
        }
        .auth-input::placeholder { color: var(--text-muted); }
        .auth-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-alpha);
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input-wrapper .auth-input {
          width: 100%;
          box-sizing: border-box;
          padding-right: 40px;
        }
        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          outline: none;
        }
        .password-toggle-btn:hover {
          opacity: 0.8;
        }
        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
          border-radius: var(--r-sm);
          padding: 10px 14px;
          font-size: 0.84rem;
          font-weight: 500;
        }
        .auth-btn {
          padding: 13px;
          background: var(--brand);
          color: #fff;
          border-radius: var(--r-sm);
          font-size: 0.95rem;
          font-weight: 700;
          margin-top: 4px;
          transition: all var(--t);
        }
        .auth-btn:hover:not(:disabled) {
          background: var(--brand-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px var(--brand-alpha);
        }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-switch {
          text-align: center;
          font-size: 0.84rem;
          color: var(--text-secondary);
          margin-top: 20px;
        }
        .auth-switch button {
          color: var(--brand);
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }
        .auth-demo-hint {
          margin-top: 16px;
          background: var(--brand-alpha);
          border: 1px solid rgba(91,140,247,0.3);
          border-radius: var(--r-sm);
          padding: 10px 14px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: center;
        }
        .auth-demo-hint code {
          background: var(--bg-card);
          padding: 1px 6px;
          border-radius: 4px;
          color: var(--brand);
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
