import { Outlet, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { Menu, X, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { publicAPI } from '../services/api'

const Layout = () => {
  const { language, toggleLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    publicAPI.getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Failed to load header profile:', err))
  }, [])

  const navItems = {
    en: [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
      { path: '/practice-areas', label: 'Practice Areas' },
      { path: '/blog', label: 'Blog' },
      { path: '/contact', label: 'Contact' },
    ],
    bn: [
      { path: '/', label: 'হোম' },
      { path: '/about', label: 'পরিচিতি' },
      { path: '/practice-areas', label: 'প্র্যাকটিস এরিয়া' },
      { path: '/blog', label: 'ব্লগ' },
      { path: '/contact', label: 'যোগাযোগ' },
    ]
  }

  const displayName = profile ? t(profile.name) : (language === 'en' ? 'Advocate' : 'অ্যাডভোকেট')
  // Designation (e.g. court) is the attribute shown under the name; chambers are addresses shown in the footer
  const designation = profile ? (t(profile.designation) || t(profile.chamber) || '') : ''
  const chambers = profile && Array.isArray(profile.chambers) && profile.chambers.length > 0
    ? profile.chambers.map((ch) => t(ch)).filter(Boolean)
    : (profile && t(profile.chamber) ? [t(profile.chamber)] : [])
  const initial = displayName ? displayName.replace(/^Adv(o|c)a?te\s*/i, '').trim().charAt(0) || 'A' : 'A'

  const headerAvatar = profile?.imageUrl ? (
    <img
      src={profile.imageUrl}
      alt={displayName}
      className="w-10 h-10 rounded-full object-cover border-2 border-brass-50 flex-shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-brass-50 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-lg">{initial}</span>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-navy-50 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo: avatar + name + chamber */}
            <Link to="/" className="flex items-center space-x-3 min-w-0">
              {headerAvatar}
              <div className="min-w-0">
                <span className="block font-bold text-sm sm:text-base leading-tight truncate">
                  {displayName}
                </span>
                {designation && (
                  <span className="hidden sm:block text-[11px] opacity-70 leading-tight truncate max-w-[280px]">
                    {designation}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems[language].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:text-brass-100 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 border border-white/40 rounded-full text-sm hover:border-brass-100 hover:text-brass-100 transition-colors"
              >
                {language === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <Link
                to="/appointment"
                className="inline-flex items-center px-4 py-2.5 bg-brass-50 text-navy-50 rounded font-medium hover:bg-brass-100 transition-colors"
              >
                <Calendar size={16} className="mr-2" />
                {language === 'en' ? 'Book Appointment' : 'অ্যাপয়েন্টমেন্ট নিন'}
              </Link>
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
              {navItems[language].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] py-2 hover:text-brass-100 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/appointment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center min-h-[44px] px-4 py-2.5 mt-2 bg-brass-50 text-navy-50 rounded font-medium"
              >
                <Calendar size={16} className="mr-2" />
                {language === 'en' ? 'Book Appointment' : 'অ্যাপয়েন্টমেন্ট নিন'}
              </Link>
              <button
                onClick={toggleLanguage}
                className="w-full text-left min-h-[44px] px-3 py-2 border border-white/40 rounded-full hover:border-brass-100 hover:text-brass-100 transition-colors"
              >
                {language === 'en' ? 'বাংলা' : 'EN'}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-50 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-brass-50 font-bold mb-4">{displayName}</h3>
              {designation && <p className="text-sm text-brass-100 mb-2">{designation}</p>}
              <p className="text-sm opacity-80">
                {language === 'en'
                  ? 'Professional legal services for all your needs.'
                  : 'আপনার সকল প্রয়োজনের জন্য পেশাদার আইনি সেবা।'}
              </p>
              {chambers.length > 0 && (
                <div className="mt-4 space-y-2 text-sm">
                  {chambers.map((ch, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-brass-50 font-bold mb-4">
                {language === 'en' ? 'Contact' : 'যোগাযোগ'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>{profile?.phone || '+880 1234-567890'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{profile?.email || 'advocate@example.com'}</span>
                </div>
                {designation && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{designation}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-brass-50 font-bold mb-4">
                {language === 'en' ? 'Quick Links' : 'দ্রুত লিঙ্ক'}
              </h3>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block hover:text-brass-50">
                  {language === 'en' ? 'About' : 'পরিচিতি'}
                </Link>
                <Link to="/practice-areas" className="block hover:text-brass-50">
                  {language === 'en' ? 'Practice Areas' : 'প্র্যাকটিস এরিয়া'}
                </Link>
                <Link to="/appointment" className="block hover:text-brass-50">
                  {language === 'en' ? 'Appointment' : 'অ্যাপয়েন্টমেন্ট'}
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-navy-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm opacity-60">
            <span>© 2024 Advocate. All rights reserved.</span>
            <Link
              to="/admin/login"
              className="hover:text-brass-100 transition-colors text-xs sm:text-sm"
              title="Admin login"
            >
              {language === 'en' ? 'Admin Login' : 'অ্যাডমিন লগইন'}
            </Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${(profile?.whatsapp || '+8801234567890').replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 w-14 h-14 flex items-center justify-center"
        aria-label="WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}

export default Layout
