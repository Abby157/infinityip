import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirm)
      return setError('Please fill in all fields.')
    if (password.length < 6)
      return setError('Password must be at least 6 characters.')
    if (password !== confirm)
      return setError('Passwords do not match.')

    setError('')
    setLoading(true)

    try {
      const { user } = await signup(email, password)

      // Create user doc in Firestore
      await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  fullName,
  email,
  role: 'user',
  walletBalance: 0,
  createdAt: serverTimestamp(),
})

// Send welcome notification
await addDoc(collection(db, 'notifications'), {
  userId:    user.uid,
  type:      'system',
  title:     'Welcome to Infinity IP! 🎉',
  message:   `Hello ${fullName}! Your account is ready. Browse the marketplace to get your first IP.`,
  read:      false,
  createdAt: serverTimestamp(),
})

navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use')
        setError('An account with this email already exists.')
      else if (err.code === 'auth/invalid-email')
        setError('Please enter a valid email address.')
      else if (err.code === 'auth/weak-password')
        setError('Password is too weak. Use at least 6 characters.')
      else setError('Signup failed. Please try again.')
    }

    setLoading(false)
  }

  const strength = () => {
    if (!password) return null
    if (password.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' }
    if (password.length < 8) return { label: 'Weak', color: '#f59e0b', width: '40%' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: 'Fair', color: '#eab308', width: '65%' }
    return { label: 'Strong', color: '#22c55e', width: '100%' }
  }

  const pw = strength()

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
          position: 'absolute', top: '15%', left: '25%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #6366f115 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '20%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, #8b5cf610 0%, transparent 70%)',
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
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: 0 }}>
              Create your account
            </h1>
            <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '4px' }}>
              Join Infinity IP and get started today
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

          {/* Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              style={{
                width: '100%', background: '#ffffff08',
                border: '1px solid #ffffff12', borderRadius: '10px',
                padding: '11px 14px', color: '#fff', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Strength bar */}
            {pw && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '3px', background: '#ffffff10',
                  borderRadius: '99px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: pw.width,
                    background: pw.color, borderRadius: '99px',
                    transition: 'all 0.3s',
                  }} />
                </div>
                <div style={{ color: pw.color, fontSize: '11px', marginTop: '4px' }}>
                  {pw.label}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: '100%', background: '#ffffff08',
                border: `1px solid ${confirm && confirm !== password ? '#ef444440' : '#ffffff12'}`,
                borderRadius: '10px',
                padding: '11px 14px', color: '#fff', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {confirm && confirm !== password && (
              <div style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>
                Passwords do not match
              </div>
            )}
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#4b5563', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}