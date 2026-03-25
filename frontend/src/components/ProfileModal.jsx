import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'online',  label: '🟢 Online',  color: 'var(--online)' },
  { value: 'idle',    label: '🟡 Idle',    color: 'var(--idle)' },
  { value: 'offline', label: '⚫ Ko\'rinmas', color: 'var(--offline)' },
];

const AVATAR_SEEDS = ['Hero','Pixel','Robot','Fox','Cat','Mochi','Bunny','Panda','Tiger','Bear','Wolf','Dragon','Phoenix','Raven','Falcon'];

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(user?.status || 'online');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [saved,    setSaved]    = useState(false);

  const changeAvatar = seed => {
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setErrorMsg(''); // Clear previous errors
    if (!username.trim()) {
      setErrorMsg('Login bo\'sh bo\'lishi mumkin emas!');
      return;
    }
    
    let finalPassword = user?.password;
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('Yangi parol va tasdiqlash paroli mos kelmadi!');
        return;
      }
      if (newPassword.trim().length < 3) {
        setErrorMsg('Parol xavfsiz emas (kamida 3 ta belgi formasi bo\'lishi kerak)!');
        return;
      }
      finalPassword = newPassword.trim();
    }

    const statusOpt = STATUS_OPTIONS.find(o => o.value === status);
    const result = await updateProfile({ 
      name, 
      username: username.toLowerCase().trim(), 
      password: finalPassword,
      status, 
      statusText: statusOpt?.label.split(' ')[1] || 'Online', 
      avatar, 
      bio 
    });
    if (result && result.error) {
      setErrorMsg(result.error);
    } else {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">👤 Profilni tahrirlash</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Current avatar big */}
          <div className="profile-avatar-preview">
            <img src={avatar} alt="avatar" />
          </div>

          {/* Avatar picker */}
          <div className="profile-section-label">Avatar rasm manzili, yuklash yoki tanlang</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input
              className="profile-input"
              value={avatar.startsWith('data:') ? '' : avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="http://... (Rasm manzili)"
              style={{ flex: 1 }}
            />
            <label className="modal-save" style={{ cursor: 'pointer', padding: '10px 14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
              📁 Yuklash
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>
          <div className="avatar-grid">
            {AVATAR_SEEDS.map(seed => {
              const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
              return (
                <img
                  key={seed}
                  src={url}
                  alt={seed}
                  className={`avatar-option ${avatar === url ? 'selected' : ''}`}
                  onClick={() => changeAvatar(seed)}
                />
              );
            })}
          </div>

          {/* Name */}
          {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '8px' }}>{errorMsg}</div>}
          
          <div className="profile-section-label">Foydalanuvchi ism-sharifi</div>
          <input className="profile-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ismingizni kiriting" autoFocus maxLength={30} />
          
          <div style={{ display: 'flex', gap: 10, marginBottom: '6px' }}>
            <div style={{ flex: 1 }}>
              <div className="profile-section-label">Login (Username)</div>
              <input className="profile-input" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="Yangi login" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-section-label">Joriy parol</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ 
                  fontFamily: 'monospace', 
                  background: 'var(--bg-input)', 
                  padding: '10.5px 14px', 
                  borderRadius: 'var(--r-sm)', 
                  border: '1px solid var(--border-input)',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {showPassword ? user?.password : '••••••••'}
                </span>
                <button 
                  className="icon-btn" 
                  style={{ width: '38px', height: '38px', flexShrink: 0, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 'var(--r-sm)' }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Yashirish" : "Ko'rsatish"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="profile-section-label">Yangi parol</div>
              <input className="profile-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol (ixtiyoriy)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-section-label">Parolni tasdiqlash</div>
              <input className="profile-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Yangi parolni takrorlang" />
            </div>
          </div>

          <div className="profile-section-label">O'zingiz haqingizda</div>
          <textarea
            className="profile-input profile-textarea"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Bio yozing..."
            rows={2}
            maxLength={120}
          />

          {/* Status */}
          <div className="profile-section-label">Holat</div>
          <div className="status-options">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`status-option ${status === opt.value ? 'active' : ''}`}
                onClick={() => setStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Bekor qilish</button>
          <button className="modal-save" onClick={handleSave}>
            {saved ? '✅ Saqlandi!' : '💾 Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
