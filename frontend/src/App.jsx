import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [meetings, setMeetings] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchMeetings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/meetings')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data)
      }
    } catch (e) {
      console.error("Fetch meetings error:", e)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleParse = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/meetings/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (res.ok) {
        setText('')
        fetchMeetings()
      } else {
        const errorData = await res.json()
        alert(`Failed to parse meeting: ${errorData.detail || res.statusText}`)
      }
    } catch (e) {
      console.error(e)
      alert('Error connecting to backend. Is FastAPI running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontWeight: '800' }}>
        <span style={{ color: 'var(--accent)' }}>AI</span> Secretary
      </h1>
      
      <div className="glass-panel" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Forward a Meeting Request</h2>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Paste an email thread, slack message, or calendar invite text. The AI will extract the details and schedule it.
        </p>
        <textarea 
          placeholder="E.g., Hey team, let's meet next Tuesday at 3 PM to discuss the Q3 roadmap. Please invite bob@example.com and alice@example.com." 
          value={text} 
          onChange={e => setText(e.target.value)}
        />
        <button className="btn-primary" onClick={handleParse} disabled={loading}>
          {loading ? '✨ Parsing with AI...' : 'Parse & Schedule'}
        </button>
      </div>

      <div className="glass-panel">
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>Scheduled Meetings</h2>
        {meetings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No meetings scheduled yet. Send a request to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {meetings.map(m => (
              <div key={m.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{m.title}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Time:</strong><br/>
                    {new Date(m.start_time).toLocaleString()}
                  </p>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Participants:</strong><br/>
                    {m.participants}
                  </p>
                </div>
                
                {m.description && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{m.description}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
