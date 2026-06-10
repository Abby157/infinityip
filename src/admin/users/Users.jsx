import { useState, useEffect } from 'react'
import {
  collection, getDocs, query, orderBy,
  doc, updateDoc, serverTimestamp, addDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const ADMIN_EMAIL = 'davehack966@gmail.com'

export default function Users() {
  const [users,       setUsers]       = useState([])
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [acting,      setActing]      = useState(false)
  const [toast,       setToast]       = useState('')
  const [walletAmt,   setWalletAmt]   = useState('')
  const [notifMsg,    setNotifMsg]    = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customWallet,setCustomWallet]= useState('')

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
      await updateDoc(doc(db, 'users', user.id), {
        walletBalance: amt,
        updatedAt: serverTimestamp(),
      })
      await addDoc(collection(db, 'notifications'), {
        userId:    user.uid || user.id,
        type:      'payment',
        title:     'Wallet Updated 💰',
        message:   `Your wallet balance has been updated to $${amt.toLocaleString()}.`,
        read:      false,
        createdAt: serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, walletBalance: amt } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, walletBalance: amt } : prev)
      setWalletAmt('')
      showToast(`✅ Wallet updated to $${amt.toLocaleString()}`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const updateCustomPrice = async (user) => {
    const price = parseFloat(customPrice)
    if (isNaN(price) || price <= 0) return
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), {
        customPrice: price,
        updatedAt:   serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customPrice: price } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customPrice: price } : prev)
      setCustomPrice('')
      showToast(`✅ Custom price set to $${price.toLocaleString()}`)
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const clearCustomPrice = async (user) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), {
        customPrice: null,
        updatedAt:   serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customPrice: null } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customPrice: null } : prev)
      showToast('✅ Custom price removed — using default')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const updateCustomWallet = async (user) => {
    if (!customWallet.trim()) return
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), {
        customWallet: customWallet.trim(),
        updatedAt:    serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customWallet: customWallet.trim() } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customWallet: customWallet.trim() } : prev)
      setCustomWallet('')
      showToast('✅ Custom wallet address saved')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const clearCustomWallet = async (user) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'users', user.id), {
        customWallet: null,
        updatedAt:    serverTimestamp(),
      })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, customWallet: null } : u))
      setSelected(prev => prev?.id === user.id ? { ...prev, customWallet: null } : prev)
      showToast('✅ Custom wallet removed — using default')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const sendNotification = async (user) => {
    if (!notifMsg.trim()) return
    setActing(true)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId:    user.uid || user.id,
        type:      'system',
        title:     'Message from Support ⚙️',
        message:   notifMsg.trim(),
        read:      false,
        createdAt: serverTimestamp(),
      })
      setNotifMsg('')
      showToast('✅ Notification sent')
    } catch (err) { console.error(err) }
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

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.email?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q)
  })

  const joined = (u) => u.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) || '—'

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

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '14px', alignItems: 'start' }}>

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
                    onClick={() => { setSelected(isSel ? null : user); setWalletAmt(''); setNotifMsg(''); setCustomPrice(''); setCustomWallet('') }}
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
                        {isAdminUser && <span style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: '20px', padding: '1px 6px', color: '#fbbf24', fontSize: '9px', fontWeight: 700 }}>ADMIN</span>}
                        {user.suspended && <span style={{ background: '#ef444418', border: '1px solid #ef444433', borderRadius: '20px', padding: '1px 6px', color: '#f87171', fontSize: '9px', fontWeight: 700 }}>SUSPENDED</span>}
                        {user.customPrice && <span style={{ background: '#22c55e18', border: '1px solid #22c55e33', borderRadius: '20px', padding: '1px 6px', color: '#4ade80', fontSize: '9px', fontWeight: 700 }}>CUSTOM PRICE</span>}
                        {user.customWallet && <span style={{ background: '#6366f118', border: '1px solid #6366f133', borderRadius: '20px', padding: '1px 6px', color: '#818cf8', fontSize: '9px', fontWeight: 700 }}>CUSTOM WALLET</span>}
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
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '16px', padding: '18px', position: 'sticky', top: '20px' }}>
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
                { label: 'Role',          value: selected.email === ADMIN_EMAIL ? 'Administrator' : 'User' },
                { label: 'Joined',        value: joined(selected) },
                { label: 'Status',        value: selected.suspended ? 'Suspended' : 'Active' },
                { label: 'Custom Price',  value: selected.customPrice ? `$${selected.customPrice.toLocaleString()}` : 'Default' },
                { label: 'Custom Wallet', value: selected.customWallet ? selected.customWallet.slice(0,16)+'…' : 'Default' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Set wallet balance */}
            <div style={{ marginBottom: '12px' }}>
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

            {/* Custom price */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Custom IP Price ($) <span style={{ color: '#374151' }}>— overrides default</span>
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                  placeholder={selected.customPrice ? `Current: $${selected.customPrice}` : 'e.g. 150'} type="number"
                  style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
                <button onClick={() => updateCustomPrice(selected)} disabled={acting} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                  Set
                </button>
              </div>
              {selected.customPrice && (
                <button onClick={() => clearCustomPrice(selected)} disabled={acting} style={{ marginTop: '5px', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  ✕ Remove custom price
                </button>
              )}
            </div>

            {/* Custom wallet */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Custom Wallet Address <span style={{ color: '#374151' }}>— overrides default</span>
              </label>
              <input
                value={customWallet} onChange={e => setCustomWallet(e.target.value)}
                placeholder={selected.customWallet ? selected.customWallet.slice(0,20)+'…' : 'Enter BTC/ETH/USDT address…'}
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '11px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', marginBottom: '6px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => updateCustomWallet(selected)} disabled={acting || !customWallet.trim()} style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                  Save Wallet
                </button>
                {selected.customWallet && (
                  <button onClick={() => clearCustomWallet(selected)} disabled={acting} style={{ background: '#ef444418', border: '1px solid #ef444433', color: '#f87171', borderRadius: '8px', padding: '8px 12px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Send notification */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Send Notification</label>
              <textarea
                value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                placeholder="Message to send to this user…"
                rows={2}
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: '6px' }}
              />
              <button onClick={() => sendNotification(selected)} disabled={acting || !notifMsg.trim()} style={{ width: '100%', background: '#6366f118', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '8px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px' }}>
                Send Notification
              </button>
            </div>

            {/* Suspend */}
            {selected.email !== ADMIN_EMAIL && (
              <button onClick={() => toggleSuspend(selected)} disabled={acting} style={{ width: '100%', background: selected.suspended ? '#22c55e18' : '#ef444418', border: `1px solid ${selected.suspended ? '#22c55e33' : '#ef444433'}`, color: selected.suspended ? '#4ade80' : '#f87171', borderRadius: '8px', padding: '9px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '12px' }}>
                {selected.suspended ? '✅ Reactivate User' : '🚫 Suspend User'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}