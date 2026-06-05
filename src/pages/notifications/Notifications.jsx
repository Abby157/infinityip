import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { requestPushPermission, isPushSupported, getPushPermissionStatus, showLocalNotification } from '../../services/pushNotifications'

const TYPE_CONFIG = {
  order:   { icon: '📦', color: '#6366f1', bg: '#6366f118' },
  payment: { icon: '💳', color: '#22c55e', bg: '#22c55e18' },
  ip:      { icon: '📡', color: '#8b5cf6', bg: '#8b5cf618' },
  alert:   { icon: '⚠️', color: '#f59e0b', bg: '#f59e0b18' },
  system:  { icon: '⚙️', color: '#6b7280', bg: '#6b728018' },
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [pushStatus, setPushStatus] = useState(getPushPermissionStatus())

  useEffect(() => {
    if (!user) return
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) { console.error(err) }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const tabs = [
    { id: 'all',     label: 'All' },
    { id: 'unread',  label: 'Unread' },
    { id: 'order',   label: 'Orders' },
    { id: 'payment', label: 'Payments' },
    { id: 'system',  label: 'System' },
  ]

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>Notifications</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: '8px', background: '#6366f1', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </h1>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {isPushSupported() && pushStatus !== 'granted' && (
              <button
                onClick={async () => {
                  const sub = await requestPushPermission()
                  if (sub) {
                    setPushStatus('granted')
                    showLocalNotification('Notifications Enabled! 🔔', 'You will now receive alerts from Infinity IP')
                  }
                }}
                style={{ background: '#6366f115', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                🔔 Enable Alerts
              </button>
            )}
            {pushStatus === 'granted' && (
              <div style={{ background: '#22c55e15', border: '1px solid #22c55e33', borderRadius: '8px', padding: '6px 12px', color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>
                ✅ Alerts on
              </div>
            )}
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: '#6366f115', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap' }}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const active = filter === tab.id
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
                color: active ? '#818cf8' : '#6b7280',
                padding: '10px 14px', cursor: 'pointer',
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
          <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600 }}>No notifications</div>
            <div style={{ color: '#374151', fontSize: '12px', marginTop: '4px' }}>
              {filter === 'unread' ? "You're all caught up!" : 'Nothing here yet'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(n => {
              const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
              const time = n.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || '—'
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    background: n.read ? 'linear-gradient(145deg,#13131f,#0d0d18)' : 'linear-gradient(145deg,#16162a,#12121f)',
                    border: `1px solid ${n.read ? '#ffffff0d' : '#6366f122'}`,
                    borderRadius: '14px', padding: '14px',
                    cursor: n.read ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <div style={{ color: '#fff', fontWeight: n.read ? 500 : 700, fontSize: '13px' }}>{n.title}</div>
                      {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1', flexShrink: 0, marginTop: '3px' }} />}
                    </div>
                    {n.message && <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.5, marginBottom: '4px' }}>{n.message}</div>}
                    <div style={{ color: '#374151', fontSize: '10px' }}>{time}</div>
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