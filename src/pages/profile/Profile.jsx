import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { db, auth } from '../../firebase/config'

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input
    type={type} value={value} onChange={onChange}
    placeholder={placeholder} disabled={disabled}
    style={{
      width: '100%', background: disabled ? '#ffffff04' : '#ffffff08',
      border: `1px solid ${disabled ? '#ffffff08' : '#ffffff12'}`,
      borderRadius: '10px', padding: '11px 14px',
      color: disabled ? '#4b5563' : '#fff',
      fontSize: '13px', outline: 'none', boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : 'text',
    }}
  />
)

export default function Profile() {
  const { user, isAdmin } = useAuth()
  const [userData,    setUserData]    = useState(null)
  const [fullName,    setFullName]    = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saveMsg,     setSaveMsg]     = useState('')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg,     setPassMsg]     = useState('')
  const [passErr,     setPassErr]     = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [activeTab,   setActiveTab]   = useState('profile')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setUserData(data)
        setFullName(data.fullName || '')
      }
    }
    load()
  }, [user])

  const saveProfile = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    setSaveMsg('')
    try {
      await updateDoc(doc(db, 'users', user.uid), { fullName: fullName.trim() })
      setSaveMsg('success')
    } catch { setSaveMsg('error') }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const changePassword = async () => {
    setPassErr(''); setPassMsg('')
    if (!currentPass) return setPassErr('Enter your current password.')
    if (!newPass)     return setPassErr('Enter a new password.')
    if (newPass.length < 6) return setPassErr('Password must be at least 6 characters.')
    if (newPass !== confirmPass) return setPassErr('Passwords do not match.')
    setPassLoading(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPass)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, newPass)
      setPassMsg('success')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
        setPassErr('Current password is incorrect.')
      else if (err.code === 'auth/too-many-requests')
        setPassErr('Too many attempts. Try again later.')
      else setPassErr('Failed to change password.')
    }
    setPassLoading(false)
    setTimeout(() => setPassMsg(''), 3000)
  }

  const joined = userData?.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) || '—'

  const tabs = [
    { id: 'profile',  label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'account',  label: 'Account' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 0', background: 'linear-gradient(180deg,#0d0d20,#080810)', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ color: '#4b5563', fontSize: '11px', marginBottom: '6px' }}>Profile</div>

        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 900, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 20px #6366f144',
          }}>
            {(userData?.fullName || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>
              {userData?.fullName || 'User'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{user?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span style={{ background: isAdmin ? '#f59e0b18' : '#6366f118', border: `1px solid ${isAdmin ? '#f59e0b44' : '#6366f144'}`, borderRadius: '20px', padding: '2px 10px', color: isAdmin ? '#fbbf24' : '#818cf8', fontSize: '10px', fontWeight: 700 }}>
                {isAdmin ? '⚙️ Administrator' : '👤 User'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
                color: active ? '#818cf8' : '#6b7280',
                padding: '10px 18px', cursor: 'pointer',
                fontSize: '12px', fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
              }}>{tab.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '18px' }}>
            <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: '0 0 16px' }}>Personal Information</h2>

            {saveMsg && (
              <div style={{ background: saveMsg === 'success' ? '#22c55e18' : '#ef444418', border: `1px solid ${saveMsg === 'success' ? '#22c55e44' : '#ef444444'}`, borderRadius: '8px', padding: '9px 14px', color: saveMsg === 'success' ? '#4ade80' : '#f87171', fontSize: '12px', marginBottom: '14px' }}>
                {saveMsg === 'success' ? '✅ Profile updated successfully' : '❌ Failed to update profile'}
              </div>
            )}

            <Field label="Full Name">
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </Field>
            <Field label="Email Address">
              <Input value={user?.email || ''} disabled />
            </Field>
            <Field label="Account Role">
              <Input value={isAdmin ? 'Administrator' : 'User'} disabled />
            </Field>

            <button onClick={saveProfile} disabled={saving} style={{ width: '100%', background: saving ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '18px' }}>
            <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: '0 0 16px' }}>Change Password</h2>

            {passErr && (
              <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: '8px', padding: '9px 14px', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>{passErr}</div>
            )}
            {passMsg === 'success' && (
              <div style={{ background: '#22c55e18', border: '1px solid #22c55e44', borderRadius: '8px', padding: '9px 14px', color: '#4ade80', fontSize: '12px', marginBottom: '14px' }}>✅ Password changed successfully</div>
            )}

            <Field label="Current Password">
              <div style={{ position: 'relative' }}>
                <input type={showCurrent ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 40px 11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px' }}>
                  {showCurrent ? '🙈' : '👁️'}
                </button>
              </div>
            </Field>

            <Field label="New Password">
              <div style={{ position: 'relative' }}>
                <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '10px', padding: '11px 40px 11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px' }}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </Field>

            <Field label="Confirm New Password">
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', background: '#ffffff08', border: `1px solid ${confirmPass && confirmPass !== newPass ? '#ef444440' : '#ffffff12'}`, borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              {confirmPass && confirmPass !== newPass && (
                <div style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>Passwords do not match</div>
              )}
            </Field>

            <button onClick={changePassword} disabled={passLoading} style={{ width: '100%', background: passLoading ? '#6366f150' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '10px', padding: '12px', cursor: passLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>
              {passLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        )}

        {/* Account tab */}
        {activeTab === 'account' && (
          <div style={{ background: 'linear-gradient(145deg,#13131f,#0d0d18)', border: '1px solid #ffffff0d', borderRadius: '16px', padding: '18px' }}>
            <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: '0 0 16px' }}>Account Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Wallet Balance', value: `$${(userData?.walletBalance || 0).toLocaleString()}`, color: '#22c55e' },
                { label: 'Member Since',   value: joined,                                                  color: '#818cf8' },
                { label: 'Account Type',   value: isAdmin ? 'Administrator' : 'Standard',                 color: isAdmin ? '#fbbf24' : '#818cf8' },
                { label: 'Email Verified', value: user?.emailVerified ? '✅ Verified' : '⚠️ Not verified', color: user?.emailVerified ? '#22c55e' : '#f59e0b' },
                { label: 'User ID',        value: user?.uid?.slice(0,16) + '…',                           color: '#6b7280' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #ffffff06' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: '13px', fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}