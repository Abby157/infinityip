import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FEATURES = [
  { icon: '🌐', title: 'Global Coverage', desc: '29 locations across 15 countries and 6 regions worldwide' },
  { icon: '⚡', title: 'Ultra Fast', desc: 'Latency as low as 10ms with 99.9% uptime guaranteed' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade encryption and complete anonymity' },
  { icon: '📱', title: 'Mobile Ready', desc: 'Manage your IPs from anywhere on any device' },
  { icon: '💳', title: 'Easy Payments', desc: 'Pay with Crypto or Gift Cards — fast and anonymous' },
  { icon: '⚙️', title: '24/7 Support', desc: 'Our team is always ready to help you' },
]

const TIERS = [
  { id: 'low',      label: 'Low',      price: 220, color: '#6b7280', accent: '#9ca3af', trust: '55–65', uptime: '94%',   features: ['Residential IP', 'Monthly rotation', 'Basic support'] },
  { id: 'standard', label: 'Standard', price: 280, color: '#3b82f6', accent: '#60a5fa', trust: '66–75', uptime: '97%',   features: ['Residential IP', 'Bi-weekly rotation', 'Priority support', 'Analytics'] },
  { id: 'strong',   label: 'Strong',   price: 350, color: '#8b5cf6', accent: '#a78bfa', trust: '76–87', uptime: '98.5%', features: ['Premium residential', 'Weekly rotation', '24/7 support', 'Full analytics', 'IP health alerts'], popular: true },
  { id: 'elite',    label: 'Elite',    price: 500, color: '#f59e0b', accent: '#fbbf24', trust: '88–99', uptime: '99.9%', features: ['Elite residential', 'On-demand rotation', 'Dedicated support', 'SLA guarantee', 'Custom config'] },
]

const STATS = [
  { value: '29+',  label: 'Global Locations' },
  { value: '15',   label: 'Countries' },
  { value: '99.9%',label: 'Uptime' },
  { value: '24/7', label: 'Support' },
]

const FAQS = [
  { q: 'What is a virtual IP?', a: 'A virtual IP is a residential or datacenter IP address from a specific location that you can use to browse, work or access services as if you were physically there.' },
  { q: 'How do I pay?', a: 'We accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT) and Gift Cards including Apple, Steam and Razer Gold.' },
  { q: 'How long does activation take?', a: 'Once your payment is verified (usually 1–24 hours), your IP is activated and assigned immediately.' },
  { q: 'Can I cancel my order?', a: 'Yes, you can cancel any pending order before payment is verified through your Transactions page.' },
  { q: 'What happens when my IP expires?', a: 'You will receive a notification before expiry. You can renew your IP for another 30 days through the My IPs page.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif", overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(8,8,16,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid #ffffff0d' : 'none',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          INFINITY IP
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1px solid #ffffff20', color: '#9ca3af', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            Login
          </button>
          <button onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 60px', textAlign: 'center', position: 'relative' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,#6366f120 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,#8b5cf615 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: '#6366f120', border: '1px solid #6366f133', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', color: '#818cf8', fontWeight: 600, marginBottom: '20px', display: 'inline-block' }}>
          🌐 Premium Virtual IP Service
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 8vw, 64px)', fontWeight: 900, margin: '0 0 20px', letterSpacing: '-2px', lineHeight: 1.1, maxWidth: '800px' }}>
          Unlimited Connections,{' '}
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Infinite Possibilities
          </span>
        </h1>

        <p style={{ color: '#6b7280', fontSize: 'clamp(14px, 3vw, 18px)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '32px' }}>
          Access premium residential and datacenter IPs from 29 locations worldwide. Fast setup, anonymous payments, enterprise-grade reliability.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer', fontWeight: 800, fontSize: '15px', boxShadow: '0 8px 32px #6366f144' }}
          >
            Get Started Free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{ background: '#ffffff0a', border: '1px solid #ffffff20', color: '#fff', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
          >
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: '#ffffff06', border: '1px solid #ffffff0d', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', minWidth: '100px' }}>
              <div style={{ color: '#fff', fontSize: '22px', fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
            Everything you need
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Professional IP management built for speed, privacy and reliability
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: '60px 20px', background: 'linear-gradient(180deg,#0a0a16,#080810)', borderTop: '1px solid #ffffff08', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
              Simple pricing
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Choose the plan that fits your needs</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
            {TIERS.map(tier => (
              <div key={tier.id} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: `1px solid ${tier.popular ? tier.color + '66' : '#ffffff0d'}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                {tier.popular && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: `linear-gradient(135deg,${tier.color},${tier.accent})`, color: '#000', fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderBottomLeftRadius: '8px', letterSpacing: '1px' }}>
                    POPULAR
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tier.accent, boxShadow: `0 0 8px ${tier.accent}` }} />
                  <span style={{ color: tier.accent, fontWeight: 800, fontSize: '13px', letterSpacing: '0.5px' }}>{tier.label.toUpperCase()}</span>
                </div>
                <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-1px' }}>
                  ${tier.price.toLocaleString()}
                  <span style={{ color: '#4b5563', fontSize: '12px', fontWeight: 400 }}>/mo</span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '16px' }}>
                  Trust {tier.trust} · {tier.uptime} uptime
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: `${tier.color}22`, border: `1px solid ${tier.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: tier.accent, flexShrink: 0 }}>✓</div>
                      <span style={{ color: '#d1d5db', fontSize: '12px' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  style={{ width: '100%', background: `linear-gradient(135deg,${tier.color},${tier.accent})`, border: 'none', color: '#000', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
            Frequently asked questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '14px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#fff', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}
              >
                {faq.q}
                <span style={{ color: '#6b7280', fontSize: '16px', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0, marginLeft: '10px' }}>▼</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 18px 16px', color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(180deg,#080810,#0d0d20)' }}>
        <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>
          Ready to get started?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '28px' }}>
          Join thousands of users using Infinity IP worldwide
        </p>
        <button
          onClick={() => navigate('/signup')}
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '12px', padding: '14px 32px', cursor: 'pointer', fontWeight: 800, fontSize: '16px', boxShadow: '0 8px 32px #6366f144' }}
        >
          Create Free Account →
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ffffff08', padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          INFINITY IP
        </div>
        <div style={{ color: '#374151', fontSize: '12px' }}>
          ©️ 2026 Infinity IP. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '12px', cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '12px', cursor: 'pointer' }}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}