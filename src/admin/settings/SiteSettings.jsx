import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

const Section = ({ title, subtitle, children }) => (
  <div style={{
    background: 'linear-gradient(145deg,#13131f,#0d0d18)',
    border: '1px solid #ffffff0d', borderRadius: '16px',
    padding: '22px', marginBottom: '14px',
  }}>
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ color: '#4b5563', fontSize: '11px', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
)

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </label>
    {children}
    {hint && <div style={{ color: '#374151', fontSize: '10px', marginTop: '4px' }}>{hint}</div>}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', mono }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{
      width: '100%', background: '#ffffff08', border: '1px solid #ffffff12',
      borderRadius: '10px', padding: '10px 14px', color: '#fff',
      fontSize: '13px', outline: 'none', boxSizing: 'border-box',
      fontFamily: mono ? 'monospace' : 'inherit',
    }}
  />
)

const Toggle = ({ value, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ffffff06' }}>
    <span style={{ color: '#d1d5db', fontSize: '13px' }}>{label}</span>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '42px', height: '24px', borderRadius: '99px',
        background: value ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#ffffff15',
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px',
        left: value ? '21px' : '3px', transition: 'left 0.2s',
      }} />
    </button>
  </div>
)

export default function SiteSettings() {
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')

  // General
  const [siteName,    setSiteName]    = useState('Infinity IP')
  const [siteTagline, setSiteTagline] = useState('Unlimited Connections, Infinite Possibilities')
  const [supportEmail,setSupportEmail]= useState('support@infinityip.com')

  // Pricing
  const [priceLow,      setPriceLow]      = useState(220)
  const [priceStandard, setPriceStandard] = useState(280)
  const [priceStrong,   setPriceStrong]   = useState(350)
  const [priceElite,    setPriceElite]    = useState(500)

  // Crypto wallets
  const [btcAddress,  setBtcAddress]  = useState('')
  const [ethAddress,  setEthAddress]  = useState('')
  const [usdtAddress, setUsdtAddress] = useState('')

  // Toggles
  const [maintenanceMode,   setMaintenanceMode]   = useState(false)
  const [registrationOpen,  setRegistrationOpen]  = useState(true)
  const [marketplaceActive, setMarketplaceActive] = useState(true)
  const [cryptoPayments,    setCryptoPayments]    = useState(true)
  const [giftCardPayments,  setGiftCardPayments]  = useState(true)
  const [emailNotifications,setEmailNotifications]= useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'settings', 'site'))
      if (snap.exists()) {
        const d = snap.data()
        setSiteName(d.siteName || 'Infinity IP')
        setSiteTagline(d.siteTagline || 'Unlimited Connections, Infinite Possibilities')
        setSupportEmail(d.supportEmail || 'support@infinityip.com')
        setPriceLow(d.priceLow || 220)
        setPriceStandard(d.priceStandard || 280)
        setPriceStrong(d.priceStrong || 350)
        setPriceElite(d.priceElite || 500)
        setBtcAddress(d.btcAddress || '')
        setEthAddress(d.ethAddress || '')
        setUsdtAddress(d.usdtAddress || '')
        setMaintenanceMode(d.maintenanceMode || false)
        setRegistrationOpen(d.registrationOpen ?? true)
        setMarketplaceActive(d.marketplaceActive ?? true)
        setCryptoPayments(d.cryptoPayments ?? true)
        setGiftCardPayments(d.giftCardPayments ?? true)
        setEmailNotifications(d.emailNotifications ?? true)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        siteName, siteTagline, supportEmail,
        priceLow:      Number(priceLow),
        priceStandard: Number(priceStandard),
        priceStrong:   Number(priceStrong),
        priceElite:    Number(priceElite),
        btcAddress, ethAddress, usdtAddress,
        maintenanceMode, registrationOpen,
        marketplaceActive, cryptoPayments,
        giftCardPayments, emailNotifications,
        updatedAt: serverTimestamp(),
      })
      setToast('✅ Settings saved successfully')
    } catch (err) {
      console.error(err)
      setToast('❌ Failed to save settings')
    }
    setSaving(false)
    setTimeout(() => setToast(''), 3000)
  }

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>Loading settings…</div>
  )

  return (
    <div style={{ padding: '14px 16px', maxWidth: '720px' }}>

      {toast && (
        <div style={{
          background: toast.includes('✅') ? '#22c55e18' : '#ef444418',
          border: `1px solid ${toast.includes('✅') ? '#22c55e44' : '#ef444444'}`,
          borderRadius: '10px', padding: '10px 16px', marginBottom: '16px',
          color: toast.includes('✅') ? '#4ade80' : '#f87171',
          fontSize: '13px', fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* General */}
      <Section title="General Settings" subtitle="Basic site configuration">
        <Field label="Site Name">
          <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Infinity IP" />
        </Field>
        <Field label="Tagline">
          <Input value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="Tagline" />
        </Field>
        <Field label="Support Email">
          <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@infinityip.com" type="email" />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title="Tier Pricing" subtitle="Set prices for each IP tier (USD/month)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Low — $', value: priceLow,      set: setPriceLow,      color: '#6b7280' },
            { label: 'Standard — $', value: priceStandard, set: setPriceStandard, color: '#3b82f6' },
            { label: 'Strong — $', value: priceStrong,   set: setPriceStrong,   color: '#8b5cf6' },
            { label: 'Elite — $', value: priceElite,    set: setPriceElite,    color: '#f59e0b' },
          ].map(tier => (
            <div key={tier.label}>
              <label style={{ color: tier.color, fontSize: '11px', display: 'block', marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {tier.label}
              </label>
              <input
                type="number" value={tier.value}
                onChange={e => tier.set(e.target.value)}
                style={{ width: '100%', background: '#ffffff08', border: `1px solid ${tier.color}33`, borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Crypto wallets */}
      <Section title="Crypto Payment Addresses" subtitle="Wallets where users send their payments">
        <Field label="Bitcoin (BTC)" hint="Used for BTC payments">
          <Input value={btcAddress} onChange={e => setBtcAddress(e.target.value)} placeholder="bc1q…" mono />
        </Field>
        <Field label="Ethereum (ETH)" hint="Used for ETH payments">
          <Input value={ethAddress} onChange={e => setEthAddress(e.target.value)} placeholder="0x…" mono />
        </Field>
        <Field label="Tether (USDT)" hint="Used for USDT payments">
          <Input value={usdtAddress} onChange={e => setUsdtAddress(e.target.value)} placeholder="T…" mono />
        </Field>
      </Section>

      {/* Site controls */}
      <Section title="Site Controls" subtitle="Toggle features and site availability">
        <Toggle value={maintenanceMode}    onChange={setMaintenanceMode}    label="🔧 Maintenance Mode" />
        <Toggle value={registrationOpen}   onChange={setRegistrationOpen}   label="📝 User Registration Open" />
        <Toggle value={marketplaceActive}  onChange={setMarketplaceActive}  label="🌐 Marketplace Active" />
        <Toggle value={cryptoPayments}     onChange={setCryptoPayments}     label="₿ Crypto Payments Enabled" />
        <Toggle value={giftCardPayments}   onChange={setGiftCardPayments}   label="🎁 Gift Card Payments Enabled" />
        <Toggle value={emailNotifications} onChange={setEmailNotifications} label="📧 Email Notifications Enabled" />
      </Section>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        style={{
          width: '100%',
          background: saving
            ? '#f59e0b50'
            : 'linear-gradient(135deg,#f59e0b,#d97706)',
          border: 'none', color: '#000', borderRadius: '12px',
          padding: '14px', cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 900, fontSize: '15px', letterSpacing: '0.2px',
          marginBottom: '28px',
        }}
      >
        {saving ? 'Saving…' : '⚙️ Save All Settings'}
      </button>
    </div>
  )
}