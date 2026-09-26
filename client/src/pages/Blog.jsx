import { useLanguage } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicAPI } from '../services/api'
import { Loader2, Calendar } from 'lucide-react'

const Blog = () => {
  const { language, t } = useLanguage()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await publicAPI.getBlogPosts()
        setPosts(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load blog posts')
        setLoading(false)
      }
    }

    fetchPosts()
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
          {language === 'en' ? 'Blog' : 'ব্লগ'}
        </h1>
        <p className="text-xl text-brass-50 mb-8">
          {language === 'en' ? 'Legal Insights & Updates' : 'আইনি অন্তর্দৃষ্টি এবং আপডেট'}
        </p>
        
        {posts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">
              {language === 'en' ? 'No blog posts yet.' : 'এখনো কোনো ব্লগ পোস্ট নেই।'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {post.youtubeVideo && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={`https://i.ytimg.com/vi/${post.youtubeVideo}/hqdefault.jpg`}
                      alt={t(post.title) || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center')
                        const span = document.createElement('span')
                        span.textContent = '▶️'
                        span.className = 'text-4xl'
                        e.currentTarget.parentElement.appendChild(span)
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={16} className="mr-2" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold text-navy-50 mb-2">
                    {t(post.title)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {t(post.excerpt)}
                  </p>
                  <span className="text-brass-50 text-sm font-semibold">
                    {t(post.category)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
