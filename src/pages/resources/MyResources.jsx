import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'

const TIER_COLORS = {
  low:      { color: '#6b7280', accent: '#9ca3af' },
  standard: { color: '#3b82f6', accent: '#60a5fa' },
  strong:   { color: '#8b5cf6', accent: '#a78bfa' },
  elite:    { color: '#f59e0b', accent: '#fbbf24' },
}

const FLAG = code => `https://flagcdn.com/24x18/${code?.toLowerCase()}.png`

export default function MyResources() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [ips,     setIps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

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
        setIps(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [user])

  const tabs = [
    { id: 'all',     label: 'All' },
    { id: 'active',  label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'expired', label: 'Expired' },
  ]

  const filtered = filter === 'all' ? ips : ips.filter(ip =>
    filter === 'pending'
      ? ['pending','under_review'].includes(ip.status)
      : ip.status === filter
  )

  const activeCount  = ips.filter(i => i.status === 'active').length
  const pendingCount = ips.filter(i => ['pending','under_review'].includes(i.status)).length
  const expiredCount = ips.filter(i => i.status === 'expired').length

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>My IPs</div>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>My IPs</h1>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Active',  value: activeCount,  color: '#22c55e' },
            { label: 'Pending', value: pendingCount, color: '#f59e0b' },
            { label: 'Expired', value: expiredCount, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff06', border: '1px solid #ffffff0d', borderRadius: '10px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: s.color, fontWeight: 800, fontSize: '14px' }}>{s.value}</span>
              <span style={{ color: '#4b5563', fontSize: '11px' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const active = filter === tab.id
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
                color: active ? '#818cf8' : '#6b7280',
                padding: '10px 16px', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 700 : 400,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}>{tab.label}</button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading IPs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No IPs found</div>
            <div style={{ color: '#374151', fontSize: '12px', marginBottom: '20px' }}>
              {filter === 'all' ? 'Purchase your first IP from the marketplace' : `No ${filter} IPs`}
            </div>
            {filter === 'all' && (
              <button onClick={() => navigate('/marketplace')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px 22px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                Browse Marketplace
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(ip => {
              const tier = TIER_COLORS[ip.tier] || TIER_COLORS.standard
              const statusColor = {
                active:       '#22c55e',
                pending:      '#f59e0b',
                under_review: '#6366f1',
                rejected:     '#ef4444',
                expired:      '#6b7280',
              }[ip.status] || '#6b7280'

              const date = ip.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              }) || '—'

              return (
                <div key={ip.id} style={{
                  background: 'linear-gradient(145deg,#13131f,#0d0d18)',
                  border: `1px solid ${tier.color}33`,
                  borderRadius: '16px', padding: '16px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Glow */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle,${tier.color}15 0%,transparent 70%)`, pointerEvents: 'none' }} />

                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={FLAG(ip.countryCode)} alt="" style={{ borderRadius: '2px' }} onError={e => { e.target.style.display = 'none' }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{ip.city}, {ip.country}</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>{ip.region}</div>
                      </div>
                    </div>
                    <div style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}44`, borderRadius: '20px', padding: '3px 10px', color: statusColor, fontSize: '10px', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {ip.status?.replace('_',' ')}
                    </div>
                  </div>

                  {/* Tier + type */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '20px', padding: '3px 10px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: tier.accent, boxShadow: `0 0 5px ${tier.accent}` }} />
                      <span style={{ color: tier.accent, fontSize: '10px', fontWeight: 700 }}>{ip.tier?.toUpperCase()}</span>
                    </div>
                    <span style={{ color: '#4b5563', fontSize: '11px' }}>· {ip.ipType}</span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Trust',   value: ip.trustScore || '—', color: '#22c55e' },
                      { label: 'Latency', value: ip.latency    || '—', color: '#6366f1' },
                      { label: 'Uptime',  value: ip.uptime     || '—', color: '#8b5cf6' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#ffffff06', border: '1px solid #ffffff08', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ color: s.color, fontSize: '11px', fontWeight: 700 }}>{s.value}</div>
                        <div style={{ color: '#4b5563', fontSize: '9px', marginTop: '2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* IP Address */}
                  {ip.status === 'active' && ip.ipAddress ? (
                    <div style={{ background: '#22c55e0d', border: '1px solid #22c55e33', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
                      <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>IP Address</div>
                      <div style={{ color: '#4ade80', fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        {ip.ipAddress}
                      </div>
                    </div>
                  ) : (ip.status === 'pending' || ip.status === 'under_review') ? (
                    <div style={{ background: '#f59e0b0d', border: '1px solid #f59e0b33', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
                      <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600 }}>⏳ IP assigned after payment approval</div>
                    </div>
                  ) : null}

                  {/* Footer */}
                  <div style={{ paddingTop: '10px', borderTop: '1px solid #ffffff08' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>Purchased {date}</div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>${ip.price?.toLocaleString()}/mo</div>
                    </div>
                    {ip.status === 'active' && (
                      <button
                        onClick={() => navigate('/renew', { state: { orderId: ip.id } })}
                        style={{ width: '100%', marginTop: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                      >
                        🔄 Renew IP — ${ip.price?.toLocaleString()}/mo
                      </button>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}