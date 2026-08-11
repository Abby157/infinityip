import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'

const StatCard = ({ label, value, sub, icon, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'linear-gradient(145deg,#13131f,#0d0d18)',
      border: '1px solid #ffffff0d',
      borderRadius: '14px',
      padding: '16px',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      flex: '1 1 140px',
    }}
  >
    <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle,${color}20 0%,transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
        {icon}
      </div>
    </div>
    <div style={{ color: '#fff', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>{value}</div>
    <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{label}</div>
    {sub && <div style={{ color: '#374151', fontSize: '10px', marginTop: '2px' }}>{sub}</div>}
  </div>
)

export default function Dashboard() {
  const { user, isAdmin, isReseller } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) setUserData(userSnap.data())
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const snap = await getDocs(q)
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [user])

  const activeIPs     = orders.filter(o => o.status === 'active').length
  const pendingOrders = orders.filter(o => ['pending','under_review'].includes(o.status)).length

  const STATUS_COLOR = {
    active:       '#22c55e',
    pending:      '#f59e0b',
    under_review: '#6366f1',
    rejected:     '#ef4444',
    expired:      '#6b7280',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Hero */}
      <div style={{ padding: '16px 16px 12px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '4px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
            {greeting()}, {userData?.fullName?.split(' ')[0] || user?.email?.split('@')[0]} 👋
          </h1>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} style={{ background: '#f59e0b18', border: '1px solid #f59e0b33', color: '#fbbf24', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap' }}>
                ⚙️ Admin
              </button>
            )}
            {isReseller && (
              <button onClick={() => navigate('/reseller')} style={{ background: '#6366f118', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap' }}>
                🤝 Reseller
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* Reseller banner */}
        {isReseller && (
          <div
            onClick={() => navigate('/reseller')}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '14px', padding: '14px 16px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginBottom: '3px' }}>Reseller Dashboard</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Manage your customers, prices & wallets</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px' }}>→</span>
          </div>
        )}

        {/* Wallet balance */}
        <div style={{
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          borderRadius: '16px', padding: '20px',
          marginBottom: '12px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '6px', position: 'relative' }}>Wallet Balance</div>
          <div style={{ color: '#fff', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', position: 'relative' }}>
            ${(userData?.walletBalance || 0).toLocaleString()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '6px', position: 'relative' }}>Available balance</div>
          <button
            onClick={() => navigate('/marketplace')}
            style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
          >
            + Buy IP
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <StatCard label="Active IPs"   value={loading ? '—' : activeIPs}     icon="📡" color="#6366f1" onClick={() => navigate('/resources')} />
          <StatCard label="Total Orders" value={loading ? '—' : orders.length} icon="📦" color="#8b5cf6" onClick={() => navigate('/transactions')} />
          <StatCard label="Pending"      value={loading ? '—' : pendingOrders} icon="⏳" color="#f59e0b" onClick={() => navigate('/transactions')} />
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Browse Marketplace', icon: '🌐', path: '/marketplace', color: '#6366f1' },
              { label: 'My IPs',             icon: '📡', path: '/resources',   color: '#8b5cf6' },
              { label: 'Transactions',        icon: '💳', path: '/transactions',color: '#22c55e' },
              { label: 'Support',             icon: '💬', path: '/support',     color: '#f59e0b' },
            ].map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  background: 'linear-gradient(145deg,#13131f,#0d0d18)',
                  border: '1px solid #ffffff0d', borderRadius: '12px',
                  padding: '14px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#d1d5db', fontSize: '13px', fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{a.icon}</span>
                <span style={{ fontSize: '12px' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Recent Orders</div>
            <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer' }}>View all →</button>
          </div>

          {loading ? (
            <div style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Loading…</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📦</div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>No orders yet</div>
              <div style={{ color: '#374151', fontSize: '11px', marginBottom: '14px' }}>Browse the marketplace to get started</div>
              <button onClick={() => navigate('/marketplace')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.map(order => {
                const sc = STATUS_COLOR[order.status] || '#6b7280'
                return (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: '10px', padding: '11px 12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f115', border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>📡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}, {order.country}</div>
                      <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '1px' }}>{order.tier?.toUpperCase()} · ${order.price}</div>
                    </div>
                    <div style={{ background: `${sc}18`, border: `1px solid ${sc}44`, borderRadius: '20px', padding: '2px 8px', color: sc, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {order.status?.replace('_',' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Account card */}
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginTop: '12px' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Email', value: user?.email },
              { label: 'Role',  value: isAdmin ? '⚙️ Admin' : isReseller ? '🤝 Reseller' : '👤 User' },
              { label: 'Since', value: userData?.createdAt?.toDate?.()?.toLocaleDateString('en-US',{ month:'short', year:'numeric' }) || '—' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>{r.label}</span>
                <span style={{ color: '#d1d5db', fontSize: '12px', fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}