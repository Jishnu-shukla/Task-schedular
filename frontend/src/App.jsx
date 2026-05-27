import React, { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'https://task-schedular-qnt6.onrender.com/api/messages'; // Changed to our message route

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
  const [username, setUsername] = useState('User_' + Math.floor(Math.random() * 100));
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default: Spanish
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(BACKEND_URL);
      const data = await res.json();
      setMessages(data);
    } catch { /* silent */ }
  };

  // Auto scroll down when a new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling loop: updates the chat feed every 2 seconds for a fast chat feel
  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 2000);
    return () => clearInterval(id);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, originalText: text, targetLanguage }),
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

  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* Top Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>🌐 BabelChat AI</h1>
          <p style={{ fontSize: 13, color: '#4a5060', marginTop: 4 }}>Real-time automated language translating chatroom</p>
        </div>

        {/* Username Config Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, background: '#15181f', border: '1px solid #22262f', padding: '12px', borderRadius: 10, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 10, color: '#5a6070', display: 'block', marginBottom: 5, fontWeight: 600 }}>YOUR IDENTITY</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#5a6070', display: 'block', marginBottom: 5, fontWeight: 600 }}>TRANSLATE MY OUTGOING TEXT INTO</label>
            <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="zh-cn">Chinese (Simplified)</option>
            </select>
          </div>
        </div>

        {/* Live Chat Timeline Feed */}
        <div style={{ flex: 1, background: '#15181f', border: '1px solid #22262f', borderRadius: 14, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', color: '#3a3f50', fontSize: 13 }}>Send a message to unlock global dialogue...</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.username === username;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: isMe ? '#1e222e' : '#1a1d25',
                  border: `1px solid ${isMe ? '#2e3240' : '#252830'}`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  animation: 'chatSlide 0.2s ease both'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isMe ? '#8a909f' : '#5a6070' }}>{msg.username}</span>
                    <span style={{ fontSize: 10, color: '#3a3f50' }}>{msg.timestamp}</span>
                  </div>
                  {/* Large translated string */}
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#e2e4ea' }}>{msg.translatedText}</p>
                  {/* Small source code translator debug hint */}
                  <p style={{ fontSize: 11, color: '#4a5060', marginTop: 4, fontStyle: 'italic', borderTop: '1px solid #22262f', paddingTop: 4 }}>
                    Original: {msg.originalText} ({msg.targetLanguage.toUpperCase()})
                  </p>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Text Input Sender Row */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input 
            type="text" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Type your native text here..." 
            autoComplete="off"
          />
          <button type="submit" disabled={loading} style={{ background: '#e2e4ea', color: '#111318', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Converting...' : 'Send'}
          </button>
        </form>

      </div>
    </>
  );
}