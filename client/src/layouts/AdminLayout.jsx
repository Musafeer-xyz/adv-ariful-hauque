import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, FileText, Clock, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { adminAPI } from '../services/api'

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await adminAPI.logout()
      navigate('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
      navigate('/admin/login')
    }
  }

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/admin/slots', icon: Clock, label: 'Slots' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <header className="bg-navy-50 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brass-50 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold">Admin Panel</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 hover:text-brass-50 transition-colors ${
                    location.pathname === item.path ? 'text-brass-50' : ''
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:text-brass-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-navy-200">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 min-h-[44px] py-2 hover:text-brass-50 transition-colors ${
                    location.pathname === item.path ? 'text-brass-50' : ''
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center space-x-2 min-h-[44px] py-2 hover:text-brass-50 transition-colors w-full text-left"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout