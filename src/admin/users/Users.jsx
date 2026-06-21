import { useState, useEffect } from 'react'
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, serverTimestamp, addDoc, deleteDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { sendNewsletterEmail } from '../../services/emailService'

const ADMIN_EMAIL = 'davehack966@gmail.com'

const TIERS = [
  { id: 'low',      label: 'Low',      default: 220, color: '#6b7280' },
  { id: 'standard', label: 'Standard', default: 280, color: '#3b82f6' },
  { id: 'strong',   label: 'Strong',   default: 350, color: '#8b5cf6' },
  { id: 'elite',    label: 'Elite',    default: 500, color: '#f59e0b' },
]

const CRYPTOS = [
  { id: 'btc',  label: 'BTC', icon: '₿', color: '#f59e0b' },
  { id: 'eth',  label: 'ETH', icon: 'Ξ', color: '#6366f1' },
  { id: 'usdt', label: 'USDT', icon: '₮', color: '#22c55e' },
]

export default function Users() {
  const { user: adminUser }  = useAuth()
  const [users,        setUsers]        = useState([])
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)
  const [acting,       setActing]       = useState(false)
  const [toast,        setToast]        = useState('')
  const [walletAmt,    setWalletAmt]    = useState('')
  const [notifMsg,     setNotifMsg]     = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMsg,     setEmailMsg]     = useState('')
  const [customPrices, setCustomPrices] = useState({ low: '', standard: '', strong: '', elite: '' })
  const [customWallets,setCustomWallets]= useState({ btc: '', eth: '', usdt: '' })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [usersSnap, ordersSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'orders')),
      ])
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const getUserOrders = uid => orders.filter(o => o.userId === uid)

  const updateWallet = async (user) => {
    const amt = parseFloat(walletAmt)
    if (isNaN(amt)) return
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), { walletBalance: amt, updatedAt: serverTimestamp() })
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid || user.id, type: 'payment',
        title: 'Wallet Updated 💰',
        message: `Your wallet balance has been updated to $${amt.toLocaleString()}.`,
        read: false, createdAt: serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, walletBalance: amt } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, walletBalance: amt } : prev)
      setWalletAmt('')
      showToast(`✅ Wallet updated to $${amt.toLocaleString()}`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const saveCustomPrices = async (user) => {
    setActing(true)
    try {
      const prices = {}
      TIERS.forEach(tier => {
        const val = parseFloat(customPrices[tier.id])
        if (!isNaN(val) && val > 0) prices[tier.id] = val
      })
      await updateDoc(doc(db, 'users', user.id), {
        customPrices: { ...(user.customPrices || {}), ...prices },
        updatedAt: serverTimestamp(),
      })
      const updated = { ...(user.customPrices || {}), ...prices }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customPrices: updated } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customPrices: updated } : prev)
      setCustomPrices({ low: '', standard: '', strong: '', elite: '' })
      showToast('✅ Custom prices saved')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const clearCustomPrices = async (user) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), { customPrices: null, updatedAt: serverTimestamp() })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customPrices: null } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customPrices: null } : prev)
      showToast('✅ Custom prices removed')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const saveCustomWallets = async (user) => {
    setActing(true)
    try {
      const wallets = {}
      CRYPTOS.forEach(c => {
        if (customWallets[c.id]?.trim()) wallets[c.id] = customWallets[c.id].trim()
      })
      await updateDoc(doc(db, 'users', user.id), {
        customWallets: { ...(user.customWallets || {}), ...wallets },
        updatedAt: serverTimestamp(),
      })
      const updated = { ...(user.customWallets || {}), ...wallets }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customWallets: updated } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customWallets: updated } : prev)
      setCustomWallets({ btc: '', eth: '', usdt: '' })
      showToast('✅ Custom wallets saved')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const clearCustomWallets = async (user) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), { customWallets: null, updatedAt: serverTimestamp() })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customWallets: null } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customWallets: null } : prev)
      showToast('✅ Custom wallets removed')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const sendNotification = async (user) => {
    if (!notifMsg.trim()) return
    setActing(true)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid || user.id, type: 'system',
        title: 'Message from Support ⚙️',
        message: notifMsg.trim(), read: false, createdAt: serverTimestamp(),
      })
      setNotifMsg('')
      showToast('✅ Notification sent')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const sendEmail = async (user) => {
    if (!emailSubject.trim() || !emailMsg.trim()) return
    setActing(true)
    try {
      await sendNewsletterEmail({
        toEmail: user.email,
        toName:  user.fullName || user.email.split('@')[0],
        subject: emailSubject.trim(),
        message: emailMsg.trim(),
      })
      setEmailSubject('')
      setEmailMsg('')
      showToast(`✅ Email sent to ${user.email}`)
    } catch (err) {
      console.error(err)
      showToast('❌ Email failed to send')
    }
    setActing(false)
  }

  const toggleSuspend = async (user) => {
    setActing(true)
    try {
      const suspended = !user.suspended
      await updateDoc(doc(db, 'users', user.id), { suspended, updatedAt: serverTimestamp() })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, suspended } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, suspended } : prev)
      showToast(suspended ? '🚫 User suspended' : '✅ User reactivated')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.fullName || user.email}? They will not be able to login again.`)) return
    setActing(true)
    try {
      const uid = user.uid || user.id
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, adminEmail: adminUser?.email }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete from Auth')
      }

      await deleteDoc(doc(db, 'users', user.id))

      setUsers(prev => prev.filter(u => u.id !== user.id))
      setSelected(null)
      showToast('✅ User permanently deleted')
    } catch (err) {
      console.error(err)
      showToast('❌ Delete failed: ' + err.message)
    }
    setActing(false)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.email?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q)
  })

  const joined = (u) => u.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) || '—'

  const hasCustomPrices  = (u) => u.customPrices  && Object.keys(u.customPrices).length  > 0
  const hasCustomWallets = (u) => u.customWallets && Object.keys(u.customWallets).length > 0

  return (
    <div style={{ padding: '14px 16px' }}>

      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '9px 14px 9px 34px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ background: '#ffffff06', border: '1px solid #ffffff0d', borderRadius: '10px', padding: '8px 14px', color: '#6b7280', fontSize: '12px' }}>
          {users.length} total users
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '14px', alignItems: 'start' }}>

        {/* User list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading users…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
              <div style={{ fontSize: '13px' }}>No users found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {filtered.map(user => {
                const userOrders  = getUserOrders(user.uid || user.id)
                const activeCount = userOrders.filter(o => o.status === 'active').length
                const isSel       = selected?.id === user.id
                const isAdminUser = user.email === ADMIN_EMAIL

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelected(isSel ? null : user)
                      setWalletAmt('')
                      setNotifMsg('')
                      setEmailSubject('')
                      setEmailMsg('')
                      setCustomPrices({ low: '', standard: '', strong: '', elite: '' })
                      setCustomWallets({ btc: '', eth: '', usdt: '' })
                    }}
                    style={{
                      background: isSel ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isSel ? '#6366f144' : '#ffffff0d'}`,
                      borderRadius: '12px', padding: '12px 16px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                      opacity: user.suspended ? 0.6 : 1,
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: isAdminUser ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {(user.fullName || user.email || '?')[0].toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{user.fullName || 'Unknown'}</span>
                        {isAdminUser    && <span style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '20px', padding: '1px 6px', color: '#fbbf24', fontSize: '9px', fontWeight: 700 }}>ADMIN</span>}
                        {user.suspended && <span style={{ background: '#ef444418', border: '1px solid #ef444433', borderRadius: '20px', padding: '1px 6px', color: '#f87171', fontSize: '9px', fontWeight: 700 }}>SUSPENDED</span>}
                        {hasCustomPrices(user)  && <span style={{ background: '#22c55e18', border: '1px solid #22c55e33', borderRadius: '20px', padding: '1px 6px', color: '#4ade80', fontSize: '9px', fontWeight: 700 }}>CUSTOM PRICE</span>}
                        {hasCustomWallets(user) && <span style={{ background: '#6366f118', border: '1px solid #6366f133', borderRadius: '20px', padding: '1px 6px', color: '#818cf8', fontSize: '9px', fontWeight: 700 }}>CUSTOM WALLET</span>}
                      </div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>{user.email}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>{activeCount}</div>
                      <div style={{ color: '#4b5563', fontSize: '9px' }}>Active IPs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>${(user.walletBalance || 0).toLocaleString()}</div>
                      <div style={{ color: '#4b5563', fontSize: '9px' }}>Wallet</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#9ca3af', fontWeight: 600, fontSize: '12px' }}>{userOrders.length}</div>
                      <div style={{ color: '#4b5563', fontSize: '9px' }}>Orders</div>
                    </div>
                    <div style={{ color: '#374151', fontSize: '11px' }}>{joined(user)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '16px', padding: '18px', position: 'sticky', top: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '13px' }}>User Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>

            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: selected.email === ADMIN_EMAIL ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 auto 8px' }}>
                {(selected.fullName || selected.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{selected.fullName || 'Unknown'}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>{selected.email}</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Orders',     value: getUserOrders(selected.uid || selected.id).length,                                    color: '#818cf8' },
                { label: 'Active IPs', value: getUserOrders(selected.uid || selected.id).filter(o => o.status === 'active').length, color: '#22c55e' },
                { label: 'Wallet',     value: `$${(selected.walletBalance || 0).toLocaleString()}`,                                 color: '#fbbf24' },
              ].map(s => (
                <div key={s.label} style={{ background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: '14px' }}>{s.value}</div>
                  <div style={{ color: '#4b5563', fontSize: '9px', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
              {[
                { label: 'Role',   value: selected.email === ADMIN_EMAIL ? 'Administrator' : 'User' },
                { label: 'Joined', value: joined(selected) },
                { label: 'Status', value: selected.suspended ? 'Suspended' : 'Active' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Set wallet balance */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set Wallet Balance ($)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={walletAmt} onChange={e => setWalletAmt(e.target.value)}
                  placeholder="0.00" type="number"
                  style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
                <button onClick={() => updateWallet(selected)} disabled={acting} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                  Set
                </button>
              </div>
            </div>

            {/* Custom prices per tier */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Prices per Tier</label>
                {hasCustomPrices(selected) && (
                  <button onClick={() => clearCustomPrices(selected)} disabled={acting} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}>
                    ✕ Clear all
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {TIERS.map(tier => (
                  <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '60px', background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '6px', padding: '4px 8px', textAlign: 'center' }}>
                      <span style={{ color: tier.color, fontSize: '10px', fontWeight: 700 }}>{tier.label}</span>
                    </div>
                    <input
                      value={customPrices[tier.id]}
                      onChange={e => setCustomPrices(prev => ({ ...prev, [tier.id]: e.target.value }))}
                      placeholder={selected.customPrices?.[tier.id] ? `$${selected.customPrices[tier.id]}` : `$${tier.default}`}
                      type="number"
                      style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '7px 10px', color: '#fff', fontSize: '12px', outline: 'none' }}
                    />
                    {selected.customPrices?.[tier.id] && (
                      <span style={{ color: '#22c55e', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>✓ ${selected.customPrices[tier.id]}</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => saveCustomPrices(selected)}
                disabled={acting || TIERS.every(t => !customPrices[t.id])}
                style={{ width: '100%', marginTop: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}
              >
                💾 Save Custom Prices
              </button>
            </div>

            {/* Custom wallets per crypto */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Wallets per Crypto</label>
                {hasCustomWallets(selected) && (
                  <button onClick={() => clearCustomWallets(selected)} disabled={acting} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: 0 }}>
                    ✕ Clear all
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CRYPTOS.map(crypto => (
                  <div key={crypto.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ color: crypto.color, fontSize: '12px', fontWeight: 700, width: '40px' }}>{crypto.icon} {crypto.label}</span>
                      {selected.customWallets?.[crypto.id] && (
                        <span style={{ color: '#22c55e', fontSize: '9px', fontWeight: 700 }}>✓ Set</span>
                      )}
                    </div>
                    <input
                      value={customWallets[crypto.id]}
                      onChange={e => setCustomWallets(prev => ({ ...prev, [crypto.id]: e.target.value }))}
                      placeholder={selected.customWallets?.[crypto.id] ? selected.customWallets[crypto.id].slice(0,20)+'…' : `Enter ${crypto.label} address…`}
                      style={{ width: '100%', background: '#ffffff08', border: `1px solid ${crypto.color}33`, borderRadius: '8px', padding: '7px 10px', color: '#fff', fontSize: '10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => saveCustomWallets(selected)}
                disabled={acting || CRYPTOS.every(c => !customWallets[c.id]?.trim())}
                style={{ width: '100%', marginTop: '8px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#000', borderRadius: '8px', padding: '8px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}
              >
                💾 Save Custom Wallets
              </button>
            </div>

            {/* Send in-app notification */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Send In-App Notification</label>
              <textarea
                value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                placeholder="Message to send to this user's notification bell…"
                rows={2}
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: '6px' }}
              />
              <button onClick={() => sendNotification(selected)} disabled={acting || !notifMsg.trim()} style={{ width: '100%', background: '#6366f118', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '8px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px' }}>
                🔔 Send Notification
              </button>
            </div>

            {/* Send individual email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Send Email to {selected.email}</label>
              <input
                value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                placeholder="Subject…"
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '6px' }}
              />
              <textarea
                value={emailMsg} onChange={e => setEmailMsg(e.target.value)}
                placeholder="Email message…"
                rows={3}
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: '6px' }}
              />
              <button
                onClick={() => sendEmail(selected)}
                disabled={acting || !emailSubject.trim() || !emailMsg.trim()}
                style={{ width: '100%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}
              >
                📧 Send Email
              </button>
            </div>

            {/* Suspend / Delete */}
            {selected.email !== ADMIN_EMAIL && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => toggleSuspend(selected)} disabled={acting} style={{ width: '100%', background: selected.suspended ? '#22c55e18' : '#ef444418', border: `1px solid ${selected.suspended ? '#22c55e33' : '#ef444433'}`, color: selected.suspended ? '#4ade80' : '#f87171', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                  {selected.suspended ? '✅ Reactivate User' : '🚫 Suspend User'}
                </button>
                <button onClick={() => deleteUser(selected)} disabled={acting} style={{ width: '100%', background: '#7f1d1d33', border: '1px solid #ef444455', color: '#fca5a5', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                  🗑️ Delete User Permanently
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}