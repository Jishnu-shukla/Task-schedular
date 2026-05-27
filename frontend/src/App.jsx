import React, { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'https://task-schedular-qnt6.onrender.com';

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body, #root {
      min-height: 100vh;
      background: #111318;
      color: #e2e4ea;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }

    input[type="text"], input[type="datetime-local"] {
      background: #1a1d25;
      border: 1px solid #2a2e3a;
      color: #e2e4ea;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      padding: 11px 14px;
      border-radius: 8px;
      width: 100%;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input::placeholder { color: #3a3f50; }
    input:focus {
      border-color: #4a5060;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
    }
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      filter: invert(0.5);
      cursor: pointer;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  `}</style>
);

function Countdown({ targetTime, status }) {
  const [t, setT] = useState({ h: '00', m: '00', s: '00', state: 'ticking' });

  useEffect(() => {
    if (status === 'Executed') { setT({ state: 'done' }); return; }
    const calc = () => {
      const diff = new Date(targetTime) - Date.now();
      if (diff <= 0) { setT({ state: 'running' }); return; }
      setT({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
        state: 'ticking',
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetTime, status]);

  if (t.state === 'done') return (
    <span style={{ fontSize: 12, color: '#6b7280' }}>Completed</span>
  );
  if (t.state === 'running') return (
    <span style={{ fontSize: 12, color: '#9ca3af', animation: 'pulse 1.4s ease infinite' }}>Running…</span>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[{ val: t.h, unit: 'h' }, { val: t.m, unit: 'm' }, { val: t.s, unit: 's' }].map(({ val, unit }) => (
        <React.Fragment key={unit}>
          <span style={{
            background: '#1e222e',
            border: '1px solid #2a2e3a',
            color: '#c8ccd8',
            borderRadius: 5,
            padding: '2px 7px',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
          }}>{val}</span>
          <span style={{ fontSize: 11, color: '#4a5060' }}>{unit}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function TaskCard({ task, index, onDelete }) {
  const done = task.status === 'Executed';
  const dateStr = new Date(task.executionTime).toLocaleString(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <div style={{
      background: '#15181f',
      border: '1px solid #22262f',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      animation: 'fadeIn 0.25s ease both',
      animationDelay: `${index * 0.05}s`,
      opacity: done ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: done ? '#6b7280' : '#e2e4ea', letterSpacing: '-0.01em' }}>
          {task.taskName}
        </span>
        <span style={{ fontSize: 12, color: '#5a6070' }}>
          {dateStr}
        </span>
        <Countdown targetTime={task.executionTime} status={task.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: done ? '#4b5563' : '#9ca3af',
          background: done ? '#1a1d25' : '#1e222e',
          border: `1px solid ${done ? '#252830' : '#2e3240'}`,
          borderRadius: 20,
          padding: '4px 12px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {done ? 'Done' : 'Pending'}
        </span>

        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4a5060',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.15s, background 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#22161a'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#4a5060'; e.currentTarget.style.background = 'transparent'; }}
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks]            = useState([]);
  const [taskName, setTaskName]      = useState('');
  const [executionTime, setExecTime] = useState('');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState('');

  // Use a ref to keep track of the tasks array across render cycles without triggering refetches
  const tasksRef = useRef([]);

  const fetchTasks = async () => {
    try { 
      const res = await fetch(BACKEND_URL); 
      const newTasks = await res.json();
      
      // --- ADDED: DETECT STATUS CHANGE FOR NOTIFICATIONS ---
      // Compare the fresh server tasks against our previous record in the ref
      newTasks.forEach(newTask => {
        const oldTask = tasksRef.current.find(t => t.id === newTask.id);
        
        // If the task was previously "Pending" but is now "Executed", fire the notification!
        if (oldTask && oldTask.status === 'Pending' && newTask.status === 'Executed') {
          triggerNotification(newTask.taskName);
        }
      });

      // Update both state and our tracking reference
      tasksRef.current = newTasks;
      setTasks(newTasks); 
    }
    catch { /* silent */ }
  };

  // --- ADDED: REQUEST BROWSER PERMISSION ON BOOT ---
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    fetchTasks();
    const id = setInterval(fetchTasks, 3000); // Polling every 3 seconds for tighter notifications
    return () => clearInterval(id);
  }, []);

  // --- ADDED: TRIGGER NATIVE DESKTOP ALERT ---
  const triggerNotification = (title) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Task Scheduler Alert", {
        body: `Time's up! Task execution triggered for: "${title}"`,
        icon: "/favicon.ico" // Optional icon image path
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!taskName.trim() || !executionTime) { setError('Please fill in both fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName, executionTime }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Server rejected request.');
      } else {
        setTaskName('');
        setExecTime('');
        fetchTasks();
      }
    } catch { 
      setError('Could not reach server.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchTasks(); }
    } catch {
      setError('Failed to contact server for deletion.');
    }
  };

  const pending = tasks.filter(t => t.status !== 'Executed').length;
  const done    = tasks.filter(t => t.status === 'Executed').length;

  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2e4ea', letterSpacing: '-0.02em' }}>
            Task Scheduler
          </h1>
          <p style={{ fontSize: 13, color: '#4a5060', marginTop: 5 }}>
            Schedule and track tasks with live countdowns
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Total',   value: tasks.length },
            { label: 'Pending', value: pending },
            { label: 'Done',    value: done },
          ].map(s => (
            <div key={s.label} style={{
              background: '#15181f',
              border: '1px solid #22262f',
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#c8ccd8' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#4a5060', marginTop: 3, letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: '#15181f',
          border: '1px solid #22262f',
          borderRadius: 14,
          padding: '22px',
          marginBottom: 28,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#4a5060', letterSpacing: '0.08em', marginBottom: 16 }}>
            NEW TASK
          </p>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: '#5a6070', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
                  TASK NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water Plants"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#5a6070', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
                  EXECUTION TIME
                </label>
                <input
                  type="datetime-local"
                  value={executionTime}
                  onChange={e => setExecTime(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, fontWeight: 500 }}>⚠️ {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                borderRadius: 8,
                border: '1px solid #2e3240',
                background: '#1e222e',
                color: loading ? '#3a3f50' : '#c8ccd8',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#252a38'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e222e'; }}
            >
              {loading
                ? <span style={{ width: 13, height: 13, border: '1.5px solid #3a3f50', borderTopColor: '#8a909f', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : 'Schedule Task'
              }
            </button>
          </form>
        </div>

        {/* List header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4a5060', letterSpacing: '0.08em' }}>SCHEDULED TASKS</span>
          <span style={{ fontSize: 11, color: '#4a5060' }}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
          <div style={{
            border: '1px dashed #22262f',
            borderRadius: 12,
            padding: '44px 24px',
            textAlign: 'center',
            color: '#3a3f50',
            fontSize: 13,
          }}>
            No tasks scheduled yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((task, i) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={i} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}