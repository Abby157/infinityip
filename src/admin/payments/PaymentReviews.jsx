import { useState, useEffect } from 'react'
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { showLocalNotification } from '../../services/pushNotifications'

const STATUS_COLOR = {
  pending:      { color: '#f59e0b', bg: '#f59e0b18', label: 'Pending' },
  under_review: { color: '#6366f1', bg: '#6366f118', label: 'Under Review' },
  active:       { color: '#22c55e', bg: '#22c55e18', label: 'Active' },
  rejected:     { color: '#ef4444', bg: '#ef444418', label: 'Rejected' },
}

const TIER_COLOR = {
  low:      '#6b7280',
  standard: '#3b82f6',
  strong:   '#8b5cf6',
  elite:    '#f59e0b',
}

const FLAG = code => `https://flagcdn.com/20x15/${code?.toLowerCase()}.png`

function generateIP() {
  const pools = [
    () => `${r(192)}.${r(168)}.${r(255)}.${r(255)}`,
    () => `${45 + r(10)}.${r(255)}.${r(255)}.${r(255)}`,
    () => `${172}.${16 + r(16)}.${r(255)}.${r(255)}`,
    () => `${104 + r(6)}.${r(255)}.${r(255)}.${r(255)}`,
  ]
  function r(n) { return Math.floor(Math.random() * n) }
  return pools[Math.floor(Math.random() * pools.length)]()
}

export default function PaymentReviews() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('pending')
  const [selected, setSelected] = useState(null)
  const [acting,   setActing]   = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject,   setShowReject]   = useState(false)
  const [toast, setToast] = useState('')

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

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const approve = async (order) => {
    setActing(true)
    try {
      const ip = generateIP()
      const expiryDate = new Date()
expiryDate.setDate(expiryDate.getDate() + 30)

await updateDoc(doc(db, 'orders', order.id), {
  testField: 'HELLO_FROM_APPROVE',
  status: 'active',
  paymentStatus: 'paid',
  ipAddress: ip,
  approvedAt: serverTimestamp(),
  expiryDate: expiryDate,
  expiryAlertSent: false,
  renewalStatus: 'active',
})
      // Notify user
      await addDoc(collection(db, 'notifications'), {
        userId:    order.userId,
        type:      'payment',
        title:     'Payment Approved ✅',
        message:   `Your ${order.tier?.toUpperCase()} IP in ${order.city} has been activated. IP: ${ip}`,
        read:      false,
        createdAt: serverTimestamp(),
      })
      setOrders(prev => prev.map(o => o.id === order.id
        ? { ...o, status: 'active', paymentStatus: 'paid', ipAddress: ip }
        : o
      ))
      setSelected(null)
      showToast(`✅ Approved! IP ${ip} assigned to ${order.userEmail}`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const reject = async (order) => {
    if (!rejectReason.trim()) return
    setActing(true)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status:          'rejected',
        paymentStatus:   'failed',
        rejectionReason: rejectReason.trim(),
        rejectedAt:      serverTimestamp(),
      })
      await addDoc(collection(db, 'notifications'), {
        userId:    order.userId,
        type:      'alert',
        title:     'Payment Rejected ❌',
        message:   `Your order for ${order.city} was rejected. Reason: ${rejectReason.trim()}`,
        read:      false,
        createdAt: serverTimestamp(),
      })
      setOrders(prev => prev.map(o => o.id === order.id
        ? { ...o, status: 'rejected', paymentStatus: 'failed', rejectionReason: rejectReason.trim() }
        : o
      ))
      setSelected(null)
      setShowReject(false)
      setRejectReason('')
      showToast(`❌ Order rejected for ${order.userEmail}`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const markUnderReview = async (order) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'under_review' })
      await addDoc(collection(db, 'notifications'), {
        userId:    order.userId,
        type:      'order',
        title:     'Payment Under Review 🔍',
        message:   `Your payment for ${order.city} is being reviewed. We'll notify you shortly.`,
        read:      false,
        createdAt: serverTimestamp(),
      })
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'under_review' } : o))
      setSelected(null)
      showToast(`🔍 Marked under review`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const tabs = [
    { id: 'pending',      label: 'Pending' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'active',       label: 'Approved' },
    { id: 'rejected',     label: 'Rejected' },
    { id: 'all',          label: 'All' },
  ]

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const reviewCount  = orders.filter(o => o.status === 'under_review').length

  return (
    <div style={{ padding: '14px 16px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Alert bar */}
      {(pendingCount > 0 || reviewCount > 0) && (
        <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b33', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
            {pendingCount > 0 && `${pendingCount} pending payment${pendingCount > 1 ? 's' : ''} require review`}
            {pendingCount > 0 && reviewCount > 0 && ' · '}
            {reviewCount > 0 && `${reviewCount} under review`}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const count = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length
          const active = filter === tab.id
          return (
            <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
              background: active ? '#f59e0b18' : '#ffffff08',
              border: `1px solid ${active ? '#f59e0b44' : '#ffffff12'}`,
              color: active ? '#fbbf24' : '#9ca3af',
              borderRadius: '20px', padding: '5px 14px',
              fontSize: '12px', fontWeight: active ? 700 : 400, cursor: 'pointer',
            }}>
              {tab.label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Orders list + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '14px', alignItems: 'start' }}>

        {/* List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#4b5563' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
              <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600 }}>No {filter === 'all' ? '' : filter} orders</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(order => {
                const sc   = STATUS_COLOR[order.status] || STATUS_COLOR.pending
                const tc   = TIER_COLOR[order.tier] || '#6b7280'
                const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
                const isSelected = selected?.id === order.id

                return (
                  <div
                    key={order.id}
                    onClick={() => { setSelected(isSelected ? null : order); setShowReject(false); setRejectReason('') }}
                    style={{
                      background: isSelected ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isSelected ? '#f59e0b44' : '#ffffff0d'}`,
                      borderRadius: '12px', padding: '14px 16px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${tc}18`, border: `1px solid ${tc}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>📡</div>

                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <img src={FLAG(order.countryCode)} alt="" style={{ borderRadius: '2px' }} onError={e => { e.target.style.display = 'none' }} />
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{order.city}, {order.country}</span>
                      </div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>{order.userEmail}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>${order.price?.toLocaleString()}</div>
                      <div style={{ color: tc, fontSize: '10px', fontWeight: 600 }}>{order.tier?.toUpperCase()}</div>
                    </div>

                    <div style={{ background: sc.bg, border: `1px solid ${sc.color}44`, borderRadius: '20px', padding: '3px 10px', color: sc.color, fontSize: '10px', fontWeight: 700 }}>
                      {sc.label}
                    </div>

                    <div style={{ color: '#4b5563', fontSize: '11px' }}>{date}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #f59e0b22', borderRadius: '16px', padding: '20px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '14px' }}>Order Detail</div>
              <button onClick={() => { setSelected(null); setShowReject(false) }} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Order ID',    value: selected.id.slice(0, 14) + '…' },
                { label: 'User',        value: selected.userEmail },
                { label: 'Location',    value: `${selected.city}, ${selected.country}` },
                { label: 'Region',      value: selected.region },
                { label: 'IP Type',     value: selected.ipType },
                { label: 'Tier',        value: selected.tier?.toUpperCase() },
                { label: 'Price',       value: `$${selected.price?.toLocaleString()}/mo` },
                { label: 'Status',      value: selected.status?.replace('_', ' ') },
                { label: 'Payment',     value: selected.paymentStatus || 'unpaid' },
                { label: 'Placed',      value: selected.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, textAlign: 'right', maxWidth: '180px', wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}
              {selected.ipAddress && (
                <div style={{ background: '#22c55e0d', border: '1px solid #22c55e33', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>ASSIGNED IP</div>
                  <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>{selected.ipAddress}</div>
                </div>
              )}
              {selected.rejectionReason && (
                <div style={{ background: '#ef44440d', border: '1px solid #ef444433', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}>REJECTION REASON</div>
                  <div style={{ color: '#f87171', fontSize: '12px' }}>{selected.rejectionReason}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            {(selected.status === 'pending' || selected.status === 'under_review') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selected.status === 'pending' && (
                  <button onClick={() => markUnderReview(selected)} disabled={acting} style={{ background: '#6366f118', border: '1px solid #6366f144', color: '#818cf8', borderRadius: '10px', padding: '10px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px' }}>
                    🔍 Mark Under Review
                  </button>
                )}
                <button onClick={() => approve(selected)} disabled={acting} style={{ background: acting ? '#22c55e30' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '13px' }}>
                  {acting ? 'Processing…' : '✅ Approve & Generate IP'}
                </button>

                {!showReject ? (
                  <button onClick={() => setShowReject(true)} style={{ background: '#ef444418', border: '1px solid #ef444433', color: '#f87171', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                    ❌ Reject Payment
                  </button>
                ) : (
                  <div>
                    <textarea
                      value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection…"
                      rows={3}
                      style={{ width: '100%', background: '#ffffff08', border: '1px solid #ef444433', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setShowReject(false); setRejectReason('') }} style={{ flex: 1, background: '#ffffff0a', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', padding: '9px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                      <button onClick={() => reject(selected)} disabled={acting || !rejectReason.trim()} style={{ flex: 2, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.status === 'active' && (
              <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
                ✅ This order is active and IP is assigned
              </div>
            )}

            {selected.status === 'rejected' && (
              <div style={{ background: '#ef444410', border: '1px solid #ef444433', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#f87171', fontSize: '13px', fontWeight: 600 }}>
                ❌ This order has been rejected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}