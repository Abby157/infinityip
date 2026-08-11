import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

const TIERS = [
  { id: 'low',      label: 'Low',      default: 220, color: '#6b7280' },
  { id: 'standard', label: 'Standard', default: 280, color: '#3b82f6' },
  { id: 'strong',   label: 'Strong',   default: 350, color: '#8b5cf6' },
  { id: 'elite',    label: 'Elite',    default: 500, color: '#f59e0b' },
]

const CRYPTOS = [
  { id: 'btc',  label: 'BTC',  icon: '₿', color: '#f59e0b' },
  { id: 'eth',  label: 'ETH',  icon: 'Ξ', color: '#6366f1' },
  { id: 'usdt', label: 'USDT', icon: '₮', color: '#22c55e' },
]

export default function ResellerDashboard() {
  const { userData, logout } = useAuth()
  const [reseller,     setReseller]     = useState(null)
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [acting,       setActing]       = useState(false)
  const [toast,        setToast]        = useState('')
  const [tab,          setTab]          = useState('overview')
  const [prices,       setPrices]       = useState({ low: '', standard: '', strong: '', elite: '' })
  const [wallets,      setWallets]      = useState({ btc: '', eth: '', usdt: '' })
  const [copied,       setCopied]       = useState('')

  useEffect(() => {
    if (!userData?.resellerId) return
    load()
  }, [userData])

  const load = async () => {
    setLoading(true)
    try {
      // Load reseller doc
      const resellerSnap = await getDocs(
        query(collection(db, 'resellers'), where('__name__', '==', userData.resellerId))
      )
      if (!resellerSnap.empty) {
        const data = { id: resellerSnap.docs[0].id, ...resellerSnap.docs[0].data() }
        setReseller(data)
        setPrices({
          low:      data.prices?.low      || '',
          standard: data.prices?.standard || '',
          strong:   data.prices?.strong   || '',
          elite:    data.prices?.elite    || '',
        })
        setWallets({
          btc:  data.wallets?.btc  || '',
          eth:  data.wallets?.eth  || '',
          usdt: data.wallets?.usdt || '',
        })
      }

      // Load users who signed up with this reseller code
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('resellerId', '==', userData.resellerId))
      )
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const savePrices = async () => {
    if (!reseller) return
    setActing(true)
    try {
      const newPrices = {}
      TIERS.forEach(t => {
        const v = parseFloat(prices[t.id])
        newPrices[t.id] = (!isNaN(v) && v > 0) ? v : t.default
      })

      await updateDoc(doc(db, 'resellers', reseller.id), {
        prices:    newPrices,
        updatedAt: serverTimestamp(),
      })

      // Update all reseller's users customPrices
      for (const user of users) {
        await updateDoc(doc(db, 'users', user.id), {
          customPrices: newPrices,
          updatedAt:    serverTimestamp(),
        })
      }

      setReseller(prev => ({ ...prev, prices: newPrices }))
      showToast('✅ Prices updated for you and all your customers')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const saveWallets = async () => {
    if (!reseller) return
    setActing(true)
    try {
      const newWallets = {}
      CRYPTOS.forEach(c => {
        if (wallets[c.id]?.trim()) newWallets[c.id] = wallets[c.id].trim()
      })

      await updateDoc(doc(db, 'resellers', reseller.id), {
        wallets:   newWallets,
        updatedAt: serverTimestamp(),
      })

      // Update all reseller's users customWallets
      for (const user of users) {
        await updateDoc(doc(db, 'users', user.id), {
          customWallets: newWallets,
          updatedAt:     serverTimestamp(),
        })
      }

      setReseller(prev => ({ ...prev, wallets: newWallets }))
      showToast('✅ Wallets updated for you and all your customers')
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const handleCopy = (text, key) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const signupLink = reseller ? `${window.location.origin}/signup?ref=${reseller.code}` : ''

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      Loading…
    </div>
  )

  if (!reseller) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      Reseller profile not found. Contact admin.
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #6366f122' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ color: '#818cf8', fontSize: '11px', marginBottom: '4px' }}>Reseller Dashboard</div>
            <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>👋 {reseller.name}</h1>
          </div>
          <button onClick={logout} style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px' }}>
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'prices',   label: '💰 Prices' },
            { id: 'wallets',  label: '👛 Wallets' },
            { id: 'users',    label: `👥 Customers (${users.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? '#6366f1' : 'transparent'}`,
              color: tab === t.id ? '#818cf8' : '#6b7280',
              padding: '10px 16px', cursor: 'pointer',
              fontSize: '12px', fontWeight: tab === t.id ? 700 : 400,
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {toast && (
          <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            {toast}
          </div>
        )}

        {/* Overview tab */}
        {tab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Total Customers', value: users.length,                                       color: '#818cf8' },
                { label: 'Active Code',     value: reseller.code,                                      color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ color: '#4b5563', fontSize: '11px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Referral code */}
            <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Your Referral Code</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000000aa', border: '1px solid #6366f133', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px' }}>
                <span style={{ color: '#818cf8', fontWeight: 800, fontSize: '16px', fontFamily: 'monospace' }}>{reseller.code}</span>
                <button onClick={() => handleCopy(reseller.code, 'code')} style={{ background: 'none', border: 'none', color: copied === 'code' ? '#4ade80' : '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                  {copied === 'code' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Your Signup Link</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000000aa', border: '1px solid #6366f133', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{signupLink}</span>
                <button onClick={() => handleCopy(signupLink, 'link')} style={{ background: 'none', border: 'none', color: copied === 'link' ? '#4ade80' : '#818cf8', cursor: 'pointer', fontSize: '12px', fontWeight: 700, marginLeft: '8px', flexShrink: 0 }}>
                  {copied === 'link' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Current prices */}
            <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Your Current Prices</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {TIERS.map(tier => (
                  <div key={tier.id} style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}33`, borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ color: tier.color, fontSize: '9px', fontWeight: 700, marginBottom: '4px' }}>{tier.label}</div>
                    <div style={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}>${reseller.prices?.[tier.id] || tier.default}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current wallets */}
            <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', padding: '16px' }}>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Your Wallet Addresses</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CRYPTOS.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: c.color, fontSize: '13px', fontWeight: 700, width: '45px' }}>{c.icon} {c.label}</span>
                    <span style={{ color: reseller.wallets?.[c.id] ? '#9ca3af' : '#374151', fontSize: '10px', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reseller.wallets?.[c.id] || 'Not set'}
                    </span>
                    {reseller.wallets?.[c.id] && (
                      <button onClick={() => handleCopy(reseller.wallets[c.id], c.id)} style={{ background: 'none', border: 'none', color: copied === c.id ? '#4ade80' : '#6b7280', cursor: 'pointer', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                        {copied === c.id ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prices tab */}
        {tab === 'prices' && (
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
              Set your custom prices per tier. These will apply to all your current and future customers automatically.
            </div>

            <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {TIERS.map(tier => (
                  <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '70px', background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ color: tier.color, fontSize: '10px', fontWeight: 700 }}>{tier.label}</div>
                      <div style={{ color: '#4b5563', fontSize: '9px' }}>Default ${tier.default}</div>
                    </div>
                    <input
                      value={prices[tier.id]}
                      onChange={e => setPrices(p => ({ ...p, [tier.id]: e.target.value }))}
                      placeholder={`${reseller.prices?.[tier.id] || tier.default}`}
                      type="number"
                      style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                    <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Current: ${reseller.prices?.[tier.id] || tier.default}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={savePrices}
              disabled={acting}
              style={{ width: '100%', background: acting ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '12px', padding: '14px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '14px' }}
            >
              {acting ? 'Saving…' : '💾 Save Prices'}
            </button>

            <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
              Saving will update prices for all {users.length} of your existing customers
            </div>
          </div>
        )}

        {/* Wallets tab */}
        {tab === 'wallets' && (
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
              Set your wallet addresses. When your customers pay, they will send crypto to these addresses.
            </div>

            <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {CRYPTOS.map(c => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: c.color, fontSize: '14px', fontWeight: 700 }}>{c.icon} {c.label}</span>
                      {reseller.wallets?.[c.id] && <span style={{ color: '#22c55e', fontSize: '10px', fontWeight: 700 }}>✓ Set</span>}
                    </div>
                    <input
                      value={wallets[c.id]}
                      onChange={e => setWallets(p => ({ ...p, [c.id]: e.target.value }))}
                      placeholder={reseller.wallets?.[c.id] || `Enter ${c.label} wallet address…`}
                      style={{ width: '100%', background: '#ffffff08', border: `1px solid ${c.color}33`, borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '11px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                    {reseller.wallets?.[c.id] && (
                      <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Current: {reseller.wallets[c.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveWallets}
              disabled={acting || CRYPTOS.every(c => !wallets[c.id]?.trim())}
              style={{ width: '100%', background: acting ? '#f59e0b50' : 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#000', borderRadius: '12px', padding: '14px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '14px' }}
            >
              {acting ? 'Saving…' : '💾 Save Wallets'}
            </button>

            <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
              Saving will update wallets for all {users.length} of your existing customers
            </div>
          </div>
        )}

        {/* Users/Customers tab */}
        {tab === 'users' && (
          <div>
            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No customers yet</div>
                <div style={{ color: '#374151', fontSize: '12px', marginBottom: '20px' }}>Share your signup link to get customers</div>
                <button
                  onClick={() => handleCopy(signupLink, 'link')}
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px 22px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                >
                  {copied === 'link' ? '✓ Copied!' : '🔗 Copy Signup Link'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(user => {
                  const joined = user.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
                  return (
                    <div key={user.id} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {(user.fullName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{user.fullName || 'Unknown'}</div>
                        <div style={{ color: '#4b5563', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                      </div>
                      <div style={{ color: '#374151', fontSize: '11px', whiteSpace: 'nowrap' }}>{joined}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}