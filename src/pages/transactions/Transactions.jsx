import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_CONFIG = {
  pending:      { label: 'Pending Payment', color: '#f59e0b', bg: '#f59e0b18' },
  under_review: { label: 'Under Review',    color: '#6366f1', bg: '#6366f118' },
  active:       { label: 'Active',          color: '#22c55e', bg: '#22c55e18' },
  rejected:     { label: 'Rejected',        color: '#ef4444', bg: '#ef444418' },
  expired:      { label: 'Expired',         color: '#6b7280', bg: '#6b728018' },
  cancelled:    { label: 'Cancelled',       color: '#ef4444', bg: '#ef444418' },
}

const TIER_COLORS = {
  low:      { color: '#6b7280', accent: '#9ca3af' },
  standard: { color: '#3b82f6', accent: '#60a5fa' },
  strong:   { color: '#8b5cf6', accent: '#a78bfa' },
  elite:    { color: '#f59e0b', accent: '#fbbf24' },
}

const FLAG = code => `https://flagcdn.com/20x15/${code?.toLowerCase()}.png`

export default function Transactions() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [user])

  const handleCancel = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(order.id)
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      })
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'cancelled' } : o
      ))
      setSelected(null)
    } catch (err) { console.error(err) }
    setCancelling(null)
  }

  const tabs = [
    { id: 'all',          label: 'All' },
    { id: 'pending',      label: 'Pending' },
    { id: 'under_review', label: 'Review' },
    { id: 'active',       label: 'Active' },
    { id: 'rejected',     label: 'Rejected' },
  ]

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>Transactions</div>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.5px' }}>My Orders</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const count  = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length
            const active = filter === tab.id
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
                color: active ? '#818cf8' : '#6b7280',
                padding: '10px 14px', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 700 : 400,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                {tab.label}
                {count > 0 && (
                  <span style={{ background: active ? '#6366f122' : '#ffffff0d', borderRadius: '20px', padding: '1px 6px', fontSize: '10px', color: active ? '#818cf8' : '#4b5563' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📦</div>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600 }}>No orders found</div>
            <div style={{ color: '#374151', fontSize: '12px', marginTop: '4px' }}>
              {filter === 'all' ? 'You have no orders yet' : `No ${filter.replace('_',' ')} orders`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(order => {
              const status  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const tier    = TIER_COLORS[order.tier]    || TIER_COLORS.standard
              const date    = order.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
              const isOpen  = selected === order.id

              return (
                <div key={order.id}>
                  {/* Order card */}
                  <div
                    onClick={() => setSelected(isOpen ? null : order.id)}
                    style={{
                      background: isOpen ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isOpen ? tier.color + '44' : '#ffffff0d'}`,
                      borderRadius: isOpen ? '14px 14px 0 0' : '14px',
                      padding: '14px', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${tier.color}18`, border: `1px solid ${tier.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📡</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                          <img src={FLAG(order.countryCode)} alt="" style={{ borderRadius: '2px', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}, {order.country}</span>
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '11px' }}>
                          <span style={{ color: tier.accent, fontWeight: 600 }}>{order.tier?.toUpperCase()}</span>
                          {' · '}{order.ipType}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>${order.price?.toLocaleString()}</div>
                        <div style={{ background: status.bg, border: `1px solid ${status.color}44`, borderRadius: '20px', padding: '2px 8px', color: status.color, fontSize: '9px', fontWeight: 700, marginTop: '4px', whiteSpace: 'nowrap' }}>
                          {status.label}
                        </div>
                      </div>

                      <div style={{ color: '#374151', fontSize: '11px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ background: '#0d0d18', border: `1px solid ${tier.color}33`, borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '14px' }}>

                      {/* Detail grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        {[
                          { label: 'Order ID',   value: order.id.slice(0,10)+'…' },
                          { label: 'Date',       value: date },
                          { label: 'IP Type',    value: order.ipType },
                          { label: 'Payment',    value: order.paymentStatus || 'Unpaid' },
                          { label: 'IP Address', value: order.ipAddress || 'Not assigned' },
                          { label: 'Region',     value: order.region },
                        ].map(s => (
                          <div key={s.label} style={{ background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: '8px', padding: '8px 10px' }}>
                            <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                            <div style={{ color: '#fff', fontSize: '11px', fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Pending banner */}
                      {order.status === 'pending' && (
                        <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b33', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                          <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>⚠️ Payment Required</div>
                          <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.5 }}>
                            Submit your payment proof to activate this IP. We accept BTC, ETH, USDT and Gift Cards.
                          </div>
                          <div style={{ marginTop: '8px', background: '#f59e0b22', border: '1px solid #f59e0b44', borderRadius: '6px', padding: '6px 10px', color: '#fbbf24', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>
                            Amount: ${order.price?.toLocaleString()}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/payment', { state: { orderId: order.id } }) }}
                            style={{ display: 'block', marginTop: '10px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#000', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', width: '100%' }}
                          >
                            Submit Payment →
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(order) }}
                            disabled={cancelling === order.id}
                            style={{ display: 'block', marginTop: '8px', background: '#ef444415', border: '1px solid #ef444433', color: '#f87171', borderRadius: '8px', padding: '10px 16px', cursor: cancelling === order.id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', width: '100%' }}
                          >
                            {cancelling === order.id ? 'Cancelling…' : '✕ Cancel Order'}
                          </button>
                        </div>
                      )}

                      {/* Under review banner */}
                      {order.status === 'under_review' && (
                        <div style={{ background: '#6366f110', border: '1px solid #6366f133', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>🔍 Payment Under Review</div>
                          <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.5 }}>
                            Our team is reviewing your payment. This usually takes 1–24 hours.
                          </div>
                        </div>
                      )}

                      {/* Active banner */}
                      {order.status === 'active' && order.ipAddress && (
                        <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>✅ IP Active</div>
                          <div style={{ background: '#000000aa', border: '1px solid #22c55e33', borderRadius: '6px', padding: '8px 12px', color: '#4ade80', fontSize: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                            {order.ipAddress}
                          </div>
                        </div>
                      )}

                      {/* Rejected banner */}
                      {order.status === 'rejected' && (
                        <div style={{ background: '#ef444410', border: '1px solid #ef444433', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#f87171', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>❌ Order Rejected</div>
                          <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.5 }}>
                            {order.rejectionReason || 'Your payment could not be verified. Contact support for help.'}
                          </div>
                        </div>
                      )}

                      {/* Cancelled banner */}
                      {order.status === 'cancelled' && (
                        <div style={{ background: '#ef444410', border: '1px solid #ef444433', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ color: '#f87171', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>✕ Order Cancelled</div>
                          <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.5 }}>
                            This order has been cancelled. Place a new order from the marketplace.
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}// Fri Jun  5 03:01:18 WAT 2026
)
  )
}
