import { useLanguage } from '../context/LanguageContext'
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { publicAPI } from '../services/api'

const Contact = () => {
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
        setError('Failed to load contact information')
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
            {error || 'Failed to load contact information'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-background-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-navy-50 mb-2">
          {language === 'en' ? 'Contact' : 'যোগাযোগ'}
        </h1>
        <p className="text-xl text-brass-50 mb-8">
          {language === 'en' ? 'Get in touch' : 'যোগাযোগ করুন'}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Phone className="text-brass-50" size={24} />
                <div>
                  <p className="font-semibold">
                    {language === 'en' ? 'Phone' : 'ফোন'}
                  </p>
                  <p className="text-gray-600">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="text-brass-50" size={24} />
                <div>
                  <p className="font-semibold">
                    {language === 'en' ? 'Email' : 'ইমেইল'}
                  </p>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="text-brass-50 mt-1" size={24} />
                <div>
                  <p className="font-semibold">
                    {language === 'en' ? 'Address' : 'ঠিকানা'}
                  </p>
                  {(Array.isArray(profile.chambers) && profile.chambers.length > 0
                    ? profile.chambers.map((ch) => t(ch)).filter(Boolean)
                    : [t(profile.chamber)].filter(Boolean)
                  ).map((ch, i) => (
                    <p key={i} className="text-gray-600">{ch}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold text-navy-50 mb-4">
              {language === 'en' ? 'Map' : 'ম্যাপ'}
            </h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                {language === 'en' ? 'Map placeholder' : 'ম্যাপ প্লেসহোল্ডার'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
