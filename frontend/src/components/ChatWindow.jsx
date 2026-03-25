import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, formatLastSeen } from '../context/AuthContext';
import { USERS, getGlobalMessages, getDmMessages, GLOBAL_BOT_REPLIES, DM_BOT_REPLIES, formatTime, formatDate } from '../data/chatData';
import EmojiPicker from './EmojiPicker';
import PrivateVoiceCall from './PrivateVoiceCall';
import OtherUserProfileModal from './OtherUserProfileModal';

function getUserById(id, currentUser, allUsers) {
  if (id === 'me' || id === currentUser?.id) return currentUser;
  return allUsers.find(u => u.id === id) || currentUser;
}

function MessageRow({ msg, prevMsg, currentUser, allUsers, onAvatarClick }) {
  const [lightbox, setLightbox] = useState(null);
  const user = getUserById(msg.userId, currentUser, allUsers);
  const isSelf = msg.userId === 'me' || msg.userId === currentUser?.id;
  const continued = prevMsg &&
    prevMsg.userId === msg.userId &&
    (msg.time - prevMsg.time) < 2 * 60 * 1000;

  return (
    <>
      {(!prevMsg || formatDate(prevMsg.time) !== formatDate(msg.time)) && (
        <div className="date-divider">
          <span className="date-divider-label">{formatDate(msg.time)}</span>
        </div>
      )}
      <div className={`msg-row ${isSelf ? 'self' : ''}`}>
        <img
          src={user?.avatar}
          alt={user?.name}
          className={`msg-avatar-sm ${continued ? 'hidden' : ''}`}
          onClick={() => !isSelf && onAvatarClick(user)}
          style={{ cursor: isSelf ? 'default' : 'pointer' }}
        />
        <div className="msg-body">
          {!continued && (
            <div className="msg-meta">
              {!isSelf && <span className="msg-sender" style={{ color: user?.color }}>{user?.name}</span>}
              <span>{formatTime(msg.time)}</span>
            </div>
          )}
          {msg.text && (
            <div className={`msg-bubble ${continued ? (isSelf ? 'continued self-bubble' : 'continued') : ''}`}>
              {msg.text}
            </div>
          )}
          {msg.media && msg.media.map((m, i) => (
            <div key={i} className="msg-bubble msg-media" onClick={() => setLightbox(m)} style={{ cursor: 'zoom-in' }}>
              {m.type === 'image'
                ? <img src={m.url} alt="media" />
                : <video src={m.url} controls onClick={e => e.stopPropagation()} />
              }
            </div>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close">✕</button>
          {lightbox.type === 'image'
            ? <img src={lightbox.url} alt="full" onClick={e => e.stopPropagation()} />
            : <video src={lightbox.url} controls autoPlay onClick={e => e.stopPropagation()} />
          }
        </div>
      )}
    </>
  );
}

export default function ChatWindow({ isGlobal, partner, goToDm }) {
  const { user: currentUser, getAllUsers } = useAuth();
  const allUsers = getAllUsers();
  const [messages,     setMessages]     = useState(() => isGlobal ? getGlobalMessages() : getDmMessages(partner?.id));
  const [input,        setInput]        = useState('');
  const [pendingMedia, setPendingMedia] = useState([]);
  const [isTyping,     setIsTyping]     = useState(false);
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [inCall,       setInCall]       = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  const [msgSearchQuery, setMsgSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMessages(isGlobal ? getGlobalMessages() : getDmMessages(partner?.id));
    setInput('');
    setPendingMedia([]);
    setShowEmoji(false);
    setInCall(false);
    setShowSearchBar(false);
    setMsgSearchQuery('');
  }, [isGlobal, partner?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && pendingMedia.length === 0) return;
    const newMsg = {
      id: Date.now(),
      userId: 'me',
      text: text || null,
      time: Date.now(),
      media: pendingMedia.length > 0 ? [...pendingMedia] : null,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setPendingMedia([]);
    setShowEmoji(false);
    inputRef.current?.focus();
  }, [input, pendingMedia, isGlobal, partner]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const items = files.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' }));
    setPendingMedia(prev => [...prev, ...items]);
    e.target.value = '';
  };

  const removeMedia = i => setPendingMedia(prev => prev.filter((_, idx) => idx !== i));
  const canSend = input.trim().length > 0 || pendingMedia.length > 0;
  const typingUser = isGlobal ? 'Kimdir' : partner?.name;

  return (
    <>
      {selectedProfile && (
        <OtherUserProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onMessage={() => {
            setSelectedProfile(null);
            goToDm?.(selectedProfile);
          }}
        />
      )}

      {/* Active private voice call overlay */}
      {inCall && !isGlobal && (
        <PrivateVoiceCall partner={partner} me={currentUser} onClose={() => setInCall(false)} />
      )}

      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">
          {isGlobal
            ? <><span style={{ fontSize: '1.1rem' }}>🌐</span> Global Chat</>
            : <>
                <img src={partner?.avatar} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" />
                {partner?.name}
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: partner?.status === 'online' ? 'var(--online)' : 'var(--offline)',
                  display: 'inline-block', marginLeft: 2,
                }} />
              </>
          }
          <span className="topbar-sub">
            {isGlobal
              ? 'Hammaga ochiq suhbat'
              : (
                <span className="topbar-status-text">
                  {partner?.status === 'offline' && partner?.lastSeen
                    ? formatLastSeen(partner.lastSeen)
                    : partner?.statusText}
                </span>
              )
            }
          </span>
        </div>
        <div className="topbar-right">
          {!isGlobal && (
            <button
              className={`icon-btn ${inCall ? 'active' : ''}`}
              onClick={() => setInCall(true)}
              title="Ovozli qo'ng'iroq"
            >
              📞
            </button>
          )}
          {showSearchBar && (
            <input 
              autoFocus
              className="search-input" 
              style={{ width: 180, padding: '4px 12px', marginRight: 6, fontSize: '0.8rem' }} 
              placeholder="Xabarlardan qidirish..." 
              value={msgSearchQuery}
              onChange={e => setMsgSearchQuery(e.target.value)}
            />
          )}
          <button 
            className={`icon-btn ${showSearchBar ? 'active' : ''}`} 
            onClick={() => {
              setShowSearchBar(s => !s);
              if (showSearchBar) setMsgSearchQuery('');
            }} 
            title="Xabarlarni qidirish"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-area">
        <div className="chat-welcome">
          <div className="chat-welcome-icon">{isGlobal ? '🌐' : '👋'}</div>
          <div className="chat-welcome-title">
            {isGlobal ? 'Global suhbatga xush kelibsiz!' : `${partner?.name} bilan suhbat`}
          </div>
          <div className="chat-welcome-desc">
            {isGlobal
              ? 'Bu yerda hamma bilan muloqot qiling. Rasm, video va emoji yuboring.'
              : `Bu ${partner?.name} bilan shaxsiy va shifrlangan suhbatningiz. 🔒`
            }
          </div>
          <div className="chat-welcome-divider" />
        </div>

        {messages
          .filter(msg => !msgSearchQuery || (msg.text && msg.text.toLowerCase().includes(msgSearchQuery.toLowerCase())))
          .map((msg, i, arr) => (
          <MessageRow 
            key={msg.id} 
            msg={msg} 
            prevMsg={arr[i-1]||null} 
            currentUser={currentUser} 
            allUsers={allUsers}
            onAvatarClick={(u) => setSelectedProfile(u)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing */}
      <div className="typing-indicator">
        {isTyping && (
          <><span className="typing-dots"><span/><span/><span/></span><span>{typingUser} yozmoqda...</span></>
        )}
      </div>

      {/* Input */}
      <div className="input-area" style={{ position: 'relative' }}>
        {/* Emoji picker */}
        {showEmoji && (
          <EmojiPicker
            onSelect={e => { setInput(v => v + e); inputRef.current?.focus(); }}
            onClose={() => setShowEmoji(false)}
          />
        )}
        <div className="input-box">
          {pendingMedia.length > 0 && (
            <div className="media-preview-strip">
              {pendingMedia.map((m, i) => (
                <div key={i} className="media-preview-item">
                  {m.type === 'image' ? <img src={m.url} alt="" /> : <video src={m.url} />}
                  <div className="media-preview-remove" onClick={() => removeMedia(i)}>✕</div>
                </div>
              ))}
            </div>
          )}
          <div className="input-row">
            <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Fayl biriktirish">📎</button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display:'none' }} onChange={handleFileChange} />
            <textarea
              ref={inputRef}
              className="input-field-text"
              placeholder={isGlobal ? 'Global chatga xabar yozing...' : `${partner?.name} ga xabar yozing...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className={`emoji-btn ${showEmoji ? 'active' : ''}`}
              onClick={() => setShowEmoji(s => !s)}
              title="Emoji"
              style={{ color: showEmoji ? 'var(--brand)' : undefined }}
            >😊</button>
            <button className={`send-btn ${canSend ? 'ready' : ''}`} onClick={handleSend} disabled={!canSend}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
}
