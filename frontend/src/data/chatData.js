// ============ USERS ============
export const USERS = [
  { id: 'u1', name: 'Jahongir', tag: '#7291', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jahongir', status: 'online',  statusText: 'Online',            color: '#5b8cf7' },
  { id: 'u2', name: 'Malika',    tag: '#3842', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Malika',    status: 'online',  statusText: 'Online',            color: '#a855f7' },
  { id: 'u3', name: 'Jasur',     tag: '#1109', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasur',     status: 'online',  statusText: 'Online',            color: '#22c55e' },
  { id: 'u4', name: 'Nilufar',   tag: '#5567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nilufar',   status: 'idle',    statusText: 'Idle',              color: '#f59e0b' },
  { id: 'u5', name: 'Sherzod',   tag: '#9004', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sherzod',   status: 'online',  statusText: 'Online',            color: '#ef4444' },
  { id: 'u6', name: 'Dilorom',   tag: '#2231', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dilorom',   status: 'offline', statusText: 'Kecha faol bo\'ldi', color: '#06b6d4' },
  { id: 'u7', name: 'Bobur',     tag: '#6610', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bobur',     status: 'online',  statusText: 'Online',            color: '#ec4899' },
  { id: 'u8', name: 'Kamola',    tag: '#8812', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamola',    status: 'idle',    statusText: 'Idle',              color: '#84cc16' },
];

// "Me" — the logged-in user
export const ME = {
  id: 'me', name: 'Siz', tag: '#2025',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
  status: 'online', statusText: 'Online', color: '#5b8cf7',
};

// ============ INITIAL GLOBAL MESSAGES ============
export function getGlobalMessages() {
  return [];
}

// ============ INITIAL DM MESSAGES ============
export function getDmMessages(userId) {
  return [];
}

// ============ BOT REPLIES FOR GLOBAL ============
export const GLOBAL_BOT_REPLIES = [
  { userId: 'u1', text: 'Ha, to\'g\'ri! 😄' },
  { userId: 'u2', text: 'Qiziq fikr! Men ham shunday o\'ylagan edim.' },
  { userId: 'u3', text: 'Ha, siz ham shunday deb o\'ylaysizmi? 🤔' },
  { userId: 'u5', text: '😂😂 To\'g\'ri aytdingiz!' },
  { userId: 'u7', text: 'Bu juda foydali ma\'lumot, rahmat! 🙏' },
  { userId: 'u4', text: 'Qo\'shilaman! 👍' },
  { userId: 'u8', text: 'Haha, men ham o\'ylardim xuddi shunday 😄' },
];

// ============ BOT REPLIES FOR DM ============
export const DM_BOT_REPLIES = [
  'Ha ha, to\'g\'ri! 😄',
  'Tushundim 👍',
  'Qiziqarli, ayting-chi ko\'proq?',
  'Rosti ham shundaymi? 😮',
  '😂 Juda yaxshi aytdingiz!',
  'Mayli, keyin gaplashamiz 🙂',
  'Yaxshi fikr!',
  'Ha, bilaman, men ham shunday deb o\'ylardim.',
];

// ============ VOICE ROOM USERS ============
export const VOICE_USERS = [
  { ...USERS[0], muted: false, speaking: true  },
  { ...USERS[2], muted: false, speaking: false },
  { ...USERS[4], muted: true,  speaking: false },
  { ...USERS[6], muted: false, speaking: true  },
];

// ============ UNREAD COUNTS ============
export const UNREAD_DM = { u1: 2, u3: 1 };

// ============ FORMAT TIME ============
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Bugun';
  if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
  return d.toLocaleDateString('uz-UZ');
}
