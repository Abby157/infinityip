import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const TIERS = [
  { id: 'low',      label: 'Low',      default: 220, color: '#6b7280', accent: '#9ca3af' },
  { id: 'standard', label: 'Standard', default: 280, color: '#3b82f6', accent: '#60a5fa' },
  { id: 'strong',   label: 'Strong',   default: 350, color: '#8b5cf6', accent: '#a78bfa' },
  { id: 'elite',    label: 'Elite',    default: 500, color: '#f59e0b', accent: '#fbbf24' },
]

export default function GlobalPrices() {
  const [prices,  setPrices]  = useState({ low: '', standard: '', strong: '', elite: '' })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'globalPrices'))
        if (snap.exists()) {
          const data = snap.data()
          setPrices({
            low:      data.low      ?? '',
            standard: data.standard ?? '',
            strong:   data.strong   ?? '',
            elite:    data.elite    ?? '',
          })
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {}
      TIERS.forEach(t => {
        const v = parseFloat(prices[t.id])
        data[t.id] = (!isNaN(v) && v > 0) ? v : t.default
      })
      await setDoc(doc(db, 'settings', 'globalPrices'), data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleReset = () => {
    setPrices({ low: '', standard: '', strong: '', elite: '' })
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading…</div>
  )

  return (
    <div style={{ padding: '16px', maxWidth: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>💰 Global Prices</div>
        <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.5 }}>
          Set default prices for all users without a reseller. Reseller prices always override these.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {TIERS.map(t => (
          <div key={t.id} style={{ background: '#0d0d1a', border: `1px solid ${t.color}33`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />
                <span style={{ color: t.accent, fontWeight: 700, fontSize: '12px' }}>{t.label.toUpperCase()}</span>
              </div>
              <div style={{ color: '#4b5563', fontSize: '10px' }}>Default: ${t.default}/mo</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 700 }}>$</span>
              <input
                type="number"
                min="1"
                value={prices[t.id]}
                onChange={e => setPrices(p => ({ ...p, [t.id]: e.target.value }))}
                placeholder={t.default}
                style={{
                  width: '90px',
                  background: '#ffffff08',
                  border: `1px solid ${t.color}44`,
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                  textAlign: 'right',
                }}
              />
              <span style={{ color: '#4b5563', fontSize: '11px' }}>/mo</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b22', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '11px', color: '#9ca3af', lineHeight: 1.6 }}>
        ⚠️ Leave a field blank to use the built-in default. Changes apply immediately to all non-reseller users.
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleReset}
          style={{ flex: 1, background: '#ffffff08', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 2, background: saving ? '#f59e0b50' : 'linear-gradient(135deg,#f59e0b,#fbbf24)', border: 'none', color: '#000', borderRadius: '10px', padding: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '13px' }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Global Prices'}
        </button>
      </div>
    </div>
  )
}