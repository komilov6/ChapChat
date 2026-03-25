import { useState } from 'react';
import { useAuth, formatLastSeen } from '../context/AuthContext';

export default function OtherUserProfileModal({ profile, onClose, onMessage }) {
  const { user, sendFriendRequest, acceptFriendRequest, removeFriend } = useAuth();
  
  if (!profile || !user) return null;

  const isSelf = profile.id === user.id;
  const isFriend = user.friends?.includes(profile.id);
  const isSent = user.sentRequests?.includes(profile.id);
  const isReceived = user.friendRequests?.includes(profile.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Foydalanuvchi Profili</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="profile-avatar-preview" style={{ marginBottom: 10 }}>
            <img src={profile.avatar} alt="avatar" style={{ width: 100, height: 100 }} />
          </div>
          
          <h2 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--text-primary)' }}>
            {profile.name}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {profile.tag}
          </div>

          <div style={{ marginTop: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)', padding: '6px 14px',
              borderRadius: 'var(--r-full)', fontSize: '0.85rem', color: 'var(--text-secondary)'
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: profile.status === 'online' ? 'var(--online)' : profile.status === 'idle' ? 'var(--idle)' : 'var(--offline)'
              }} />
              {profile.statusText}
            </span>
          </div>

          {profile.bio && (
            <div style={{
              marginTop: 20, padding: 16, background: 'var(--bg-input)',
              borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--text-primary)',
              width: '100%', textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>O'zi haqida</div>
              {profile.bio}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          {isSelf ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bu sizning o'z profilingiz.</div>
          ) : (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {!isFriend && !isSent && !isReceived && (
                <button className="modal-save" style={{ flex: 1 }} onClick={() => sendFriendRequest(profile.id)}>
                  ➕ Do'stlik so'rovi yuborish
                </button>
              )}
              {isSent && (
                <button className="modal-cancel" style={{ flex: 1 }} disabled>
                  ⏳ So'rov yuborilgan
                </button>
              )}
              {isReceived && (
                <button className="modal-save" style={{ flex: 1, background: 'var(--online)' }} onClick={() => acceptFriendRequest(profile.id)}>
                  ✅ So'rovni qabul qilish
                </button>
              )}
              {isFriend && (
                <>
                  <button className="modal-save" style={{ flex: 1 }} onClick={() => { onClose(); onMessage(); }}>
                    💬 Xabar yozish
                  </button>
                  <button className="modal-cancel" style={{ flex: 1, color: 'var(--danger)' }} onClick={() => removeFriend(profile.id)}>
                    ❌ Do'stlikni bekor qilish
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
