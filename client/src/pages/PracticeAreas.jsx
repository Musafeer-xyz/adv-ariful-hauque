import { useLanguage } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import { publicAPI } from '../services/api'
import { Loader2 } from 'lucide-react'

const PracticeAreas = () => {
  const { language, t } = useLanguage()
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await publicAPI.getPracticeAreas()
        setAreas(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load practice areas')
        setLoading(false)
      }
    }

    fetchAreas()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-background-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 bg-background-50">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-background-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-navy-50 mb-2">
          {language === 'en' ? 'Practice Areas' : 'অভ্যাস ক্ষেত্র'}
        </h1>
        <p className="text-xl text-brass-50 mb-8">
          {language === 'en' ? 'Areas of Expertise' : 'দক্ষতার ক্ষেত্র'}
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border-t-4 border-brass-50 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-navy-50 mb-3">
                {t(area.title)}
              </h3>
              <p className="text-gray-600">{t(area.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PracticeAreas
