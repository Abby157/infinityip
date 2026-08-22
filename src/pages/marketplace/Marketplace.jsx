import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { SHUFFLED_LISTINGS, TIERS, IP_TYPES, REGIONS, TIER_ORDER } from '../../data/marketplaceData'

const FLAG = code => `https://flagcdn.com/24x18/${code?.toLowerCase()}.png`

const availColor = (available, total) => {
  const pct = available / total
  if (pct > 0.5) return { bar: '#22c55e', text: '#4ade80' }
  if (pct > 0.2) return { bar: '#f59e0b', text: '#fbbf24' }
  return { bar: '#ef4444', text: '#f87171' }
}

// ── IP Card ───────────────────────────────────────────────────────────────────
function IPCard({ listing, onBuy, customPrices }) {
  const tier      = TIERS[listing.tier]
  const ipType    = IP_TYPES.find(t => t.id === listing.ipType)
  const avail     = availColor(listing.available, listing.total)
  const pct       = Math.round((listing.available / listing.total) * 100)
  const price     = customPrices?.[listing.tier] ?? tier.price
  const hasCustom = customPrices?.[listing.tier] != null && customPrices[listing.tier] !== tier.price

  return (
    <div style={{
      background: 'linear-gradient(145deg,#12121f,#0f0f1a)',
      border: `1px solid ${tier.color}33`,
      borderRadius: '16px', padding: '16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {listing.featured && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: `linear-gradient(135deg,${tier.color},${tier.accent})`, color: '#000', fontSize: '8px', fontWeight: 800, letterSpacing: '1px', padding: '3px 10px', borderBottomLeftRadius: '8px' }}>
          FEATURED
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <img src={FLAG(listing.countryCode)} alt="" style={{ borderRadius: '2px', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.city}</div>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>{listing.country}</div>
        </div>
        <div style={{ background: '#ffffff0d', border: '1px solid #ffffff15', borderRadius: '6px', padding: '3px 7px', fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {ipType?.icon} {ipType?.label}
        </div>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '20px', padding: '3px 10px', marginBottom: '12px' }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: tier.accent, boxShadow: `0 0 5px ${tier.accent}` }} />
        <span style={{ color: tier.accent, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>{tier.label.toUpperCase()}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
        {[
          { label: 'Trust',   value: tier.trustScore },
          { label: 'Latency', value: tier.latency },
          { label: 'Uptime',  value: tier.uptime },
        ].map(s => (
          <div key={s.label} style={{ background: '#ffffff06', borderRadius: '8px', padding: '7px 4px', textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>{s.value}</div>
            <div style={{ color: '#4b5563', fontSize: '9px', marginTop: '1px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#6b7280', fontSize: '10px' }}>Availability</span>
          <span style={{ color: avail.text, fontSize: '10px', fontWeight: 600 }}>{listing.available}/{listing.total}</span>
        </div>
        <div style={{ height: '3px', background: '#ffffff10', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: avail.bar, borderRadius: '99px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price/mo</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 900 }}>${price.toLocaleString()}</div>
            {hasCustom && <div style={{ color: '#22c55e', fontSize: '9px', fontWeight: 700 }}>✨ Special</div>}
          </div>
          {hasCustom && (
            <div style={{ color: '#4b5563', fontSize: '9px', textDecoration: 'line-through' }}>${tier.price.toLocaleString()}</div>
          )}
        </div>
        <button
          onClick={() => onBuy(listing)}
          disabled={listing.available === 0}
          style={{
            background: listing.available === 0 ? '#1f1f1f' : `linear-gradient(135deg,${tier.color},${tier.accent})`,
            color: listing.available === 0 ? '#4b5563' : '#000',
            border: 'none', borderRadius: '10px', padding: '10px 18px',
            fontWeight: 800, fontSize: '13px',
            cursor: listing.available === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {listing.available === 0 ? 'Sold Out' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}

// ── Buy Modal ─────────────────────────────────────────────────────────────────
function BuyModal({ listing, onClose, onConfirm, loading, customPrices }) {
  const tier      = TIERS[listing.tier]
  const ipType    = IP_TYPES.find(t => t.id === listing.ipType)
  const price     = customPrices?.[listing.tier] ?? tier.price
  const hasCustom = customPrices?.[listing.tier] != null && customPrices[listing.tier] !== tier.price

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{
        background: 'linear-gradient(160deg,#13131f,#0d0d18)',
        border: `1px solid ${tier.accent}33`,
        borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: '500px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px #000000aa',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: '#ffffff20' }} />
        </div>

        <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid #ffffff0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>Order Summary</div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>Review before proceeding to payment</div>
          </div>
          <button onClick={onClose} style={{ background: '#ffffff0d', border: '1px solid #ffffff10', color: '#9ca3af', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff06', border: '1px solid #ffffff0d', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <img src={FLAG(listing.countryCode)} alt="" style={{ borderRadius: '2px' }} onError={e => { e.target.style.display = 'none' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{listing.city}, {listing.country}</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>{listing.region} · {ipType?.icon} {ipType?.label}</div>
            </div>
            <div style={{ background: `${tier.color}18`, border: `1px solid ${tier.color}44`, borderRadius: '20px', padding: '2px 8px', color: tier.accent, fontSize: '10px', fontWeight: 700 }}>
              {tier.label.toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Trust Score', value: tier.trustScore },
              { label: 'Latency',     value: tier.latency },
              { label: 'Uptime SLA',  value: tier.uptime },
              { label: 'Duration',    value: '1 Month' },
            ].map(s => (
              <div key={s.label} style={{ background: '#ffffff05', border: '1px solid #ffffff0a', borderRadius: '8px', padding: '9px 12px' }}>
                <div style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>Included</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: `${tier.color}22`, border: `1px solid ${tier.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: tier.accent, flexShrink: 0 }}>✓</div>
                  <span style={{ color: '#d1d5db', fontSize: '12px' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}33`, borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>Total due</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ color: '#fff', fontSize: '26px', fontWeight: 900 }}>
                  ${price.toLocaleString()}<span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 400 }}>/mo</span>
                </div>
                {hasCustom && <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>✨ Special Price</span>}
              </div>
              {hasCustom && (
                <div style={{ color: '#4b5563', fontSize: '11px', textDecoration: 'line-through' }}>Was ${tier.price.toLocaleString()}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#6b7280', fontSize: '10px' }}>Slots left</div>
              <div style={{ color: tier.accent, fontSize: '20px', fontWeight: 800 }}>{listing.available}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button onClick={onClose} style={{ flex: 1, background: '#ffffff0a', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: '12px', padding: '13px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              Cancel
            </button>
            <button
              onClick={() => onConfirm(listing)}
              disabled={loading}
              style={{ flex: 2, background: loading ? `${tier.color}50` : `linear-gradient(135deg,${tier.color},${tier.accent})`, border: 'none', color: '#000', borderRadius: '12px', padding: '13px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '14px' }}
            >
              {loading ? 'Placing…' : 'Confirm Order →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Marketplace() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [search,         setSearch]         = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedTiers,  setSelectedTiers]  = useState([])
  const [selectedTypes,  setSelectedTypes]  = useState([])
  const [sortBy,         setSortBy]         = useState('featured')
  const [availOnly,      setAvailOnly]      = useState(false)
  const [buyTarget,      setBuyTarget]      = useState(null)
  const [orderLoading,   setOrderLoading]   = useState(false)
  const [successMsg,     setSuccessMsg]     = useState('')
  const [showFilters,    setShowFilters]    = useState(false)
  const [customPrices,   setCustomPrices]   = useState(null)

  useEffect(() => {
    if (!user?.uid) return

    let unsubGlobal = null

    // Listen to user doc in real time
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (userSnap) => {
      // Clean up any previous global listener
      if (unsubGlobal) { unsubGlobal(); unsubGlobal = null }

      if (userSnap.exists()) {
        const userData = userSnap.data()
        if (userData.customPrices && Object.keys(userData.customPrices).length > 0) {
          // Reseller prices exist — use them, no need for global
          setCustomPrices(userData.customPrices)
          return
        }
      }

      // No reseller prices — listen to global prices in real time
      unsubGlobal = onSnapshot(doc(db, 'settings', 'globalPrices'), (globalSnap) => {
        if (globalSnap.exists()) {
          setCustomPrices(globalSnap.data())
        } else {
          setCustomPrices(null)
        }
      })
    })

    return () => {
      unsubUser()
      if (unsubGlobal) unsubGlobal()
    }
  }, [user?.uid])

  const toggleTier = id => setSelectedTiers(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id])
  const toggleType = id => setSelectedTypes(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id])

  const filtered = useMemo(() => {
    let list = [...SHUFFLED_LISTINGS]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l => l.city.toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || l.region.toLowerCase().includes(q))
    }
    if (selectedRegion !== 'All') list = list.filter(l => l.region === selectedRegion)
    if (selectedTiers.length > 0) list = list.filter(l => selectedTiers.includes(l.tier))
    if (selectedTypes.length > 0) list = list.filter(l => selectedTypes.includes(l.ipType))
    if (availOnly) list = list.filter(l => l.available > 0)
    list.sort((a, b) => {
      if (sortBy === 'featured')     return 0
      if (sortBy === 'price-asc')    return (customPrices?.[a.tier] ?? TIERS[a.tier].price) - (customPrices?.[b.tier] ?? TIERS[b.tier].price)
      if (sortBy === 'price-desc')   return (customPrices?.[b.tier] ?? TIERS[b.tier].price) - (customPrices?.[a.tier] ?? TIERS[a.tier].price)
      if (sortBy === 'availability') return b.available / b.total - a.available / a.total
      return 0
    })
    return list
  }, [search, selectedRegion, selectedTiers, selectedTypes, availOnly, sortBy, customPrices])

  const handleConfirmOrder = async (listing) => {
    if (!user) return navigate('/login')
    setOrderLoading(true)
    try {
      const tier  = TIERS[listing.tier]
      const price = customPrices?.[listing.tier] ?? tier.price
      await addDoc(collection(db, 'orders'), {
        userId:        user.uid,
        userEmail:     user.email,
        listingId:     listing.id,
        city:          listing.city,
        country:       listing.country,
        countryCode:   listing.countryCode,
        region:        listing.region,
        ipType:        listing.ipType,
        tier:          listing.tier,
        price,
        status:        'pending',
        paymentStatus: 'unpaid',
        createdAt:     serverTimestamp(),
      })
      setBuyTarget(null)
      setSuccessMsg(`Order placed for ${listing.city}! Go to Transactions to complete payment.`)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) { console.error(err) }
    setOrderLoading(false)
  }

  const activeFilters = selectedTiers.length + selectedTypes.length + (selectedRegion !== 'All' ? 1 : 0) + (availOnly ? 1 : 0)

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>Marketplace</div>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>IP Marketplace</h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search city, country…"
              style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '10px 12px 10px 32px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              background: activeFilters > 0 ? '#6366f122' : '#ffffff08',
              border: `1px solid ${activeFilters > 0 ? '#6366f155' : '#ffffff12'}`,
              color: activeFilters > 0 ? '#818cf8' : '#9ca3af',
              borderRadius: '10px', padding: '0 14px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            }}
          >
            ⚙️ {activeFilters > 0 ? `Filters (${activeFilters})` : 'Filter'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          {TIER_ORDER.map(id => {
            const t      = TIERS[id]
            const active = selectedTiers.includes(id)
            const price  = customPrices?.[id] ?? t.price
            return (
              <button key={id} onClick={() => toggleTier(id)} style={{
                background: active ? `${t.color}22` : '#ffffff08',
                border: `1px solid ${active ? t.color + '55' : '#ffffff12'}`,
                color: active ? t.accent : '#9ca3af',
                borderRadius: '20px', padding: '4px 12px',
                fontSize: '11px', fontWeight: active ? 700 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {t.label} ${price.toLocaleString()}
              </button>
            )
          })}
        </div>
      </div>

      {showFilters && (
        <div style={{ background: '#0d0d1a', borderBottom: '1px solid #ffffff08', padding: '14px 16px' }}>
          <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Region</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button onClick={() => setSelectedRegion('All')} style={{ background: selectedRegion === 'All' ? '#6366f122' : '#ffffff08', border: `1px solid ${selectedRegion === 'All' ? '#6366f155' : '#ffffff12'}`, color: selectedRegion === 'All' ? '#818cf8' : '#9ca3af', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: selectedRegion === 'All' ? 700 : 400, cursor: 'pointer' }}>All</button>
            {REGIONS.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)} style={{ background: selectedRegion === r ? '#6366f122' : '#ffffff08', border: `1px solid ${selectedRegion === r ? '#6366f155' : '#ffffff12'}`, color: selectedRegion === r ? '#818cf8' : '#9ca3af', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: selectedRegion === r ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r}</button>
            ))}
          </div>

          <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>IP Type</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {IP_TYPES.map(t => (
              <button key={t.id} onClick={() => toggleType(t.id)} style={{ background: selectedTypes.includes(t.id) ? '#6366f122' : '#ffffff08', border: `1px solid ${selectedTypes.includes(t.id) ? '#6366f155' : '#ffffff12'}`, color: selectedTypes.includes(t.id) ? '#818cf8' : '#9ca3af', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: selectedTypes.includes(t.id) ? 700 : 400, cursor: 'pointer' }}>{t.icon} {t.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setAvailOnly(v => !v)} style={{ background: availOnly ? '#22c55e22' : '#ffffff08', border: `1px solid ${availOnly ? '#22c55e55' : '#ffffff12'}`, color: availOnly ? '#4ade80' : '#9ca3af', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: availOnly ? 700 : 400, cursor: 'pointer' }}>● Available only</button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: '#9ca3af', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', cursor: 'pointer', outline: 'none', marginLeft: 'auto' }}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="availability">Availability</option>
            </select>
            {activeFilters > 0 && (
              <button onClick={() => { setSelectedRegion('All'); setSelectedTiers([]); setSelectedTypes([]); setAvailOnly(false) }} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>Clear</button>
            )}
          </div>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#22c55e18', border: '1px solid #22c55e44', color: '#4ade80', padding: '10px 16px', fontSize: '12px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>{filtered.length}</span> listings
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🌐</div>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600 }}>No listings found</div>
            <div style={{ color: '#374151', fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(listing => (
              <IPCard
                key={listing.id}
                listing={listing}
                onBuy={setBuyTarget}
                customPrices={customPrices}
              />
            ))}
          </div>
        )}
      </div>

      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          onClose={() => setBuyTarget(null)}
          onConfirm={handleConfirmOrder}
          loading={orderLoading}
          customPrices={customPrices}
        />
      )}
    </div>
  )
}