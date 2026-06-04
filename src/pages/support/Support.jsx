import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  collection, addDoc, query, where, orderBy,
  getDocs, serverTimestamp, doc, updateDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const CATEGORIES = [
  { id: 'payment',  label: 'Payment Issue', icon: '💳' },
  { id: 'ip',       label: 'IP Problem',    icon: '📡' },
  { id: 'account',  label: 'Account Help',  icon: '👤' },
  { id: 'billing',  label: 'Billing',       icon: '🧾' },
  { id: 'other',    label: 'Other',         icon: '💬' },
]

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#22c55e', bg: '#22c55e18' },
  in_progress: { label: 'In Progress', color: '#6366f1', bg: '#6366f118' },
  resolved:    { label: 'Resolved',    color: '#6b7280', bg: '#6b728018' },
}

export default function Support() {
  const { user }    = useAuth()
  const [view, setView]         = useState('list')
  const [tickets,   setTickets] = useState([])
  const [selected,  setSelected]= useState(null)
  const [messages,  setMessages]= useState([])
  const [loading,   setLoading] = useState(true)
  const [sending,   setSending] = useState(false)
  const [reply,     setReply]   = useState('')
  const [subject,   setSubject] = useState('')
  const [category,  setCategory]= useState('payment')
  const [body,      setBody]    = useState('')
  const [creating,  setCreating]= useState(false)
  const [error,     setError]   = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { loadTickets() }, [user])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadTickets = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(collection(db, 'tickets'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const loadThread = async (ticket) => {
    setSelected(ticket)
    setView('thread')
    try {
      const q = query(collection(db, 'tickets', ticket.id, 'messages'), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
  }

  const createTicket = async () => {
    if (!subject.trim()) return setError('Please enter a subject.')
    if (!body.trim())    return setError('Please describe your issue.')
    setError('')
    setCreating(true)
    try {
      const cat = CATEGORIES.find(c => c.id === category)
      const ref = await addDoc(collection(db, 'tickets'), {
        userId: user.uid, userEmail: user.email,
        subject: subject.trim(), category,
        categoryLabel: cat?.label, status: 'open',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      })
      await addDoc(collection(db, 'tickets', ref.id, 'messages'), {
        sender: 'user', senderEmail: user.email,
        text: body.trim(), createdAt: serverTimestamp(),
      })
      setSubject(''); setBody(''); setCategory('payment')
      await loadTickets()
      setView('list')
    } catch (err) { setError('Failed to create ticket.') }
    setCreating(false)
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await addDoc(collection(db, 'tickets', selected.id, 'messages'), {
        sender: 'user', senderEmail: user.email,
        text: reply.trim(), createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'tickets', selected.id), { updatedAt: serverTimestamp() })
      setMessages(prev => [...prev, {
        id: Date.now().toString(), sender: 'user',
        senderEmail: user.email, text: reply.trim(),
        createdAt: { toDate: () => new Date() },
      }])
      setReply('')
    } catch (err) { console.error(err) }
    setSending(false)
  }

  // ── LIST ──────────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>Support</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Support</h1>
          <button onClick={() => setView('new')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
            + New Ticket
          </button>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading…</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No tickets yet</div>
            <div style={{ color: '#374151', fontSize: '12px', marginBottom: '20px' }}>Create a ticket and our team will help you</div>
            <button onClick={() => setView('new')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px 22px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
              Open a Ticket
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tickets.map(ticket => {
              const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
              const cat    = CATEGORIES.find(c => c.id === ticket.category)
              const date   = ticket.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '—'
              return (
                <div key={ticket.id} onClick={() => loadThread(ticket)} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f115', border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{cat?.icon || '💬'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{ticket.subject}</div>
                    <div style={{ color: '#4b5563', fontSize: '11px' }}>{cat?.label} · {date}</div>
                  </div>
                  <div style={{ background: status.bg, border: `1px solid ${status.color}44`, borderRadius: '20px', padding: '3px 9px', color: status.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{status.label}</div>
                  <span style={{ color: '#374151', fontSize: '12px' }}>→</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── NEW TICKET ────────────────────────────────────────────────────────────
  if (view === 'new') return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setView('list')} style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>←</button>
        <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>New Ticket</h1>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '18px' }}>

          {error && (
            <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: '8px', padding: '10px 12px', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>{error}</div>
          )}

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{ background: category === c.id ? '#6366f122' : '#ffffff08', border: `1px solid ${category === c.id ? '#6366f155' : '#ffffff12'}`, color: category === c.id ? '#818cf8' : '#9ca3af', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: category === c.id ? 700 : 400 }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description" style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Body */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe your issue in detail…" rows={5} style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('list')} style={{ flex: 1, background: '#ffffff0a', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Cancel</button>
            <button onClick={createTicket} disabled={creating} style={{ flex: 2, background: creating ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '13px' }}>
              {creating ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── THREAD ────────────────────────────────────────────────────────────────
  if (view === 'thread') return (
    <div style={{ height: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Thread header */}
      <div style={{ padding: '14px 16px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => { setView('list'); setSelected(null); setMessages([]) }} style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.subject}</div>
          <div style={{ color: '#4b5563', fontSize: '11px' }}>#{selected?.id?.slice(0,8)} · {STATUS_CONFIG[selected?.status]?.label}</div>
        </div>
        <div style={{ background: STATUS_CONFIG[selected?.status]?.bg, border: `1px solid ${STATUS_CONFIG[selected?.status]?.color}44`, borderRadius: '20px', padding: '3px 9px', color: STATUS_CONFIG[selected?.status]?.color, fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
          {STATUS_CONFIG[selected?.status]?.label}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '13px' }}>No messages yet</div>
        ) : messages.map(msg => {
          const isUser  = msg.sender === 'user'
          const time    = msg.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || ''
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%' }}>
                <div style={{ color: '#4b5563', fontSize: '10px', marginBottom: '4px', textAlign: isUser ? 'right' : 'left' }}>
                  {isUser ? 'You' : '⚙️ Support'} · {time}
                </div>
                <div style={{ background: isUser ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#ffffff0d', border: `1px solid ${isUser ? '#6366f155' : '#ffffff15'}`, borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', color: '#fff', fontSize: '13px', lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {selected?.status !== 'resolved' ? (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #ffffff08', background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(10px)', display: 'flex', gap: '8px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
          <input
            value={reply} onChange={e => setReply(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
            placeholder="Type your reply…"
            style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
          />
          <button onClick={sendReply} disabled={sending || !reply.trim()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px 18px', cursor: sending ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px' }}>
            {sending ? '…' : '→'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #ffffff08', textAlign: 'center', color: '#4b5563', fontSize: '12px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
          This ticket has been resolved
        </div>
      )}
    </div>
  )
}