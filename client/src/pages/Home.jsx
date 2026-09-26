import { useLanguage } from '../context/LanguageContext'
import { ArrowRight, Calendar, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { publicAPI } from '../services/api'
import courthouseBg from '../assets/courthouse-bg.jpg'

const Home = () => {
  const { language, t } = useLanguage()
  const [profile, setProfile] = useState(null)
  const [practiceAreas, setPracticeAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, areasRes] = await Promise.all([
          publicAPI.getProfile(),
          publicAPI.getPracticeAreas()
        ])
        setProfile(profileRes.data)
        setPracticeAreas(areasRes.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError(true)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  // Never access profile properties while it can still be null/undefined
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center px-4 text-center">
        <p className="text-navy-50">
          {language === 'bn'
            ? 'তথ্য লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।'
            : 'Could not load content. Please try again shortly.'}
        </p>
      </div>
    )
  }

  const content = {
    en: {
      cta: 'Book Appointment',
      about: 'More About Me',
      practiceAreas: 'Practice Areas',
      featuredAreas: 'Practice Areas',
      badgeLabel: 'Successful Practice',
      badgeValue: '20+',
      quote: 'Justice is not just a profession, it is a commitment.',
    },
    bn: {
      cta: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      about: 'বিস্তারিত পরিচিতি',
      practiceAreas: 'অভ্যাস ক্ষেত্র',
      featuredAreas: 'প্র্যাকটিস এরিয়া',
      badgeLabel: 'সফল প্র্যাকটিস',
      badgeValue: '২০+',
      quote: 'ন্যায়বিচার শুধু একটি পেশা নয়, এটি একটি প্রতিশ্রুতি।',
    }
  }

  const c = content[language]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-navy-50 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${courthouseBg})`, filter: 'grayscale(1)' }}
        />
        <div className="absolute inset-0 bg-navy-50 opacity-70" />
        <div className="container mx-auto px-4 py-16 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <p className="text-brass-100 font-medium mb-3">
                {t(profile.title)}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
                {t(profile.name)}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                {t(profile.tagline)}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/appointment"
                  className="inline-flex items-center justify-center px-6 py-3 bg-brass-50 text-navy-50 hover:bg-brass-100 rounded transition-colors font-medium"
                >
                  <Calendar className="mr-2" size={20} />
                  {c.cta}
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white hover:bg-white hover:text-navy-50 rounded transition-colors"
                >
                  {c.about}
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>

            {/* Circular portrait with badge */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-brass-50 bg-navy-100 shadow-2xl">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={t(profile.name)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-200">
                      <span className="text-6xl">⚖️</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 -left-4 sm:-left-8 bg-white text-navy-50 rounded-lg shadow-lg px-4 py-2.5 text-center">
                  <p className="text-xs text-gray-500 whitespace-nowrap">{c.badgeLabel}</p>
                  <p className="text-2xl font-bold text-brass-50 leading-tight">{c.badgeValue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="bg-background-100 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-navy-50 leading-relaxed">
            “{c.quote}”
          </p>
        </div>
      </section>

      {/* Practice Areas Preview */}
      <section className="py-16 bg-background-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-50 mb-8 text-center">
            {c.featuredAreas}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceAreas.slice(0, 4).map((area, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border-t-4 border-brass-50 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold text-navy-50">{t(area.title)}</h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/practice-areas"
              className="inline-flex items-center text-brass-50 hover:text-brass-100 font-semibold"
            >
              {c.practiceAreas}
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
