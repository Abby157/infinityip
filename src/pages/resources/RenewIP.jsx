import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'

const TIER_COLORS = {
  low:      { color: '#6b7280', accent: '#9ca3af', price: 220 },
  standard: { color: '#3b82f6', accent: '#60a5fa', price: 280 },
  strong:   { color: '#8b5cf6', accent: '#a78bfa', price: 350 },
  elite:    { color: '#f59e0b', accent: '#fbbf24', price: 500 },
}

const CRYPTO_OPTIONS = [
  { id: 'btc',  symbol: 'BTC', icon: '₿', color: '#f59e0b', network: 'Bitcoin Network' },
  { id: 'eth',  symbol: 'ETH', icon: 'Ξ', color: '#6366f1', network: 'ERC-20' },
  { id: 'usdt', symbol: 'USDT', icon: '₮', color: '#22c55e', network: 'TRC-20 / ERC-20' },
]

export default function RenewIP() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const orderId   = location.state?.orderId || null

  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [cryptoType, setCryptoType] = useState('btc')
  const [txid,       setTxid]       = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')
  const [wallets,    setWallets]    = useState({})
  const [copied,     setCopied]     = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'site'))
        if (settingsSnap.exists()) {
          const d = settingsSnap.data()
          setWallets({
            btc:  d.btcAddress  || 'bc1qmwt97a72cmwvkkqq9zervfqd8j43nm7mqdv5ze',
            eth:  d.ethAddress  || '0x742d35Cc6634C0532925a3b8D4C9B9cA6e5B8Fa',
            usdt: d.usdtAddress || 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
          })
        }
        if (orderId) {
          const snap = await getDoc(doc(db, 'orders', orderId))
          if (snap.exists()) setOrder({ id: snap.id, ...snap.data() })
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [orderId])

  const handleCopy = (text) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    if (!txid.trim()) return setError('Please enter your Transaction ID (TXID).')
    if (!screenshot)  return setError('Please upload a screenshot as proof of payment.')

    setSubmitting(true)
    try {
      const tier = TIER_COLORS[order?.tier] || TIER_COLORS.standard
      const renewalPrice = tier.price

      // Upload screenshot
      const fileRef = ref(storage, `renewals/${user.uid}/${Date.now()}_${screenshot.name}`)
      await uploadBytes(fileRef, screenshot)
      const screenshotURL = await getDownloadURL(fileRef)

      // Create renewal record
      await addDoc(collection(db, 'renewals'), {
        userId:       user.uid,
        userEmail:    user.email,
        orderId:      orderId,
        city:         order?.city,
        country:      order?.country,
        tier:         order?.tier,
        ipAddress:    order?.ipAddress,
        amount:       renewalPrice,
        cryptoType,
        txid:         txid.trim(),
        screenshotURL,
        status:       'under_review',
        createdAt:    serverTimestamp(),
      })

      // Update order renewal status
      await updateDoc(doc(db, 'orders', orderId), {
        renewalStatus: 'under_review',
        updatedAt:     serverTimestamp(),
      })

      // Notify admin
      await addDoc(collection(db, 'notifications'), {
        userId:    'admin',
        type:      'payment',
        title:     'IP Renewal Submitted 🔄',
        message:   `${user.email} submitted renewal for ${order?.city} IP ($${renewalPrice})`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      // Notify user
      await addDoc(collection(db, 'notifications'), {
        userId:    user.uid,
        type:      'ip',
        title:     'Renewal Submitted ✅',
        message:   `Your renewal for ${order?.city} IP is under review. We'll extend it by 30 days once confirmed.`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit renewal. Please try again.')
    }
    setSubmitting(false)
  }

  const selectedCrypto = CRYPTO_OPTIONS.find(c => c.id === cryptoType)
  const walletAddress  = wallets[cryptoType] || '—'
  const tier = TIER_COLORS[order?.tier] || TIER_COLORS.standard

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      Loading…
    </div>
  )

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22c55e20', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px', boxShadow: '0 0 30px #22c55e44' }}>🔄</div>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Renewal Submitted!</div>
        <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
          Your renewal payment is under review. Once confirmed your IP will be extended by 30 days.
        </div>
        <button onClick={() => navigate('/resources')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '12px', padding: '13px 28px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', width: '100%' }}>
          View My IPs
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif", paddingBottom: '30px' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>←</button>
        <div>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>Renew IP</h1>
          <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>Extend your IP for another 30 days</div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* IP Summary */}
        {order && (
          <div style={{ background: `linear-gradient(145deg,${tier.color}18,#0d0d18)`, border: `1px solid ${tier.color}33`, borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Renewing IP</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{order.city}, {order.country}</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{order.tier?.toUpperCase()} · {order.ipType}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: tier.accent, fontSize: '20px', fontWeight: 900 }}>${tier.price}</div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>renewal fee</div>
              </div>
            </div>

            {/* IP Address */}
            {order.ipAddress && (
              <div style={{ background: '#000000aa', border: `1px solid ${tier.color}33`, borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>CURRENT IP</div>
                <div style={{ color: tier.accent, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>{order.ipAddress}</div>
              </div>
            )}

            {/* Expiry */}
            {order.expiryDate && (
              <div style={{ marginTop: '10px', background: '#f59e0b10', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '11px' }}>Expires</span>
                <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700 }}>
                  {order.expiryDate?.toDate
                    ? order.expiryDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(order.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Crypto selector */}
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Pay with Crypto</div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {CRYPTO_OPTIONS.map(c => (
              <button key={c.id} onClick={() => setCryptoType(c.id)} style={{
                flex: 1, background: cryptoType === c.id ? `${c.color}22` : '#ffffff08',
                border: `1px solid ${cryptoType === c.id ? c.color + '55' : '#ffffff12'}`,
                color: cryptoType === c.id ? c.color : '#9ca3af',
                borderRadius: '10px', padding: '10px 6px', cursor: 'pointer',
                fontWeight: cryptoType === c.id ? 700 : 400,
                fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}>
                <span style={{ fontSize: '18px' }}>{c.icon}</span>
                <span>{c.symbol}</span>
              </button>
            ))}
          </div>

          {/* Wallet address */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Send {selectedCrypto?.symbol} to this address
            </div>
            <div style={{ background: '#000000aa', border: `1px solid ${selectedCrypto?.color}33`, borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, color: selectedCrypto?.color, fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                {walletAddress}
              </div>
              <button
                onClick={() => handleCopy(walletAddress)}
                style={{ background: copied ? '#22c55e22' : `${selectedCrypto?.color}22`, border: `1px solid ${copied ? '#22c55e55' : selectedCrypto?.color + '44'}`, color: copied ? '#4ade80' : selectedCrypto?.color, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '5px' }}>Network: {selectedCrypto?.network}</div>
          </div>

          {/* Amount */}
          <div style={{ background: `${selectedCrypto?.color}10`, border: `1px solid ${selectedCrypto?.color}33`, borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Amount to send</span>
            <span style={{ color: selectedCrypto?.color, fontWeight: 800, fontSize: '16px' }}>${tier.price} USD</span>
          </div>

          {/* TXID */}
          <div>
            <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Transaction ID (TXID)
            </label>
            <input
              value={txid} onChange={e => setTxid(e.target.value)}
              placeholder="Paste your transaction hash here…"
              style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
          </div>
        </div>

        {/* Screenshot */}
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
            Payment Screenshot <span style={{ color: '#ef4444', fontSize: '11px' }}>*required</span>
          </div>
          <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '12px' }}>Upload proof of your renewal payment</div>

          {preview ? (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={preview} alt="Proof" style={{ width: '100%', borderRadius: '10px', border: '1px solid #ffffff12', maxHeight: '200px', objectFit: 'cover' }} />
              <button onClick={() => { setScreenshot(null); setPreview(null) }} style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                Remove
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff06', border: '2px dashed #ffffff15', borderRadius: '12px', padding: '28px', cursor: 'pointer', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>📸</span>
              <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>Tap to upload screenshot</span>
              <span style={{ color: '#374151', fontSize: '10px' }}>JPG, PNG supported</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {error && (
          <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            background: submitting ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', color: '#fff', borderRadius: '12px',
            padding: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 900, fontSize: '15px',
          }}
        >
          {submitting ? 'Submitting…' : '🔄 Submit Renewal'}
        </button>

        <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
          Renewal is reviewed within 1–24 hours. Your IP will be extended by 30 days once confirmed.
        </div>
      </div>
    </div>
  )
}