import { useState, useEffect, useRef } from 'react'
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#22c55e', bg: '#22c55e18' },
  in_progress: { label: 'In Progress', color: '#6366f1', bg: '#6366f118' },
  resolved:    { label: 'Resolved',    color: '#6b7280', bg: '#6b728018' },
}

const CATEGORY_ICONS = {
  payment: '💳', ip: '📡', account: '👤',
  billing: '🧾', other: '💬',
}

export default function SupportTickets() {
  const [tickets,  setTickets]  = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [toast,    setToast]    = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { loadTickets() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadTickets = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const openTicket = async (ticket) => {
    setSelected(ticket)
    setReply('')
    try {
      const q = query(
        collection(db, 'tickets', ticket.id, 'messages'),
        orderBy('createdAt', 'asc')
      )
      const snap = await getDocs(q)
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await addDoc(collection(db, 'tickets', selected.id, 'messages'), {
        sender: 'admin',
        senderEmail: 'support@infinityip.com',
        text: reply.trim(),
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'tickets', selected.id), {
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      })
      // Notify user
      await addDoc(collection(db, 'notifications'), {
        userId: selected.userId,
        type: 'system',
        title: 'Support Reply 💬',
        message: `Your ticket "${selected.subject}" has a new reply from our team.`,
        read: false,
        createdAt: serverTimestamp(),
      })
      const newMsg = {
        id: Date.now().toString(),
        sender: 'admin',
        senderEmail: 'support@infinityip.com',
        text: reply.trim(),
        createdAt: { toDate: () => new Date() },
      }
      setMessages(prev => [...prev, newMsg])
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'in_progress' } : t))
      setSelected(prev => ({ ...prev, status: 'in_progress' }))
      setReply('')
      showToast('Reply sent')
    } catch (err) { console.error(err) }
    setSending(false)
  }

  const updateStatus = async (ticket, status) => {
    try {
      await updateDoc(doc(db, 'tickets', ticket.id), { status, updatedAt: serverTimestamp() })
      if (status === 'resolved') {
        await addDoc(collection(db, 'notifications'), {
          userId: ticket.userId,
          type: 'system',
          title: 'Ticket Resolved ✅',
          message: `Your support ticket "${ticket.subject}" has been resolved.`,
          read: false,
          createdAt: serverTimestamp(),
        })
      }
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status } : t))
      if (selected?.id === ticket.id) setSelected(prev => ({ ...prev, status }))
      showToast(`Ticket marked as ${status.replace('_', ' ')}`)
    } catch (err) { console.error(err) }
  }

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.subject?.toLowerCase().includes(q) ||
      t.userEmail?.toLowerCase().includes(q) ||
      t.categoryLabel?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const openCount     = tickets.filter(t => t.status === 'open').length
  const progressCount = tickets.filter(t => t.status === 'in_progress').length

  return (
    <div style={{ padding: '14px 16px' }}>

      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Alert */}
      {(openCount > 0 || progressCount > 0) && (
        <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '12px', padding: '11px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px' }}>💬</span>
          <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
            {openCount > 0 && `${openCount} open ticket${openCount > 1 ? 's' : ''}`}
            {openCount > 0 && progressCount > 0 && ' · '}
            {progressCount > 0 && `${progressCount} in progress`}
          </span>
        </div>
      )}

      {/* Search + tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets…"
            style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '9px 14px 9px 34px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all','open','in_progress','resolved'].map(tab => {
            const count = tab === 'all' ? tickets.length : tickets.filter(t => t.status === tab).length
            const active = filter === tab
            return (
              <button key={tab} onClick={() => setFilter(tab)} style={{
                background: active ? '#6366f118' : '#ffffff08',
                border: `1px solid ${active ? '#6366f144' : '#ffffff12'}`,
                color: active ? '#818cf8' : '#9ca3af',
                borderRadius: '20px', padding: '5px 12px',
                fontSize: '11px', fontWeight: active ? 700 : 400, cursor: 'pointer',
              }}>
                {tab.replace('_',' ')} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '14px', alignItems: 'start' }}>

        {/* Ticket list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading tickets…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '13px' }}>No tickets found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {filtered.map(ticket => {
                const sc     = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                const isSel  = selected?.id === ticket.id
                const icon   = CATEGORY_ICONS[ticket.category] || '💬'
                const date   = ticket.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '—'

                return (
                  <div
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    style={{
                      background: isSel ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isSel ? '#6366f144' : '#ffffff0d'}`,
                      borderRadius: '12px', padding: '12px 16px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#6366f115', border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: '130px' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{ticket.subject}</div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>{ticket.userEmail} · {ticket.categoryLabel}</div>
                    </div>

                    <div style={{ background: sc.bg, border: `1px solid ${sc.color}44`, borderRadius: '20px', padding: '2px 9px', color: sc.color, fontSize: '10px', fontWeight: 700 }}>
                      {sc.label}
                    </div>

                    <div style={{ color: '#374151', fontSize: '11px' }}>{date}</div>
                    <div style={{ color: '#374151', fontSize: '11px' }}>→</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Thread panel */}
        {selected && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: '20px' }}>
            {/* Panel header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #ffffff08', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{selected.subject}</div>
                <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '1px' }}>{selected.userEmail} · #{selected.id.slice(0,8)}</div>
              </div>
              <button onClick={() => { setSelected(null); setMessages([]) }} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>×</button>
            </div>

            {/* Status actions */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #ffffff08', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['open','in_progress','resolved'].map(s => {
                const sc = STATUS_CONFIG[s]
                const isActive = selected.status === s
                return (
                  <button key={s} onClick={() => updateStatus(selected, s)} style={{
                    background: isActive ? sc.bg : '#ffffff08',
                    border: `1px solid ${isActive ? sc.color + '44' : '#ffffff12'}`,
                    color: isActive ? sc.color : '#6b7280',
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '10px', fontWeight: isActive ? 700 : 400, cursor: 'pointer',
                  }}>
                    {sc.label}
                  </button>
                )
              })}
            </div>

            {/* Messages */}
            <div style={{ padding: '14px 16px', minHeight: '260px', maxHeight: '340px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#4b5563', fontSize: '12px' }}>No messages yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.map(msg => {
                    const isAdmin = msg.sender === 'admin'
                    const time = msg.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || ''
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '80%' }}>
                          <div style={{ color: '#374151', fontSize: '9px', marginBottom: '3px', textAlign: isAdmin ? 'right' : 'left' }}>
                            {isAdmin ? '⚙️ Support Team' : '👤 ' + (msg.senderEmail || 'User')} · {time}
                          </div>
                          <div style={{
                            background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#ffffff0d',
                            border: `1px solid ${isAdmin ? '#6366f155' : '#ffffff15'}`,
                            borderRadius: isAdmin ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                            padding: '9px 12px', color: '#fff', fontSize: '12px', lineHeight: 1.5,
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Reply box */}
            {selected.status !== 'resolved' ? (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #ffffff08', display: 'flex', gap: '8px' }}>
                <input
                  value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Type reply…"
                  style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()} style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', color: '#fff', borderRadius: '8px',
                  padding: '9px 14px', cursor: sending ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '12px',
                }}>
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #ffffff08', textAlign: 'center', color: '#4b5563', fontSize: '12px' }}>
                Ticket resolved
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}