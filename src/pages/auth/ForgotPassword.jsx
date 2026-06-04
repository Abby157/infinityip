import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) return setError('Please enter your email address.')
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found')
        setError('No account found with this email.')
      else if (err.code === 'auth/invalid-email')
        setError('Please enter a valid email address.')
      else setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080810 0%, #0d0d1f 50%, #080810 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '20px',
      }}
    >
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #6366f115 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '28px', fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            INFINITY IP
          </div>
          <div style={{ color: '#374151', fontSize: '12px', marginTop: '4px' }}>
            Unlimited Connections, Infinite Possibilities
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(160deg, #13131f 0%, #0d0d18 100%)',
          border: '1px solid #ffffff0d',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 24px 80px #00000060',
        }}>

          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#6366f120', border: '2px solid #6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', margin: '0 auto 20px',
                boxShadow: '0 0 24px #6366f144',
              }}>
                ✉️
              </div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', margin: '0 0 8px' }}>
                Check your inbox
              </h2>
              <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                We sent a password reset link to{' '}
                <strong style={{ color: '#818cf8' }}>{email}</strong>.
                Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', textDecoration: 'none',
                  borderRadius: '10px', padding: '11px 28px',
                  fontWeight: 700, fontSize: '14px',
                }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: 0 }}>
                  Reset your password
                </h1>
                <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '4px' }}>
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: '#ef444415', border: '1px solid #ef444430',
                  borderRadius: '10px', padding: '10px 14px',
                  color: '#f87171', fontSize: '13px', marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', background: '#ffffff08',
                    border: '1px solid #ffffff12', borderRadius: '10px',
                    padding: '11px 14px', color: '#fff', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading
                    ? '#6366f150'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '10px',
                  padding: '13px', color: '#fff',
                  fontWeight: 800, fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '20px', color: '#4b5563', fontSize: '13px' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}