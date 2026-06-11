import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
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

const generateCode = (name) => {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X')
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `${prefix}-${suffix}`
}

export default function Resellers() {
  const [resellers,    setResellers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [selected,     setSelected]     = useState(null)
  const [showForm,     setShowForm]     = useState(false)
  const [acting,       setActing]       = useState(false)
  const [toast,        setToast]        = useState('')
  const [copied,       setCopied]       = useState('')

  // Form state
  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    prices:  { low: '', standard: '', strong: '', elite: '' },
    wallets: { btc: '', eth: '', usdt: '' },
  })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'resellers'))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Count users per reseller
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs.map(d => d.data())

      const withCounts = data.map(r => ({
        ...r,
        userCount: users.filter(u => u.resellerCode === r.code).length,
      }))

      setResellers(withCounts)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

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

  const resetForm = () => setForm({
    name: '', email: '', phone: '',
    prices:  { low: '', standard: '', strong: '', elite: '' },
    wallets: { btc: '', eth: '', usdt: '' },
  })

  const handleCreate = async () => {
    if (!form.name.trim()) return showToast('❌ Name is required')
    setActing(true)
    try {
      const code = generateCode(form.name)

      const prices = {}
      TIERS.forEach(t => {
        const v = parseFloat(form.prices[t.id])
        if (!isNaN(v) && v > 0) prices[t.id] = v
        else prices[t.id] = t.default
      })

      const wallets = {}
      CRYPTOS.forEach(c => {
        if (form.wallets[c.id]?.trim()) wallets[c.id] = form.wallets[c.id].trim()
      })

      await addDoc(collection(db, 'resellers'), {
        name:      form.name.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim(),
        code,
        prices,
        wallets,
        active:    true,
        createdAt: serverTimestamp(),
      })

      showToast(`✅ Reseller created — Code: ${code}`)
      resetForm()
      setShowForm(false)
      load()
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const handleUpdate = async () => {
    if (!selected) return
    setActing(true)
    try {
      const prices = {}
      TIERS.forEach(t => {
        const v = parseFloat(form.prices[t.id])
        prices[t.id] = (!isNaN(v) && v > 0) ? v : t.default
      })

      const wallets = {}
      CRYPTOS.forEach(c => {
        if (form.wallets[c.id]?.trim()) wallets[c.id] = form.wallets[c.id].trim()
      })

      await updateDoc(doc(db, 'resellers', selected.id), {
        name:      form.name.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim(),
        prices,
        wallets,
        updatedAt: serverTimestamp(),
      })

      showToast('✅ Reseller updated')
      setSelected(null)
      setShowForm(false)
      resetForm()
      load()
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const toggleActive = async (reseller) => {
    setActing(true)
    try {
      await updateDoc(doc(db, 'resellers', reseller.id), {
        active: !reseller.active,
        updatedAt: serverTimestamp(),
      })
      showToast(reseller.active ? '🚫 Reseller deactivated' : '✅ Reseller activated')
      load()
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const handleDelete = async (reseller) => {
    if (!window.confirm(`Delete reseller ${reseller.name}? This cannot be undone.`)) return
    setActing(true)
    try {
      await deleteDoc(doc(db, 'resellers', reseller.id))
      showToast('✅ Reseller deleted')
      setSelected(null)
      load()
    } catch (err) { console.error(err) }
    setActing(false)
  }

  const openEdit = (reseller) => {
    setSelected(reseller)
    setForm({
      name:    reseller.name || '',
      email:   reseller.email || '',
      phone:   reseller.phone || '',
      prices:  {
        low:      reseller.prices?.low      || '',
        standard: reseller.prices?.standard || '',
        strong:   reseller.prices?.strong   || '',
        elite:    reseller.prices?.elite    || '',
      },
      wallets: {
        btc:  reseller.wallets?.btc  || '',
        eth:  reseller.wallets?.eth  || '',
        usdt: reseller.wallets?.usdt || '',
      },
    })
    setShowForm(true)
  }

  const signupLink = (code) => `${window.location.origin}/signup?ref=${code}`

  return (
    <div style={{ padding: '14px 16px' }}>

      {toast && (
        <div style={{ background: '#13131f', border: '1px solid #ffffff15', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 900 }}>🤝 Resellers</div>
          <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>{resellers.length} resellers · unlimited users</div>
        </div>
        <button
          onClick={() => { resetForm(); setSelected(null); setShowForm(true) }}
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
        >
          + Add Reseller
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total',    value: resellers.length,                              color: '#818cf8' },
          { label: 'Active',   value: resellers.filter(r => r.active).length,        color: '#22c55e' },
          { label: 'Users',    value: resellers.reduce((s, r) => s + (r.userCount || 0), 0), color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: '18px' }}>{s.value}</div>
            <div style={{ color: '#4b5563', fontSize: '10px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #6366f133', borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '13px' }}>
              {selected ? `Edit — ${selected.name}` : 'New Reseller'}
            </div>
            <button onClick={() => { setShowForm(false); setSelected(null); resetForm() }} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>×</button>
          </div>

          {/* Basic info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {[
              { key: 'name',  label: 'Full Name *',    placeholder: 'e.g. John Doe' },
              { key: 'email', label: 'Email',          placeholder: 'john@email.com' },
              { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+1 234 567 8900' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          {/* Custom prices */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Prices per Tier</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TIERS.map(tier => (
                <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '64px', background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '6px', padding: '4px 8px', textAlign: 'center' }}>
                    <span style={{ color: tier.color, fontSize: '10px', fontWeight: 700 }}>{tier.label}</span>
                  </div>
                  <input
                    value={form.prices[tier.id]}
                    onChange={e => setForm(p => ({ ...p, prices: { ...p.prices, [tier.id]: e.target.value } }))}
                    placeholder={`Default $${tier.default}`}
                    type="number"
                    style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '8px', padding: '7px 10px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Custom wallets */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '10px', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wallet Addresses</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CRYPTOS.map(c => (
                <div key={c.id}>
                  <div style={{ color: c.color, fontSize: '10px', fontWeight: 700, marginBottom: '3px' }}>{c.icon} {c.label}</div>
                  <input
                    value={form.wallets[c.id]}
                    onChange={e => setForm(p => ({ ...p, wallets: { ...p.wallets, [c.id]: e.target.value } }))}
                    placeholder={`Enter ${c.label} wallet address…`}
                    style={{ width: '100%', background: '#ffffff08', border: `1px solid ${c.color}33`, borderRadius: '8px', padding: '7px 10px', color: '#fff', fontSize: '11px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={selected ? handleUpdate : handleCreate}
            disabled={acting}
            style={{ width: '100%', background: acting ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px', cursor: acting ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '13px' }}
          >
            {acting ? 'Saving…' : selected ? '💾 Update Reseller' : '✅ Create Reseller'}
          </button>
        </div>
      )}

      {/* Reseller list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>Loading…</div>
      ) : resellers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤝</div>
          <div style={{ color: '#6b7280', fontSize: '13px' }}>No resellers yet</div>
          <div style={{ color: '#374151', fontSize: '11px', marginTop: '4px' }}>Add your first reseller above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {resellers.map(reseller => (
            <div key={reseller.id} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: `1px solid ${reseller.active ? '#6366f133' : '#ffffff0d'}`, borderRadius: '14px', padding: '14px', opacity: reseller.active ? 1 : 0.6 }}>

              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {reseller.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{reseller.name}</div>
                    <div style={{ color: '#4b5563', fontSize: '11px' }}>{reseller.email || reseller.phone || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ background: reseller.active ? '#22c55e18' : '#ef444418', border: `1px solid ${reseller.active ? '#22c55e33' : '#ef444433'}`, borderRadius: '20px', padding: '2px 8px', color: reseller.active ? '#4ade80' : '#f87171', fontSize: '9px', fontWeight: 700 }}>
                    {reseller.active ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  <div style={{ background: '#6366f118', border: '1px solid #6366f133', borderRadius: '20px', padding: '2px 8px', color: '#818cf8', fontSize: '9px', fontWeight: 700 }}>
                    {reseller.userCount || 0} users
                  </div>
                </div>
              </div>

              {/* Code + link */}
              <div style={{ background: '#000000aa', border: '1px solid #ffffff0d', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Referral Code</span>
                  <button
                    onClick={() => handleCopy(reseller.code, `code-${reseller.id}`)}
                    style={{ background: 'none', border: 'none', color: copied === `code-${reseller.id}` ? '#4ade80' : '#818cf8', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {copied === `code-${reseller.id}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ color: '#818cf8', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>{reseller.code}</div>
              </div>

              <div style={{ background: '#000000aa', border: '1px solid #ffffff0d', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signup Link</span>
                  <button
                    onClick={() => handleCopy(signupLink(reseller.code), `link-${reseller.id}`)}
                    style={{ background: 'none', border: 'none', color: copied === `link-${reseller.id}` ? '#4ade80' : '#818cf8', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {copied === `link-${reseller.id}` ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{signupLink(reseller.code)}</div>
              </div>

              {/* Prices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                {TIERS.map(tier => (
                  <div key={tier.id} style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}33`, borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                    <div style={{ color: tier.color, fontSize: '9px', fontWeight: 700 }}>{tier.label}</div>
                    <div style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>${reseller.prices?.[tier.id] || tier.default}</div>
                  </div>
                ))}
              </div>

              {/* Wallet status */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {CRYPTOS.map(c => (
                  <div key={c.id} style={{ background: reseller.wallets?.[c.id] ? `${c.color}15` : '#ffffff08', border: `1px solid ${reseller.wallets?.[c.id] ? c.color + '33' : '#ffffff12'}`, borderRadius: '6px', padding: '3px 8px', fontSize: '10px', color: reseller.wallets?.[c.id] ? c.color : '#4b5563', fontWeight: 600 }}>
                    {c.icon} {reseller.wallets?.[c.id] ? '✓' : '—'}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEdit(reseller)} style={{ flex: 1, background: '#6366f115', border: '1px solid #6366f133', color: '#818cf8', borderRadius: '8px', padding: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => toggleActive(reseller)} disabled={acting} style={{ flex: 1, background: reseller.active ? '#f59e0b15' : '#22c55e15', border: `1px solid ${reseller.active ? '#f59e0b33' : '#22c55e33'}`, color: reseller.active ? '#fbbf24' : '#4ade80', borderRadius: '8px', padding: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>
                  {reseller.active ? '⏸ Pause' : '▶️ Activate'}
                </button>
                <button onClick={() => handleDelete(reseller)} disabled={acting} style={{ background: '#ef444415', border: '1px solid #ef444433', color: '#f87171', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}