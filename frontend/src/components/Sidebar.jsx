import { useState, useMemo, useRef, useEffect } from 'react';
import { UNREAD_DM } from '../data/chatData';
import { useAuth, formatLastSeen } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import OtherUserProfileModal from './OtherUserProfileModal';

export default function Sidebar({ view, setView, activeDm, setActiveDm, theme, toggleTheme }) {
  const { user, logout, getAllUsers } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allUsers = getAllUsers();

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allUsers.filter(u => u.id !== user.id && (
      u.name.toLowerCase().includes(q) || 
      u.tag.toLowerCase().includes(q)
    ));
  }, [searchQuery, allUsers, user.id]);

  // Friend lists
  const friends = useMemo(() => {
    return allUsers.filter(u => user.friends?.includes(u.id));
  }, [user.friends, allUsers]);

  const friendRequests = useMemo(() => {
    return allUsers.filter(u => user.friendRequests?.includes(u.id));
  }, [user.friendRequests, allUsers]);

  const dmList = friends; // Only show friends in DM list

  return (
    <>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {selectedProfile && (
        <OtherUserProfileModal 
          profile={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          onMessage={() => {
            setSelectedProfile(null);
            setView('dm');
            setActiveDm(selectedProfile);
            setSearchQuery('');
          }}
        />
      )}

      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💬</div>
            <span>ChapChat</span>
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search" style={{ position: 'relative' }} ref={searchRef}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input 
              className="search-input" 
              placeholder="Foydalanuvchi qidirish..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Search Dropdown */}
          {searchQuery && (
            <div className="search-dropdown">
              {searchResults.length > 0 ? (
                searchResults.map(u => (
                  <div key={u.id} className="search-dropdown-item" onClick={() => setSelectedProfile(u)}>
                    <img src={u.avatar} alt="" />
                    <div className="search-dropdown-info">
                      <div className="name">{u.name}</div>
                      <div className="tag">{u.tag}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-dropdown-empty">Hech kim topilmadi</div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="sidebar-section sidebar-nav-list">
          <div className="sidebar-section-label">Kanallar</div>
          <div className={`nav-item ${view === 'global' ? 'active' : ''}`} onClick={() => setView(view === 'global' ? null : 'global')}>
            <span className="nav-item-icon">🌐</span>
            Global Chat
          </div>
        </div>

        {/* Requests section */}
        {friendRequests.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label" style={{ color: 'var(--brand)' }}>
              Do'stlik so'rovlari
              <span style={{ 
                background: 'var(--danger)', color: '#fff', padding: '2px 6px', 
                borderRadius: '10px', fontSize: '10px', marginLeft: 'auto' 
              }}>
                {friendRequests.length}
              </span>
            </div>
            {friendRequests.map(u => (
              <div key={u.id} className="user-item" onClick={() => setSelectedProfile(u)}>
                <div className="user-avatar-wrap">
                  <img src={u.avatar} alt={u.name} className="user-avatar" />
                  <span className={`status-dot ${u.status}`} />
                </div>
                <div className="user-info">
                  <div className="user-name">{u.name}</div>
                  <div className="user-status-text" style={{ color: 'var(--text-secondary)' }}>Tasdiqlashni kutmoqda</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DM section */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">
            Do'stlar (Shaxsiy Chat)
            <button title="Do'st qidirish" onClick={() => {
              const input = document.querySelector('.search-input');
              if(input) input.focus();
            }}>＋</button>
          </div>
        </div>

        <div className="sidebar-users">
          {dmList.length === 0 ? (
            <div style={{ padding: '10px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Hozircha do'stlaringiz yo'q. Qidiruv orqali toping!
            </div>
          ) : (
            dmList.map(u => (
              <div
                key={u.id}
                className={`user-item ${view === 'dm' && activeDm?.id === u.id ? 'active' : ''}`}
                onClick={() => { 
                  if (view === 'dm' && activeDm?.id === u.id) {
                    setActiveDm(null);
                    setView(null);
                  } else {
                    setView('dm'); 
                    setActiveDm(u); 
                  }
                }}
              >
                <div className="user-avatar-wrap" onClick={e => { e.stopPropagation(); setSelectedProfile(u); }}>
                  <img src={u.avatar} alt={u.name} className="user-avatar" />
                  <span className={`status-dot ${u.status}`} />
                </div>
                <div className="user-details">
                  <div className="user-name">{u.name}</div>
                  <div className="user-status-text">
                    {u.status === 'offline' && u.lastSeen ? formatLastSeen(u.lastSeen) : u.statusText}
                  </div>
                </div>
                {UNREAD_DM[u.id] && <span className="user-unread">{UNREAD_DM[u.id]}</span>}
              </div>
            ))
          )}
        </div>

        {/* Profile bar */}
        <div className="my-profile">
          <div
            className="user-avatar-wrap"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfile(true)}
            title="Profilni tahrirlash"
          >
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            <span className={`status-dot ${user?.status || 'online'}`} />
          </div>
          <div className="my-profile-info" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
            <div className="my-profile-name">{user?.name}</div>
            <div className="my-profile-tag">{user?.tag}</div>
          </div>
          <div className="my-profile-actions">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn" onClick={() => setShowProfile(true)} title="Profil">👤</button>
            <button className="icon-btn" onClick={logout} title="Chiqish">🚪</button>
          </div>
        </div>

        <style>{`
          .search-dropdown {
            position: absolute;
            top: 100%;
            left: 16px;
            right: 16px;
            margin-top: 4px;
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            box-shadow: var(--shadow);
            z-index: 100;
            max-height: 250px;
            overflow-y: auto;
          }
          .search-dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            cursor: pointer;
            transition: background var(--t);
          }
          .search-dropdown-item:hover { background: var(--bg-hover); }
          .search-dropdown-item img {
            width: 32px; height: 32px;
            border-radius: 50%;
            object-fit: cover;
          }
          .search-dropdown-info .name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
          .search-dropdown-info .tag { font-size: 0.75rem; color: var(--text-muted); }
          .search-dropdown-empty {
            padding: 14px;
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-muted);
          }
        `}</style>
      </aside>
    </>
  );
}
