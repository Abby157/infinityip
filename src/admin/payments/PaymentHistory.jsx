import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { sendIPApprovedEmail, sendIPRejectedEmail } from '../../services/emailService'

const STATUS_CONFIG = {
  under_review: { label: 'Under Review', color: '#6366f1', bg: '#6366f118' },
  approved:     { label: 'Approved',     color: '#22c55e', bg: '#22c55e18' },
  rejected:     { label: 'Rejected',     color: '#ef4444', bg: '#ef444418' },
}

const CRYPTO_ICONS = { BTC: '₿', ETH: 'Ξ', USDT: '₮' }

const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generateIP = () => {
  const ranges = [
    () => `104.${r(16,31)}.${r(0,255)}.${r(1,254)}`,
    () => `172.${r(64,95)}.${r(0,255)}.${r(1,254)}`,
    () => `185.${r(0,255)}.${r(0,255)}.${r(1,254)}`,
    () => `45.${r(32,63)}.${r(0,255)}.${r(1,254)}`,
    () => `23.${r(32,95)}.${r(0,255)}.${r(1,254)}`,
  ]
  return ranges[Math.floor(Math.random() * ranges.length)]()
}

export default function PaymentHistory() {
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')
  const [selected,  setSelected]  = useState(null)
  const [acting,    setActing]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [imgModal,  setImgModal]  = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const approve = async (payment) => {
    setActing(true)
    try {
      const ip = generateIP()
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      const expiryStr = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

      await updateDoc(doc(db, 'payments', payment.id), {
        status:     'approved',
        approvedAt: serverTimestamp(),
      })

      if (payment.orderId) {
        await updateDoc(doc(db, 'orders', payment.orderId), {
          status:          'active',
          paymentStatus:   'paid',
          ipAddress:       ip,
          approvedAt:      serverTimestamp(),
          expiryDate:      expiryDate,
          renewalStatus:   'active',
          expiryAlertSent: false,
          updatedAt:       serverTimestamp(),
        })
      }

      await addDoc(collection(db, 'notifications'), {
        userId:    payment.userId,
        type:      'payment',
        title:     'Payment Approved ✅',
        message:   `Your payment of $${payment.amount} has been approved. Your IP ${ip} is now active and expires on ${expiryStr}.`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      await sendIPApprovedEmail({
        toEmail:    payment.userEmail,
        toName:     payment.userEmail?.split('@')[0],
        ipAddress:  ip,
        city:       payment.city    || '',
        country:    payment.country || '',
        tier:       payment.tier    || '',
        expiryDate: expiryStr,
      })

      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'approved' } : p))
      setSelected(null)
      showToast(`✅ Payment approved — IP ${ip} assigned`)
    } catch (err) {
      console.error(err)
      showToast('❌ Error approving payment')
    }
    setActing(false)
  }

  const reject = async (payment) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status:     'rejected',
        rejectedAt: serverTimestamp(),
      })

      if (payment.orderId) {
        await updateDoc(doc(db, 'orders', payment.orderId), {
          status:    'rejected',
          updatedAt: serverTimestamp(),
        })
      }

      await addDoc(collection(db, 'notifications'), {
        userId:    payment.userId,
        type:      'alert',
        title:     'Payment Rejected ❌',
        message:   `Your payment of $${payment.amount} was rejected. Please contact support for assistance.`,
        read:      false,
        createdAt: serverTimestamp(),
      })

      await sendIPRejectedEmail({
        toEmail: payment.userEmail,
        toName:  payment.userEmail?.split('@')[0],
        city:    payment.city    || '',
        country: payment.country || '',
        reason:  'Payment could not be verified.',
      })

      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'rejected' } : p))
      setSelected(null)
      showToast('❌ Payment rejected')
    } catch (err) {
      console.error(err)
      showToast('❌ Error rejecting payment')
    }
    setActing(false)
  }

  const tabs = ['all', 'under_review', 'approved', 'rejected']
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const pendingCount = payments.filter(p => p.status === 'under_review').length

  return (
    <div style={{ padding: '14px 16px' }}>

      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ background: '#6366f110', border: '1px solid #6366f133', borderRadius: '12px', padding: '11px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px' }}>💳</span>
          <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: 600 }}>
            {pendingCount} payment{pendingCount > 1 ? 's' : ''} waiting for review
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const count  = tab === 'all' ? payments.length : payments.filter(p => p.status === tab).length
          const active = filter === tab
          return (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              background: active ? '#6366f118' : '#ffffff08',
              border: `1px solid ${active ? '#6366f144' : '#ffffff12'}`,
              color: active ? '#818cf8' : '#9ca3af',
              borderRadius: '20px', padding: '5px 12px',
              fontSize: '11px', fontWeight: active ? 700 : 400, cursor: 'pointer',
            }}>
              {tab.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '14px', alignItems: 'start' }}>

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#4b5563' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💳</div>
              <div style={{ fontSize: '13px' }}>No payments found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(payment => {
                const sc        = STATUS_CONFIG[payment.status] || STATUS_CONFIG.under_review
                const date      = payment.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || '—'
                const isSel     = selected?.id === payment.id
                const isRenewal = !!payment.txid && !payment.method

                return (
                  <div
                    key={payment.id}
                    onClick={() => setSelected(isSel ? null : payment)}
                    style={{
                      background: isSel ? 'linear-gradient(145deg,#1a1a2e,#16213e)' : 'linear-gradient(145deg,#13131f,#0d0d18)',
                      border: `1px solid ${isSel ? '#6366f144' : '#ffffff0d'}`,
                      borderRadius: '12px', padding: '12px 16px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f115', border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {payment.method === 'giftcard' ? '🎁' : CRYPTO_ICONS[payment.currency] || '💳'}
                    </div>

                    <div style={{ flex: 1, minWidth: '130px' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                        {payment.userEmail}
                      </div>
                      <div style={{ color: '#4b5563', fontSize: '11px' }}>
                        {payment.method === 'giftcard' ? '🎁 Gift Card' : `${payment.currency} · ${payment.cryptoType?.toUpperCase() || ''}`}
                        {' · '}{isRenewal ? 'Renewal' : 'New Order'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>${payment.amount?.toLocaleString()}</div>
                      <div style={{ color: '#4b5563', fontSize: '10px' }}>{date}</div>
                    </div>

                    <div style={{ background: sc.bg, border: `1px solid ${sc.color}44`, borderRadius: '20px', padding: '3px 10px', color: sc.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {sc.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f122', borderRadius: '16px', padding: '18px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '13px' }}>Payment Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Payment ID', value: selected.id.slice(0,12)+'…' },
                { label: 'User',       value: selected.userEmail },
                { label: 'Method',     value: selected.method === 'giftcard' ? '🎁 Gift Card' : `₿ Crypto (${selected.currency})` },
                { label: 'Amount',     value: `$${selected.amount?.toLocaleString()}` },
                { label: 'Status',     value: selected.status?.replace('_',' ') },
                { label: 'Submitted',  value: selected.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, textAlign: 'right', maxWidth: '180px', wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}

              {selected.txid && (
                <div style={{ background: '#ffffff05', border: '1px solid #ffffff0a', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Transaction ID</div>
                  <div style={{ color: '#818cf8', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selected.txid}</div>
                </div>
              )}

              {selected.cardCode && (
                <div style={{ background: '#ffffff05', border: '1px solid #ffffff0a', borderRadius: '8px', padding: '8px 10px', marginTop: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Gift Card Code</div>
                  <div style={{ color: '#fbbf24', fontSize: '13px', fontFamily: 'monospace', fontWeight: 700 }}>{selected.cardCode}</div>
                </div>
              )}
            </div>

            {selected.screenshotURL && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Payment Screenshot</div>
                <img
                  src={selected.screenshotURL}
                  alt="Payment proof"
                  onClick={() => setImgModal(selected.screenshotURL)}
                  style={{ width: '100%', borderRadius: '10px', border: '1px solid #ffffff15', maxHeight: '200px', objectFit: 'cover', cursor: 'zoom-in' }}
                />
                <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>Tap to enlarge</div>
              </div>
            )}

            {selected.status === 'under_review' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => approve(selected)} disabled={acting} style={{ background: acting ? '#22c55e30' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '13px' }}>
                  {acting ? 'Processing…' : '✅ Approve Payment'}
                </button>
                <button onClick={() => reject(selected)} disabled={acting} style={{ background: '#ef444418', border: '1px solid #ef444433', color: '#f87171', borderRadius: '10px', padding: '10px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px' }}>
                  ❌ Reject Payment
                </button>
              </div>
            )}

            {selected.status === 'approved' && (
              <div style={{ background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
                ✅ Payment approved
              </div>
            )}

            {selected.status === 'rejected' && (
              <div style={{ background: '#ef444410', border: '1px solid #ef444433', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#f87171', fontSize: '13px', fontWeight: 600 }}>
                ❌ Payment rejected
              </div>
            )}
          </div>
        )}
      </div>

      {imgModal && (
        <div
          onClick={() => setImgModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <img src={imgModal} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
          <button onClick={() => setImgModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#ffffff15', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}
    </div>
  )
}