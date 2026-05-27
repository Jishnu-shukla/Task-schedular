import React, { useState, useEffect, useRef } from 'react';

// Make sure this points to your live Render backend URL!
const BACKEND_URL = 'https://task-schedular-qnt6.onrender.com/api/messages';

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      min-height: 100vh;
      background: #111318;
      color: #e2e4ea;
      font-family: 'Inter', sans-serif;
    }
    input[type="text"], select {
      background: #1a1d25;
      border: 1px solid #2a2e3a;
      color: #e2e4ea;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      padding: 11px 14px;
      border-radius: 8px;
      width: 100%;
      outline: none;
    }
    select { cursor: pointer; }
    @keyframes chatSlide {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('WebUser_' + Math.floor(Math.random() * 100));
  const [room, setRoom] = useState(''); // Empty initially to show portal view
  const [inputRoomId, setInputRoomId] = useState(''); // Tracks user typing a room code
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es'); 
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Updated to pass the current active room down to the backend query parameter strings
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

  // Sync loop triggers automatically whenever the active room selection updates
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
          room: room.trim().toLowerCase() // Attaches room parameter strings
        }),
      });
      if (res.ok) {
        setText('');
        fetchMessages();
      }
    } catch {
      alert("Could not reach chat server.");
    } finally {
      setLoading(false);
    }
  };

  // Generates a dynamic random room hash identifier key string
  const handleCreateRoom = () => {
    const uniqueId = 'room-' + Math.random().toString(16).substring(2, 6);
    setRoom(uniqueId);
  };

  // Drops player into input field parameter targets
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return alert("Please enter a Room ID!");
    setRoom(inputRoomId.trim().toLowerCase());
  };

  // --- RENDERING BLOCK 1: GATEKEEPER ROOM LOBBY PORTAL CARD ---
  if (!room) {
    return (
      <>
        <GlobalStyle />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
          <div style={{ background: '#15181f', border: '1px solid #22262f', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, textAlign: 'center', marginBottom: '6px' }}>🌐 BabelChat Web</h1>
            <p style={{ fontSize: '13px', color: '#4a5060', textAlign: 'center', marginBottom: '24px' }}>Secure Room Synchronization Gateway</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '10px', color: '#5a6070', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>YOUR CHAT PROFILE NAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            </div>

            <button onClick={handleCreateRoom} style={{ background: '#ffffff', color: '#111318', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
              ✨ Create Unique Room ID
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#22262f' }} />
              <span style={{ fontSize: '11px', color: '#3a3f50', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#22262f' }} />
            </div>

            <form onSubmit={handleJoinRoom}>
              <label style={{ fontSize: '10px', color: '#5a6070', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>ENTER LIVE ROOM KEY</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="e.g., room-5834" value={inputRoomId} onChange={e => setInputRoomId(e.target.value)} />
                <button type="submit" style={{ background: '#2e3240', border: '1px solid #3a3f50', color: '#38bdf8', borderRadius: '8px', padding: '0 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // --- RENDERING BLOCK 2: SECURED CHAT INTERFACE HUB WINDOW ---
  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Dynamic Header Room Indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#111318' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: '#38bdf8' }}>🔑 Active Room: {room}</h1>
            <p style={{ fontSize: 12, color: '#4a5060', marginTop: 2 }}>Connected Identity: <strong>{username}</strong></p>
          </div>
          <button onClick={() => { setRoom(''); setMessages([]); setInputRoomId(''); }} style={{ background: '#22161a', color: '#ef4444', border: '1px solid #3d1d24', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Exit Room
          </button>
        </div>

        {/* Config Engine Selectors Row */}
        <div style={{ background: '#15181f', border: '1px solid #22262f', padding: '12px', borderRadius: 10, marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: '#5a6070', display: 'block', marginBottom: 5, fontWeight: 600 }}>TRANSLATE MY OUTGOING TEXT INTO</label>
          <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
            <option value="es">Spanish (Español)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="it">Italian (Italiano)</option>
            <option value="zh-cn">Chinese (Simplified)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="ko">Korean (한국어)</option>
            <option value="ru">Russian (Русский)</option>
            <option value="pt">Portuguese (Português)</option>
          </select>
        </div>

        {/* Dynamic Chat Message Logs Stream */}
        <div style={{ flex: 1, background: '#15181f', border: '1px solid #22262f', borderRadius: 14, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', color: '#3a3f50', fontSize: 13, textAlign: 'center' }}>
              Room "{room}" is empty.<br />Enter this exact key in your phone to synchronize.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.username === username;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: isMe ? '#1e2433' : '#161920', // Matched mobile color bubbles
                  border: `1px solid ${isMe ? '#2a3247' : '#22262f'}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  animation: 'chatSlide 0.2s ease both'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isMe ? '#8a909f' : '#5a6070' }}>{isMe ? 'You' : msg.username}</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: '1.4' }}>{msg.translatedText}</p>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Sender Core Form Bar */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message #${room}...`}
            autoComplete="off"
          />
          <button type="submit" disabled={loading} style={{ background: '#e2e4ea', color: '#111318', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '...' : 'Send'}
          </button>
        </form>

      </div>
    </>
  );
}