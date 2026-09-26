import { useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import { publicAPI } from '../services/api'
import { Loader2, Calendar, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const BlogPost = () => {
  const { slug } = useParams()
  const { language, t } = useLanguage()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await publicAPI.getBlogPost(slug)
        setPost(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load blog post')
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

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

  if (!post) {
    return (
      <div className="py-16 bg-background-50">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">
              {language === 'en' ? 'Blog post not found.' : 'ব্লগ পোস্ট পাওয়া যায়নি।'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-background-50">
      <div className="container mx-auto px-4">
        <Link
          to="/blog"
          className="inline-flex items-center text-brass-50 hover:text-brass-100 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          {language === 'en' ? 'Back to Blog' : 'ব্লগে ফিরে যান'}
        </Link>

        <article className="bg-white p-8 rounded-lg shadow">
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar size={16} className="mr-2" />
              {new Date(post.date).toLocaleDateString()}
            </div>
            <span className="inline-block bg-brass-50 text-white px-3 py-1 rounded text-sm mb-4">
              {t(post.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-navy-50 mb-4">
              {t(post.title)}
            </h1>
          </div>

          {post.youtubeVideo && (
            <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${post.youtubeVideo}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-line">
              {t(post.body)}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogPost
