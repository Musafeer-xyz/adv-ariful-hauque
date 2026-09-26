import { useLanguage } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import { publicAPI } from '../services/api'
import { Loader2 } from 'lucide-react'

const About = () => {
  const { language, t } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicAPI.getProfile()
        setProfile(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load profile')
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-background-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="py-16 bg-background-50">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error || 'Failed to load profile'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-background-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-navy-50 mb-2">
          {language === 'en' ? 'About Me' : 'আমার সম্পর্কে'}
        </h1>
        <p className="text-xl text-brass-50 mb-8">{t(profile.title)}</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="mb-6">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt="Advocate"
                  className="w-48 h-48 object-cover rounded-lg mx-auto"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg mx-auto bg-navy-100 flex items-center justify-center">
                  <span className="text-6xl">⚖️</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-navy-50 mb-4">
              {language === 'en' ? 'Biography' : 'জীবনী'}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{t(profile.bio)}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-navy-50 mb-4">
                {language === 'en' ? 'Credentials' : 'যোগ্যতা'}
              </h3>
              <ul className="space-y-2">
                {profile.credentials.map((cred, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-brass-50 mr-2">•</span>
                    <span>{t(cred)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-navy-50 mb-4">
                {language === 'en' ? 'Chamber' : 'চেম্বার'}
              </h3>
              <p className="text-gray-700">{t(profile.chamber)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
