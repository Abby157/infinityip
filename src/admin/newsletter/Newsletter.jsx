import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { sendNewsletterEmail } from '../../services/emailService'

export default function Newsletter() {
  const [users,     setUsers]     = useState([])
  const [subject,   setSubject]   = useState('')
  const [message,   setMessage]   = useState('')
  const [sending,   setSending]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const [preview,   setPreview]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.email))
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  const handleSend = async () => {
    if (!subject.trim()) return setError('Please enter a subject.')
    if (!message.trim()) return setError('Please enter a message.')
    if (!window.confirm(`Send newsletter to ${users.length} users?`)) return

    setSending(true)
    setError('')
    setProgress(0)

    let sent = 0
    for (const user of users) {
      try {
        await sendNewsletterEmail({
          toEmail: user.email,
          toName:  user.fullName || user.email.split('@')[0],
          subject: subject.trim(),
          message: message.trim(),
        })
        sent++
        setProgress(Math.round((sent / users.length) * 100))
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err)
      }
    }

    setSending(false)
    setDone(true)
    setProgress(100)
  }

  const handleReset = () => {
    setSubject('')
    setMessage('')
    setDone(false)
    setProgress(0)
    setError('')
    setPreview(false)
  }

  return (
    <div style={{ padding: '16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 900, marginBottom: '4px' }}>📧 Newsletter</div>
        <div style={{ color: '#4b5563', fontSize: '12px' }}>Send email updates to all {users.length} registered users</div>
      </div>

      {/* Success */}
      {done && (
        <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
          <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Newsletter Sent!</div>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '14px' }}>Sent to {users.length} users successfully</div>
          <button onClick={handleReset} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
            Send Another
          </button>
        </div>
      )}

      {!done && (
        <>
          {/* Stats */}
          <div style={{ background: '#6366f110', border: '1px solid #6366f133', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <div>
              <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '13px' }}>{users.length} Recipients</div>
              <div style={{ color: '#4b5563', fontSize: '11px' }}>All registered users will receive this email</div>
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. New locations available — Infinity IP"
              style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your newsletter message here…"
              rows={8}
              style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          {/* Preview toggle */}
          {subject && message && (
            <button
              onClick={() => setPreview(!preview)}
              style={{ background: '#ffffff08', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}
            >
              {preview ? '✏️ Edit' : '👁 Preview Email'}
            </button>
          )}

          {/* Preview */}
          {preview && subject && message && (
            <div style={{ background: '#13131f', border: '1px solid #ffffff0d', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Email Preview</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{subject}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '12px' }}>From: Infinity IP · To: All Users</div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', borderTop: '1px solid #ffffff08', paddingTop: '12px' }}>{message}</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {/* Progress */}
          {sending && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Sending…</span>
                <span style={{ color: '#818cf8', fontSize: '12px', fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ background: '#ffffff10', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', height: '100%', width: `${progress}%`, transition: 'width 0.3s', borderRadius: '4px' }} />
              </div>
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            style={{
              width: '100%',
              background: sending || !subject.trim() || !message.trim()
                ? '#6366f130'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border: 'none', color: '#fff', borderRadius: '12px',
              padding: '14px', cursor: sending ? 'not-allowed' : 'pointer',
              fontWeight: 900, fontSize: '14px',
            }}
          >
            {sending ? `Sending… ${progress}%` : `📧 Send to ${users.length} Users`}
          </button>

          <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
            Emails will be sent one by one to avoid spam filters
          </div>
        </>
      )}
    </div>
  )
}