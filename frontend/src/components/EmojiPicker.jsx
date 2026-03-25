import { useState, useRef, useEffect } from 'react';

const EMOJI_GROUPS = {
  '😊 Emotsiyalar': ['😀','😁','😂','🤣','😃','😄','😅','😆','😇','😉','😊','🙂','🙃','😋','😌','😍','🥰','😘','😗','😙','😚','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','🤤','😷','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  '👋 Qo\'llar':    ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','👁','👀'],
  '❤️ Belgilar':   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','✡️','🔯','🕎','☸️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘'],
  '🎉 Ehtiros':    ['🎉','🎊','🎈','🎁','🎀','🎗','🎟','🎫','🎖','🏆','🥇','🥈','🥉','🏅','🎗','🏵','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎷','🎸','🎹','🎺','🎻','🥁','🎮','🎲','🔮','🧸','🪅','🎯','👾','🕹'],
  '🔥 Mashhur':    ['🔥','💯','✨','⭐','🌟','💫','⚡','🌈','🎯','🚀','🌙','☀️','❄️','💎','🏆','👑','🎭','🤝','💪','🙌','👏','🔑','🚩','♾️','🆕','🆙','🈵'],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [tab, setTab]     = useState(Object.keys(EMOJI_GROUPS)[0]);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const emojis = search.trim()
    ? Object.values(EMOJI_GROUPS).flat().filter(e => {
        const q = search.toLowerCase();
        return (e.toLowerCase().includes(q));
      })
    : EMOJI_GROUPS[tab] || [];

  return (
    <div className="emoji-picker" ref={ref}>
      <div className="emoji-picker__search">
        <input
          className="emoji-picker__search-input"
          placeholder="Emoji qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      {!search && (
        <div className="emoji-picker__tabs">
          {Object.keys(EMOJI_GROUPS).map(g => (
            <button
              key={g}
              className={`emoji-picker__tab ${tab === g ? 'active' : ''}`}
              onClick={() => setTab(g)}
              title={g}
            >
              {g.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
      <div className="emoji-picker__grid">
        {emojis.map((e, i) => (
          <button
            key={i}
            className="emoji-picker__item"
            onClick={() => onSelect(e)}
          >
            {e}
          </button>
        ))}
      </div>

      <style>{`
        .emoji-picker {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 8px;
          width: 320px;
          background: var(--bg-sidebar);
          border: 1px solid var(--border-input);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow);
          overflow: hidden;
          z-index: 50;
          animation: epIn 0.18s ease;
        }
        @keyframes epIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .emoji-picker__search { padding: 10px; border-bottom: 1px solid var(--border); }
        .emoji-picker__search-input {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          outline: none;
          font-size: 0.85rem;
          color: var(--text-primary);
          transition: border-color var(--t);
        }
        .emoji-picker__search-input:focus { border-color: var(--brand); }
        .emoji-picker__search-input::placeholder { color: var(--text-muted); }
        .emoji-picker__tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 4px 8px;
          gap: 2px;
        }
        .emoji-picker__tab {
          flex: 1;
          padding: 6px 4px;
          font-size: 1.1rem;
          border-radius: var(--r-xs);
          transition: background var(--t);
          color: var(--text-muted);
        }
        .emoji-picker__tab:hover { background: var(--bg-hover); color: var(--text-primary); }
        .emoji-picker__tab.active { background: var(--bg-active); color: var(--brand); }
        .emoji-picker__grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          padding: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        .emoji-picker__item {
          font-size: 1.3rem;
          padding: 5px;
          border-radius: var(--r-xs);
          transition: background var(--t), transform var(--t);
          line-height: 1;
        }
        .emoji-picker__item:hover { background: var(--bg-hover); transform: scale(1.2); }
      `}</style>
    </div>
  );
}
