import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function ChatApp() {
  const { user } = useAuth();
  const [theme,    setTheme]    = useState('dark');
  const [view,     setView]     = useState('global');
  const [activeDm, setActiveDm] = useState(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const goToDm = (targetUser) => {
    setView('dm');
    setActiveDm(targetUser);
  };

  if (!user) return <AuthPage />;

  return (
    <div className="app">
      <Sidebar
        view={view}
        setView={setView}
        activeDm={activeDm}
        setActiveDm={setActiveDm}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="main">
        {view === 'global' && <ChatWindow key="global" isGlobal={true} partner={null} goToDm={goToDm} />}
        {view === 'dm' && activeDm && <ChatWindow key={activeDm.id} isGlobal={false} partner={activeDm} goToDm={goToDm} />}
        {(!view || (view === 'dm' && !activeDm)) && (
          <div className="empty-dm" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div className="empty-dm-icon" style={{ fontSize: '4rem', marginBottom: 20 }}>💬</div>
            <div className="empty-dm-text" style={{ fontSize: '1rem', fontWeight: 600 }}>Suhbat uchun chap paneldan chat tanlang</div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}
