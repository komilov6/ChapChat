import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { USERS } from '../data/chatData';

// Format last seen helper
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Yaqinda onlayn edi';
  const diff = Date.now() - lastSeen;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kecha';
  return `${days} kun oldin`;
}

const AuthContext = createContext(null);

// Default demo accounts seeded in localStorage
const DEMO_ACCOUNTS = USERS.map(u => ({
  id: u.id,
  username: u.name.toLowerCase(),
  password: '12345',
  profile: { 
    ...u, 
    friends: [], friendRequests: [], sentRequests: [],
    lastSeen: u.status === 'offline' ? Date.now() - Math.floor(Math.random() * 86400000 * 3) : null
  },
}));

function getAccounts() {
  const stored = localStorage.getItem('cc_accounts');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migration for old accounts to ensure new fields
    return parsed.map(a => ({
      ...a,
      profile: {
        friends: [], friendRequests: [], sentRequests: [],
        ...a.profile
      }
    }));
  }
  localStorage.setItem('cc_accounts', JSON.stringify(DEMO_ACCOUNTS));
  return DEMO_ACCOUNTS;
}
function saveAccounts(accounts) {
  localStorage.setItem('cc_accounts', JSON.stringify(accounts));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cc_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('cc_current_user', JSON.stringify(user));
    else localStorage.removeItem('cc_current_user');
  }, [user]);

  const login = (username, password) => {
    const accounts = getAccounts();
    const account = accounts.find(
      a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    );
    if (!account) throw new Error('Foydalanuvchi nomi yoki parol noto\'g\'ri');
    
    // Set to online when logging in
    account.profile.status = 'online';
    account.profile.statusText = 'Online';
    account.profile.lastSeen = null;
    saveAccounts(accounts);

    setUser({ ...account.profile, username: account.username, password: account.password });
    return account;
  };

  const register = (username, displayName, password) => {
    const accounts = getAccounts();
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Bu foydalanuvchi nomi allaqachon band');
    }
    const seed = username + Date.now();
    const newUser = {
      id: 'u_' + Date.now(),
      name: displayName,
      tag: '#' + Math.floor(1000 + Math.random() * 9000),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      status: 'online',
      statusText: 'Online',
      color: '#5b8cf7',
      friends: [], friendRequests: [], sentRequests: [],
    };
    const newAccount = { id: newUser.id, username, password, profile: newUser };
    saveAccounts([...accounts, newAccount]);
    setUser({ ...newUser, username, password });
    return newAccount;
  };

  const logout = () => {
    if (user) {
      const accounts = getAccounts();
      const userIndex = accounts.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        accounts[userIndex].profile.status = 'offline';
        accounts[userIndex].profile.statusText = 'Offline';
        accounts[userIndex].profile.lastSeen = Date.now();
        saveAccounts(accounts);
      }
    }
    setUser(null);
  };

  const updateProfile = (updates) => {
    if (!user) return { error: "User not logged in" };

    const accounts = getAccounts();
    const userIndex = accounts.findIndex(u => u.id === user.id);
    if (userIndex === -1) return { error: "Account not found" };

    const currentAccount = accounts[userIndex];
    const updatedAccount = { ...currentAccount };

    // Check if user is changing username and if it's already taken
    if (updates.username && updates.username !== currentAccount.username) {
      if (accounts.some(a => a.username === updates.username && a.id !== currentAccount.id)) {
        return { error: "Kechirasiz, ushbu login allaqachon band qilingan!" };
      }
      updatedAccount.username = updates.username;
    }

    // Update password if provided
    if (updates.password) {
      updatedAccount.password = updates.password;
    }

    // Update profile fields
    updatedAccount.profile = { ...currentAccount.profile, ...updates };

    if (updates.status === 'offline' && currentAccount.profile.status !== 'offline') {
      updatedAccount.profile.lastSeen = Date.now();
    } else if (updates.status && updates.status !== 'offline') {
      updatedAccount.profile.lastSeen = null;
    }

    // Save updated account to accounts list
    accounts[userIndex] = updatedAccount;
    saveAccounts(accounts);

    // Update current user state
    setUser({ ...updatedAccount.profile, username: updatedAccount.username, password: updatedAccount.password });
    
    return { success: true };
  };

  const getAllUsers = () => getAccounts().map(a => a.profile);

  const refetchUser = () => {
    const accounts = getAccounts();
    const acc = accounts.find(a => a.id === user?.id);
    if (acc) setUser({ ...acc.profile, username: acc.username, password: acc.password });
  };

  const sendFriendRequest = (targetId) => {
    const accounts = getAccounts();
    const meIdx = accounts.findIndex(a => a.id === user.id);
    const targetIdx = accounts.findIndex(a => a.id === targetId);
    if (meIdx === -1 || targetIdx === -1) return;

    const me = accounts[meIdx].profile;
    const target = accounts[targetIdx].profile;

    if (!me.sentRequests.includes(targetId)) me.sentRequests.push(targetId);
    if (!target.friendRequests.includes(user.id)) target.friendRequests.push(user.id);

    saveAccounts(accounts);
    setUser({ ...me, username: accounts[meIdx].username, password: accounts[meIdx].password });
  };

  const acceptFriendRequest = (requesterId) => {
    const accounts = getAccounts();
    const meIdx = accounts.findIndex(a => a.id === user.id);
    const reqIdx = accounts.findIndex(a => a.id === requesterId);
    if (meIdx === -1 || reqIdx === -1) return;

    const me = accounts[meIdx].profile;
    const req = accounts[reqIdx].profile;

    me.friendRequests = me.friendRequests.filter(id => id !== requesterId);
    req.sentRequests = req.sentRequests.filter(id => id !== user.id);

    if (!me.friends.includes(requesterId)) me.friends.push(requesterId);
    if (!req.friends.includes(user.id)) req.friends.push(user.id);

    saveAccounts(accounts);
    setUser({ ...me, username: accounts[meIdx].username, password: accounts[meIdx].password });
  };

  const declineFriendRequest = (requesterId) => {
    const accounts = getAccounts();
    const meIdx = accounts.findIndex(a => a.id === user.id);
    const reqIdx = accounts.findIndex(a => a.id === requesterId);
    if (meIdx === -1 || reqIdx === -1) return;

    const me = accounts[meIdx].profile;
    const req = accounts[reqIdx].profile;

    me.friendRequests = me.friendRequests.filter(id => id !== requesterId);
    req.sentRequests = req.sentRequests.filter(id => id !== user.id);

    saveAccounts(accounts);
    setUser({ ...me, username: accounts[meIdx].username, password: accounts[meIdx].password });
  };

  const removeFriend = (friendId) => {
    const accounts = getAccounts();
    const meIdx = accounts.findIndex(a => a.id === user.id);
    const friendIdx = accounts.findIndex(a => a.id === friendId);
    if (meIdx === -1 || friendIdx === -1) return;

    const me = accounts[meIdx].profile;
    const friend = accounts[friendIdx].profile;

    me.friends = me.friends.filter(id => id !== friendId);
    friend.friends = friend.friends.filter(id => id !== user.id);

    saveAccounts(accounts);
    setUser({ ...me, username: accounts[meIdx].username, password: accounts[meIdx].password });
  };

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, updateProfile,
      getAllUsers, refetchUser, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
