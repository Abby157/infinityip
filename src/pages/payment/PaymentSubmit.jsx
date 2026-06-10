import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import { sendPaymentReceivedEmail } from '../../services/emailService'

const CRYPTO_OPTIONS = [
  { id: 'btc',  label: 'Bitcoin',  symbol: 'BTC',  icon: '₿', color: '#f59e0b', network: 'Bitcoin Network' },
  { id: 'eth',  label: 'Ethereum', symbol: 'ETH',  icon: 'Ξ', color: '#6366f1', network: 'ERC-20' },
  { id: 'usdt', label: 'Tether',   symbol: 'USDT', icon: '₮', color: '#22c55e', network: 'TRC-20 / ERC-20' },
]

const GIFT_CARD_OPTIONS = [
  { id: 'apple', label: 'Apple Gift Card', icon: '🍎', color: '#9ca3af' },
  { id: 'steam', label: 'Steam Gift Card', icon: '🎮', color: '#1b2838' },
  { id: 'razer', label: 'Razer Gold',      icon: '💚', color: '#00d448' },
]

export default function PaymentSubmit() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const orderId    = location.state?.orderId || null

  const [order,          setOrder]          = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [method,         setMethod]         = useState('crypto')
  const [cryptoType,     setCryptoType]     = useState('btc')
  const [giftType,       setGiftType]       = useState('apple')
  const [txid,           setTxid]           = useState('')
  const [cardCode,       setCardCode]       = useState('')
  const [screenshot,     setScreenshot]     = useState(null)
  const [preview,        setPreview]        = useState(null)
  const [submitting,     setSubmitting]     = useState(false)
  const [success,        setSuccess]        = useState(false)
  const [error,          setError]          = useState('')
  const [wallets,        setWallets]        = useState({})
  const [copied,         setCopied]         = useState(false)
  const [customPrices,   setCustomPrices]   = useState(null)
  const [hasCustomWallet,setHasCustomWallet]= useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        // Load site settings for default wallet addresses
        const settingsSnap = await getDoc(doc(db, 'settings', 'site'))
        if (settingsSnap.exists()) {
          const d = settingsSnap.data()
          setWallets({
            btc:  d.btcAddress  || 'bc1qmwt97a72cmwvkkqq9zervfqd8j43nm7mqdv5ze',
            eth:  d.ethAddress  || '0x742d35Cc6634C0532925a3b8D4C9B9cA6e5B8Fa',
            usdt: d.usdtAddress || 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
          })
        }

        // Load user's custom wallets and prices if set by admin
        if (user?.uid) {
          const userSnap = await getDoc(doc(db, 'users', user.uid))
          if (userSnap.exists()) {
            const userData = userSnap.data()

            // Custom wallets per crypto — overrides defaults
            if (userData.customWallets && Object.keys(userData.customWallets).length > 0) {
              setWallets(prev => ({
                btc:  userData.customWallets.btc  || prev.btc,
                eth:  userData.customWallets.eth  || prev.eth,
                usdt: userData.customWallets.usdt || prev.usdt,
              }))
              setHasCustomWallet(true)
            }

            // Custom prices per tier
            if (userData.customPrices && Object.keys(userData.customPrices).length > 0) {
              setCustomPrices(userData.customPrices)
            }
          }
        }

        // Load order
        if (orderId) {
          const orderSnap = await getDoc(doc(db, 'orders', orderId))
          if (orderSnap.exists()) setOrder({ id: orderSnap.id, ...orderSnap.data() })
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [orderId, user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleCopy = (text) => {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      el.style.top = '-9999px'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) { console.error('Copy failed', err) }
  }

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod)
    setError('')
    setTxid('')
    setCardCode('')
  }

  // Use custom price for this tier if set, otherwise use order price
  const displayPrice = (customPrices && order?.tier && customPrices[order.tier])
    ? customPrices[order.tier]
    : order?.price || 0

  const hasCustomPrice = customPrices && order?.tier && customPrices[order.tier]

  const handleSubmit = async () => {
    setError('')

    if (!screenshot)
      return setError('Please upload a screenshot as proof of payment.')

    setSubmitting(true)
    try {
      const fileRef = ref(storage, `payments/${user.uid}/${Date.now()}_${screenshot.name}`)
      await uploadBytes(fileRef, screenshot)
      const screenshotURL = await getDownloadURL(fileRef)

      const paymentData = {
        userId:       user.uid,
        userEmail:    user.email,
        orderId:      orderId || null,
        method,
        amount:       displayPrice,
        currency:     method === 'crypto' ? cryptoType.toUpperCase() : giftType,
        screenshotURL,
        status:       'under_review',
        createdAt:    serverTimestamp(),
        ...(method === 'crypto'   ? { txid: txid.trim(), cryptoType } : {}),
        ...(method === 'giftcard' ? { cardCode: cardCode.trim(), giftCardType: giftType } : {}),
      }

      await addDoc(collection(db, 'payments'), paymentData)

      if (orderId) {
        await updateDoc(doc(db, 'orders', orderId), {
          status:        'under_review',
          paymentStatus: 'submitted',
          updatedAt:     serverTimestamp(),
        })
      }

      await addDoc(collection(db, 'notifications'), {
        userId:    'admin',
        type:      'payment',
        title:     'New Payment Submitted 💳',
        message:   `${user.email} submitted a ${method} payment of $${displayPrice}`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      await addDoc(collection(db, 'notifications'), {
        userId:    user.uid,
        type:      'payment',
        title:     'Payment Submitted ✅',
        message:   `Your payment of $${displayPrice} has been submitted and is under review.`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      await sendPaymentReceivedEmail({
        toEmail: user.email,
        toName:  user.email.split('@')[0],
        amount:  displayPrice,
        tier:    order?.tier,
        city:    order?.city,
      })

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit payment. Please try again.')
    }
    setSubmitting(false)
  }

  const selectedCrypto = CRYPTO_OPTIONS.find(c => c.id === cryptoType)
  const walletAddress  = wallets[cryptoType] || '—'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      Loading…
    </div>
  )

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#22c55e20', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px', boxShadow: '0 0 30px #22c55e44' }}>✓</div>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Payment Submitted!</div>
        <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
          Your payment is under review. Our team will verify it within 1–24 hours. You'll receive a notification once approved.
        </div>
        <button onClick={() => navigate('/transactions')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '12px', padding: '13px 28px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', width: '100%' }}>
          View My Orders
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
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: 0 }}>Submit Payment</h1>
          <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>Complete your order payment</div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Order summary */}
        {order && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f133', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Order Summary</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{order.city}, {order.country}</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{order.tier?.toUpperCase()} · {order.ipType}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontSize: '22px', fontWeight: 900 }}>${displayPrice?.toLocaleString()}</div>
                {hasCustomPrice ? (
                  <div style={{ color: '#22c55e', fontSize: '10px', fontWeight: 700 }}>Special Price ✨</div>
                ) : (
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>/month</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom wallet notice */}
        {hasCustomWallet && (
          <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>✨</span>
            <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>You have a dedicated payment address</span>
          </div>
        )}

        {/* Method toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'crypto',   label: '₿ Crypto' },
            { id: 'giftcard', label: '🎁 Gift Card' },
          ].map(m => (
            <button key={m.id} onClick={() => handleMethodChange(m.id)} style={{
              flex: 1,
              background: method === m.id ? '#6366f122' : '#ffffff08',
              border: `1px solid ${method === m.id ? '#6366f155' : '#ffffff12'}`,
              color: method === m.id ? '#818cf8' : '#9ca3af',
              borderRadius: '10px', padding: '11px',
              cursor: 'pointer', fontWeight: method === m.id ? 700 : 400, fontSize: '13px',
            }}>{m.label}</button>
          ))}
        </div>

        {/* Crypto */}
        {method === 'crypto' && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
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

            <div style={{ background: `${selectedCrypto?.color}10`, border: `1px solid ${selectedCrypto?.color}33`, borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Amount to send</span>
              <span style={{ color: selectedCrypto?.color, fontWeight: 800, fontSize: '16px' }}>${displayPrice?.toLocaleString()} USD</span>
            </div>

            <div>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transaction ID (TXID)
              </label>
              <input
                value={txid} onChange={e => setTxid(e.target.value)}
                placeholder="Paste your transaction hash here…"
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
              <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '4px' }}>Find this in your crypto wallet after sending</div>
            </div>
          </div>
        )}

        {/* Gift card */}
        {method === 'giftcard' && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {GIFT_CARD_OPTIONS.map(g => (
                <button key={g.id} onClick={() => setGiftType(g.id)} style={{
                  flex: 1, background: giftType === g.id ? '#6366f122' : '#ffffff08',
                  border: `1px solid ${giftType === g.id ? '#6366f155' : '#ffffff12'}`,
                  color: giftType === g.id ? '#818cf8' : '#9ca3af',
                  borderRadius: '10px', padding: '10px 6px', cursor: 'pointer',
                  fontWeight: giftType === g.id ? 700 : 400,
                  fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                }}>
                  <span style={{ fontSize: '18px' }}>{g.icon}</span>
                  <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{g.label.replace(' Gift Card', '')}</span>
                </button>
              ))}
            </div>

            <div style={{ background: '#6366f110', border: '1px solid #6366f133', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
              <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>📋 Instructions</div>
              <div style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.6 }}>
                1. Purchase a gift card worth <strong style={{ color: '#fff' }}>${displayPrice?.toLocaleString() || '—'} USD</strong><br />
                2. Upload a photo of the card <strong style={{ color: '#fff' }}>(required)</strong><br />
                3. Enter the card code below <strong style={{ color: '#6b7280' }}>(optional)</strong>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Gift Card Code <span style={{ color: '#374151' }}>(optional)</span>
              </label>
              <input
                value={cardCode} onChange={e => setCardCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '1px' }}
              />
            </div>
          </div>
        )}

        {/* Screenshot */}
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
            Payment Screenshot <span style={{ color: '#ef4444', fontSize: '11px' }}>*required</span>
          </div>
          <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '12px' }}>Upload a screenshot showing the completed payment</div>

          {preview ? (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={preview} alt="Payment proof" style={{ width: '100%', borderRadius: '10px', border: '1px solid #ffffff12', maxHeight: '200px', objectFit: 'cover' }} />
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

        {/* Error */}
        {error && (
          <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        {/* Submit */}
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
          {submitting ? 'Submitting…' : '✅ Submit Payment'}
        </button>

        <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
          Payment is reviewed within 1–24 hours. You'll receive a notification when approved.
        </div>
      </div>
    </div>
  )
}