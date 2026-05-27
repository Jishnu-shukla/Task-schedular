import React, { useState, useEffect, useRef } from 'react';
 
const BACKEND_URL = 'https://task-schedular-qnt6.onrender.com/api/messages';
 
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      min-height: 100vh;
      background: #0a0b0f;
      color: #c8cad4;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    input[type="text"], select {
      background: #111318;
      border: 0.5px solid rgba(255,255,255,0.08);
      color: #c8cad4;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      padding: 10px 14px;
      border-radius: 8px;
      width: 100%;
      outline: none;
      transition: border-color 0.15s;
    }
    input[type="text"]:focus, select:focus {
      border-color: rgba(255,255,255,0.18);
    }
    input[type="text"]::placeholder { color: #2e3040; }
    select { cursor: pointer; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);
 
const FieldLabel = ({ children }) => (
  <p style={{ fontSize: 10, color: '#2e3040', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>
    {children}
  </p>
);
 
export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('WebUser_' + Math.floor(Math.random() * 100));
  const [room, setRoom] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
 
  const fetchMessages = async () => {
    if (!room) return;
    try {
      const res = await fetch(`${BACKEND_URL}?room=${room.trim().toLowerCase()}`);
      const data = await res.json();
      setMessages(data);
    } catch { /* silent */ }
  };
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 2000);
    return () => clearInterval(id);
  }, [room]);
 
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          originalText: text,
          targetLanguage,
          room: room.trim().toLowerCase(),
        }),
      });
      if (res.ok) { setText(''); fetchMessages(); }
    } catch {
      alert('Could not reach chat server.');
    } finally {
      setLoading(false);
    }
  };
 
  const handleCreateRoom = () => {
    const uniqueId = 'room-' + Math.random().toString(16).substring(2, 6);
    setRoom(uniqueId);
  };
 
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return alert('Please enter a Room ID.');
    setRoom(inputRoomId.trim().toLowerCase());
  };
 
  /* ── PORTAL ─────────────────────────────────────────────── */
  if (!room) {
    return (
      <>
        <GlobalStyle />
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '100vh', padding: 24,
        }}>
          <div style={{
            background: '#0d0f14',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            padding: 32,
            width: '100%', maxWidth: 380,
          }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#e8eaf2', letterSpacing: '-0.02em' }}>
                BabelChat
              </h1>
              <p style={{ fontSize: 12, color: '#2e3040', marginTop: 4 }}>
                Real-time translation across rooms
              </p>
            </div>
 
            {/* Divider */}
            <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.05)', marginBottom: 24 }} />
 
            {/* Username */}
            <FieldLabel>DISPLAY NAME</FieldLabel>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your name"
              style={{ marginBottom: 20 }}
            />
 
            {/* Create */}
            <button
              onClick={handleCreateRoom}
              style={{
                background: '#e8eaf2', color: '#0a0b0f', border: 'none',
                padding: '11px 0', borderRadius: 8, width: '100%',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              Create new room
            </button>
 
            {/* OR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
              <span style={{ fontSize: 10, color: '#222530', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
            </div>
 
            {/* Join */}
            <FieldLabel>JOIN EXISTING ROOM</FieldLabel>
            <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. room-4a8f"
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                style={{
                  background: '#131927',
                  border: '0.5px solid rgba(56,189,248,0.18)',
                  color: '#38bdf8', borderRadius: 8,
                  padding: '0 16px', fontWeight: 600,
                  fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
 
  /* ── CHAT ────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyle />
      <div style={{
        maxWidth: 600, margin: '0 auto', padding: '24px 20px',
        display: 'flex', flexDirection: 'column', height: '100vh',
      }}>
 
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16,
          background: '#0d0f14',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '12px 16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#38bdf8', letterSpacing: '-0.01em' }}>
                {room}
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#2e3040', marginTop: 2 }}>{username}</p>
          </div>
          <button
            onClick={() => { setRoom(''); setMessages([]); setInputRoomId(''); }}
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '0.5px solid rgba(239,68,68,0.15)',
              borderRadius: 7, padding: '6px 12px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Exit room
          </button>
        </div>
 
        {/* Language selector */}
        <div style={{
          background: '#0d0f14',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '10px 12px',
          marginBottom: 14,
        }}>
          <FieldLabel>TRANSLATE MY MESSAGES INTO</FieldLabel>
          <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
            <option value="es">Spanish</option>
            <option value="gu">Gujarati</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="it">Italian</option>
            <option value="zh-cn">Chinese (Simplified)</option>
            <option value="ar">Arabic</option>
            <option value="ko">Korean</option>
            <option value="ru">Russian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
 
        {/* Messages */}
        <div style={{
          flex: 1,
          background: '#0d0f14',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '16px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 10,
          marginBottom: 14,
        }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#1e2230' }}>Room is empty</p>
              <p style={{ fontSize: 11, color: '#181c28', marginTop: 4 }}>
                Share the room ID <span style={{ color: '#38bdf8' }}>{room}</span> to invite others
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.username === username;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  animation: 'slideUp 0.18s ease both',
                }}>
                  <p style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                    color: isMe ? '#2a3040' : '#1e2530',
                    marginBottom: 4,
                    textAlign: isMe ? 'right' : 'left',
                  }}>
                    {isMe ? 'YOU' : msg.username}
                  </p>
                  <div style={{
                    background: isMe ? '#131927' : '#111318',
                    border: `0.5px solid ${isMe ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 12,
                    borderTopRightRadius: isMe ? 3 : 12,
                    borderTopLeftRadius: isMe ? 12 : 3,
                    padding: '10px 14px',
                  }}>
                    <p style={{ fontSize: 15, color: '#e0e2ec', lineHeight: 1.5 }}>
                      {msg.translatedText}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
 
        {/* Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message ${room}...`}
            autoComplete="off"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#1a1d24' : '#e8eaf2',
              color: loading ? '#2e3040' : '#0a0b0f',
              border: 'none', borderRadius: 8,
              padding: '0 20px', fontSize: 13,
              fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '···' : 'Send'}
          </button>
        </form>
 
      </div>
    </>
  );
}