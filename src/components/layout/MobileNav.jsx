import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { label: 'Home',    icon: '⊞', path: '/dashboard' },
  { label: 'Market',  icon: '🌐', path: '/marketplace' },
  { label: 'My IPs',  icon: '📡', path: '/resources' },
  { label: 'Orders',  icon: '💳', path: '/transactions' },
  { label: 'More',    icon: '☰',  path: '/profile' },
]

export default function MobileNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAdmin } = useAuth()

  const isActive = path => location.pathname.startsWith(path)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,10,22,0.97)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid #ffffff0d',
      display: 'flex',
      zIndex: 99,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const active = isActive(item.path)
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', padding: '10px 4px',
              background: 'none', border: 'none',
              color: active ? '#818cf8' : '#4b5563',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: '9px', fontWeight: active ? 700 : 400, letterSpacing: '0.3px' }}>
              {item.label}
            </span>
            {active && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}