import { useState, useEffect } from 'react'
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, serverTimestamp, addDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_CONFIG = {
  pending:      { color: '#f59e0b', bg: '#f59e0b18', label: 'Pending' },
  under_review: { color: '#6366f1', bg: '#6366f118', label: 'Under Review' },
  active:       { color: '#22c55e', bg: '#22c55e18', label: 'Active' },
  rejected:     { color: '#ef4444', bg: '#ef444418', label: 'Rejected' },
  expired:      { color: '#6b7280', bg: '#6b728018', label: 'Expired' },
}

const TIER_COLOR = {
  low:      '#6b7280',
  standard: '#3b82f6',
  strong:   '#8b5cf6',
  elite:    '#f59e0b',
}

const FLAG = code => `https://flagcdn.com/20x15/${code?.toLowerCase()}.png`

export default function Orders() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [acting,   setActing]   = useState(false)
  const [toast,    setToast]    = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Orders.jsx only handles marking expired — approval/rejection happens in Payments tab
  const markExpired = async (order) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status:    'expired',
        expiredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await addDoc(collection(db, 'notifications'), {
        userId:    order.userId,
        type:      'order',
        title:     'IP Expired',
        message:   `Your IP in ${order.city} has expired. Renew to continue.`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'expired' } : o))
      setSelected(prev => prev?.id === order.id ? { ...prev, status: 'expired' } : prev)
      showToast(`Order marked expired`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const tabs = ['all','pending','under_review','active','rejected','expired']

  const filtered = orders.filter(o => {
    const matchTab = filter === 'all' || o.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      o.city?.toLowerCase().includes(q) ||
      o.country?.toLowerCase().includes(q) ||
      o.userEmail?.toLowerCase().includes(q) ||
      o.tier?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div style={{ padding: '14px 16px' }}>

      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by city, user, tier…"
            style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '9px 14px 9px 34px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const count  = tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length
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

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '14px', alignItems: 'start' }}>

        {/* Orders list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📦</div>
              <div style={{ fontSize: '13px' }}>No orders found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {filtered.map(order => {
                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const tc = TIER_COLOR[order.tier] || '#6b7280'
                const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
                const isSel = selected?.id === order.id

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(isSel ? null : order)}
                    style={{
                      background: isSel ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isSel ? '#6366f144' : '#ffffff0d'}`,
                      borderRadius: '12px', padding: '12px 16px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${tc}18`, border: `1px solid ${tc}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>📡</div>

                    <div style={{ flex: 1, minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <img src={FLAG(order.countryCode)} alt="" onError={e => { e.target.style.display = 'none' }} style={{ borderRadius: '2px' }} />
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>{order.city}, {order.country}</span>
                      </div>
                      <div style={{ color: '#4b5563', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{order.userEmail}</div>
                    </div>

                    <div style={{ color: tc, fontSize: '10px', fontWeight: 700 }}>{order.tier?.toUpperCase()}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>${order.price?.toLocaleString()}</div>

                    <div style={{ background: sc.bg, border: `1px solid ${sc.color}44`, borderRadius: '20px', padding: '2px 9px', color: sc.color, fontSize: '10px', fontWeight: 700 }}>
                      {sc.label}
                    </div>

                    <div style={{ color: '#4b5563', fontSize: '10px' }}>{date}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '16px', padding: '18px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '13px' }}>Order Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '14px' }}>
              {[
                { label: 'Order ID',   value: selected.id.slice(0,12)+'…' },
                { label: 'User',       value: selected.userEmail },
                { label: 'Location',   value: `${selected.city}, ${selected.country}` },
                { label: 'IP Type',    value: selected.ipType },
                { label: 'Tier',       value: selected.tier?.toUpperCase() },
                { label: 'Price',      value: `$${selected.price?.toLocaleString()}/mo` },
                { label: 'Status',     value: selected.status?.replace('_',' ') },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}

              {selected.ipAddress && (
                <div style={{ background: '#22c55e0d', border: '1px solid #22c55e33', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>IP ADDRESS</div>
                  <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>{selected.ipAddress}</div>
                </div>
              )}
            </div>

            {/* Pending/under review notice — redirect to Payments */}
            {(selected.status === 'pending' || selected.status === 'under_review') && (
              <div style={{ background: '#6366f110', border: '1px solid #6366f133', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#818cf8', fontSize: '12px', fontWeight: 600, lineHeight: 1.5 }}>
                ℹ️ To approve or reject this order, go to the <strong>Payments</strong> tab. This keeps IP generation and emails consistent.
              </div>
            )}

            {/* Mark expired — only for active orders */}
            {selected.status === 'active' && (
              <button onClick={() => markExpired(selected)} disabled={acting} style={{ width: '100%', background: '#6b728018', border: '1px solid #6b728033', color: '#9ca3af', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px' }}>
                ⏰ Mark Expired
              </button>
            )}

            {selected.status === 'rejected' && (
              <div style={{ background: '#ef444410', border: '1px solid #ef444433', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#f87171', fontSize: '13px', fontWeight: 600 }}>
                ❌ This order has been rejected
              </div>
            )}

            {selected.status === 'expired' && (
              <div style={{ background: '#6b728010', border: '1px solid #6b728033', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>
                ⏰ This order has expired
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}