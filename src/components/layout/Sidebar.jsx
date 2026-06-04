import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'Marketplace', icon: '🌐', path: '/marketplace' },
  { label: 'My IPs', icon: '📡', path: '/resources' },
  { label: 'Transactions', icon: '💳', path: '/transactions' },
  { label: 'Notifications', icon: '🔔', path: '/notifications' },
  { label: 'Support', icon: '💬', path: '/support' },
  { label: 'Profile', icon: '👤', path: '/profile' },
]

const ADMIN_NAV = { label: 'Admin Panel', icon: '⚙️', path: '/admin' }

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div
      style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a16 0%, #080810 100%)',
        borderRight: '1px solid #ffffff0d',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '24px 20px',
          borderBottom: '1px solid #ffffff08',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px',
        }}
      >
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              INFINITY IP
            </div>
            <div style={{ color: '#374151', fontSize: '10px', marginTop: '1px' }}>
              Unlimited Connections
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{
            background: '#ffffff08',
            border: '1px solid #ffffff10',
            color: '#6b7280',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? '#6366f115' : 'transparent',
                border: `1px solid ${active ? '#6366f133' : 'transparent'}`,
                borderRadius: '10px',
                color: active ? '#818cf8' : '#6b7280',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    boxShadow: '0 0 6px #6366f1',
                  }}
                />
              )}
            </button>
          )
        })}

        {/* Admin link — only visible to admin */}
        {isAdmin && (
          <>
            <div style={{ height: '1px', background: '#ffffff08', margin: '8px 4px' }} />
            <button
              onClick={() => navigate(ADMIN_NAV.path)}
              title={collapsed ? ADMIN_NAV.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive(ADMIN_NAV.path) ? '#f59e0b15' : 'transparent',
                border: `1px solid ${isActive(ADMIN_NAV.path) ? '#f59e0b33' : 'transparent'}`,
                borderRadius: '10px',
                color: isActive(ADMIN_NAV.path) ? '#fbbf24' : '#6b7280',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                width: '100%',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{ADMIN_NAV.icon}</span>
              {!collapsed && <span>{ADMIN_NAV.label}</span>}
            </button>
          </>
        )}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '12px',
          borderTop: '1px solid #ffffff08',
        }}
      >
        {!collapsed && user && (
          <div
            style={{
              background: '#ffffff06',
              border: '1px solid #ffffff0d',
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '8px',
            }}
          >
            <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
            {isAdmin && (
              <div style={{ color: '#fbbf24', fontSize: '10px', marginTop: '2px' }}>
                ⚙️ Administrator
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            background: '#ef444410',
            border: '1px solid #ef444420',
            color: '#f87171',
            borderRadius: '10px',
            padding: '9px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span>🚪</span>
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>
    </div>
  )
}