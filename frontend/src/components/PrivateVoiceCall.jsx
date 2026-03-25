import { useState, useEffect } from 'react';

export default function PrivateVoiceCall({ partner, me, onClose }) {
  const [duration, setDuration]   = useState(0);
  const [muted, setMuted]         = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState(false);
  const [meSpeaking, setMeSpeaking]           = useState(false);
  const [status, setStatus] = useState('ringing'); // ringing | connected

  // Auto pick-up is removed to avoid bot behavior. 
  // In a real app, this would wait for a signaling event.
  // For demo, we can either leave it ringing or connect manually.
  // I'll leave it as connects manually or just disable the simulated speaking.
  
  // Let's make it stay in ringing state for now, or connect but remain silent.
  // The user wants "no bots", so auto-pickup is a bot behavior.
  /*
  useEffect(() => {
    const t = setTimeout(() => setStatus('connected'), 2000);
    return () => clearTimeout(t);
  }, []);
  */

  // Timer
  useEffect(() => {
    if (status !== 'connected') return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Partner activity simulator removed.
  useEffect(() => {
    if (status !== 'connected') return;
    setPartnerSpeaking(false);
    setMeSpeaking(false);
  }, [status]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="vcall-overlay">
      <div className="vcall-card">
        {/* Header */}
        <div className="vcall-header">
          🔒 Shaxsiy ovozli qo'ng'iroq
        </div>

        {/* Avatars */}
        <div className="vcall-avatars">
          {/* Partner */}
          <div className={`vcall-person ${partnerSpeaking && status === 'connected' ? 'speaking' : ''}`}>
            <div className="vcall-ring">
              {partnerSpeaking && status === 'connected' && <div className="vcall-wave" />}
              <img src={partner.avatar} alt={partner.name} />
            </div>
            <div className="vcall-person-name">{partner.name}</div>
            <div className="vcall-person-status">
              {status === 'ringing' ? '📞 Qo\'ng\'iroq qilinmoqda...' : partnerSpeaking ? '🎙️ Gapirmoqda' : '🔇 Jim'}
            </div>
          </div>

          {/* Divider */}
          <div className="vcall-divider">
            <div className="vcall-divider-line" />
            <div className="vcall-signal">
              {status === 'ringing' ? '📡' : '🔗'}
            </div>
            <div className="vcall-divider-line" />
          </div>

          {/* Me */}
          <div className={`vcall-person ${meSpeaking && !muted ? 'speaking' : ''}`}>
            <div className="vcall-ring">
              {meSpeaking && !muted && <div className="vcall-wave" />}
              <img src={me.avatar} alt="Siz" />
              {muted && <div className="vcall-mute-badge">🔇</div>}
            </div>
            <div className="vcall-person-name">Siz</div>
            <div className="vcall-person-status">
              {muted ? '🔇 Mikrofon o\'chiq' : meSpeaking ? '🎙️ Gapirmoqda' : '🎙️ Tayyor'}
            </div>
          </div>
        </div>

        {/* Status / Timer */}
        <div className="vcall-status-bar">
          {status === 'ringing' && (
            <div className="vcall-ringing">
              <span className="typing-dots"><span/><span/><span/></span>
              Ulanmoqda...
            </div>
          )}
          {status === 'connected' && (
            <div className="vcall-timer">🔴 {fmt(duration)}</div>
          )}
        </div>

        {/* Controls */}
        <div className="vcall-controls">
          <button
            className={`vcall-btn ${!muted ? 'vcall-btn--active' : ''}`}
            onClick={() => setMuted(m => !m)}
            title={muted ? 'Mikrofon yoqish' : "O'chirish"}
          >
            {muted ? '🎤' : '🎙️'}
            <span>{muted ? 'Yoqish' : 'Mikrofon'}</span>
          </button>

          <button
            className="vcall-btn vcall-btn--end"
            onClick={onClose}
            title="Qo'ng'iroqni tugatish"
          >
            📵
            <span>Tugatish</span>
          </button>

          <button
            className={`vcall-btn ${!speakerOff ? 'vcall-btn--active' : ''}`}
            onClick={() => setSpeakerOff(s => !s)}
            title={speakerOff ? 'Dinamik yoqish' : 'O\'chirish'}
          >
            {speakerOff ? '🔕' : '🔊'}
            <span>{speakerOff ? 'Yoqish' : 'Dinamik'}</span>
          </button>
        </div>

        {/* Encryption badge */}
        <div className="vcall-enc">
          🔒 Shaxsiy va shifrlangan kanal
        </div>
      </div>

      <style>{`
        .vcall-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.25s ease;
        }
        .vcall-card {
          width: 100%;
          max-width: 480px;
          background: var(--bg-sidebar);
          border: 1px solid var(--border-input);
          border-radius: var(--r-xl);
          padding: 24px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow);
          animation: modalSlideIn 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        .vcall-header {
          text-align: center;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .vcall-avatars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .vcall-person {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .vcall-ring {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .vcall-ring img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid var(--border-input);
          object-fit: cover;
          transition: border-color var(--t);
        }
        .vcall-person.speaking .vcall-ring img { border-color: var(--online); }
        .vcall-wave {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid var(--online);
          animation: voicePulse 1.4s ease-out infinite;
        }
        .vcall-mute-badge {
          position: absolute;
          bottom: 0; right: 0;
          width: 22px; height: 22px;
          background: var(--danger);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
          border: 2px solid var(--bg-sidebar);
        }
        .vcall-person-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .vcall-person-status {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .vcall-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .vcall-divider-line {
          width: 1px;
          height: 24px;
          background: var(--border-input);
        }
        .vcall-signal { font-size: 1.2rem; }
        .vcall-status-bar {
          display: flex;
          justify-content: center;
          min-height: 28px;
          align-items: center;
        }
        .vcall-ringing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .vcall-timer {
          font-size: 1rem;
          font-weight: 700;
          color: var(--online);
          font-variant-numeric: tabular-nums;
        }
        .vcall-controls {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .vcall-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 20px;
          border-radius: var(--r-lg);
          font-size: 1.4rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: all var(--t);
          min-width: 80px;
          cursor: pointer;
        }
        .vcall-btn span { font-size: 0.68rem; font-weight: 600; }
        .vcall-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
        .vcall-btn--active { background: var(--brand-alpha); border-color: var(--brand); color: var(--brand); }
        .vcall-btn--end { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.4); color: var(--danger); }
        .vcall-btn--end:hover { background: var(--danger); color: #fff; }
        .vcall-enc {
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
      `}</style>
    </div>
  );
}
