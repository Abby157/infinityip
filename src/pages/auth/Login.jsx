import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return setError('Please fill in all fields.')
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/invalid-credential') setError('Invalid email or password.')
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Try again later.')
      else setError('Login failed. Please try again.')
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
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #6366f115 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '25%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, #8b5cf610 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: 0 }}>
              Welcome back
            </h1>
            <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '4px' }}>
              Sign in to your Infinity IP account
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
          <div style={{ marginBottom: '14px' }}>
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

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={{
                  width: '100%', background: '#ffffff08',
                  border: '1px solid #ffffff12', borderRadius: '10px',
                  padding: '11px 40px 11px 14px', color: '#fff', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '12px', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
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
              letterSpacing: '0.2px',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#4b5563', fontSize: '13px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}