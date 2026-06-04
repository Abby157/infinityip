import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '../../firebase/config'

const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background: 'linear-gradient(145deg,#13131f,#0d0d18)',
    border: `1px solid ${color}22`, borderRadius: '16px', padding: '20px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle,${color}18 0%,transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginTop: '6px', letterSpacing: '-1px' }}>{value}</div>
        {sub && <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
      </div>
      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ users: 0, orders: 0, pending: 0, revenue: 0 })
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [usersSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
      ])

      const orders  = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const pending = orders.filter(o => o.status === 'pending' || o.status === 'under_review').length
      const revenue = orders.filter(o => o.status === 'active').reduce((s, o) => s + (o.price || 0), 0)

      setStats({ users: usersSnap.size, orders: orders.length, pending, revenue })

      // Recent orders
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(8))
      const snap = await getDocs(q)
      setRecent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const STATUS_COLOR = {
    pending:      '#f59e0b',
    under_review: '#6366f1',
    active:       '#22c55e',
    rejected:     '#ef4444',
    expired:      '#6b7280',
  }

  return (
    <div style={{ padding: '14px 16px' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="Total Users"   value={stats.users}   icon="👥" color="#6366f1" sub="Registered accounts" />
        <StatCard label="Total Orders"  value={stats.orders}  icon="📦" color="#8b5cf6" sub="All time" />
        <StatCard label="Pending"       value={stats.pending} icon="⏳" color="#f59e0b" sub="Awaiting review" />
        <StatCard label="Active Revenue" value={`$${stats.revenue.toLocaleString()}`} icon="💰" color="#22c55e" sub="From active IPs/mo" />
      </div>

      {/* Recent orders */}
      <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: '0 0 16px' }}>Recent Orders</h2>

        {loading ? (
          <div style={{ color: '#4b5563', textAlign: 'center', padding: '30px' }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{ color: '#4b5563', textAlign: 'center', padding: '30px', fontSize: '13px' }}>No orders yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recent.map(order => {
              const sc = STATUS_COLOR[order.status] || '#6b7280'
              const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '—'
              return (
                <div key={order.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: '#ffffff05', border: '1px solid #ffffff08',
                  borderRadius: '10px', padding: '11px 14px', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{order.city}, {order.country}</div>
                    <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '1px' }}>{order.userEmail}</div>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>{order.tier?.toUpperCase()} · ${order.price}</div>
                  <div style={{ background: `${sc}18`, border: `1px solid ${sc}44`, borderRadius: '20px', padding: '2px 10px', color: sc, fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {order.status?.replace('_', ' ')}
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '11px' }}>{date}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}