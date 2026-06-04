import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import MobileNav from '../components/layout/MobileNav'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#080810',
      color: '#fff',
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* Desktop sidebar — hidden on mobile */}
      <div style={{ display: 'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '240px', height: '100%' }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: '100vh',
        paddingBottom: '70px', // space for mobile bottom nav
      }}>

        {/* Mobile top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #ffffff0d',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: '#ffffff08',
              border: '1px solid #ffffff12',
              color: '#fff', borderRadius: '8px',
              width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ☰
          </button>

          <div style={{
            fontSize: '15px', fontWeight: 900, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            INFINITY IP
          </div>

          <div style={{ width: '36px' }} />
        </div>

        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}