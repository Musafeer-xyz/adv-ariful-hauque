import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

const AdminBlog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: { bn: '', en: '' },
    category: { bn: '', en: '' },
    excerpt: { bn: '', en: '' },
    body: { bn: '', en: '' },
    published: false,
    youtubeVideo: ''
  })

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await adminAPI.getBlogPosts()
        setPosts(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch blog posts:', err)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPost) {
        await adminAPI.updateBlogPost(editingPost.slug, formData)
      } else {
        await adminAPI.createBlogPost(formData)
      }
      const response = await adminAPI.getBlogPosts()
      setPosts(response.data)
      setShowForm(false)
      setEditingPost(null)
      setFormData({
        slug: '',
        title: { bn: '', en: '' },
        category: { bn: '', en: '' },
        excerpt: { bn: '', en: '' },
        body: { bn: '', en: '' },
        published: false,
        youtubeVideo: ''
      })
    } catch (err) {
      console.error('Failed to save blog post:', err)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      published: post.published,
      youtubeVideo: post.youtubeVideo || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await adminAPI.deleteBlogPost(slug)
      setPosts(posts.filter(post => post.slug !== slug))
    } catch (err) {
      console.error('Failed to delete blog post:', err)
    }
  }

  const handleTogglePublish = async (post) => {
    try {
      await adminAPI.updateBlogPost(post.slug, { ...post, published: !post.published })
      setPosts(posts.map(p => 
        p.slug === post.slug ? { ...p, published: !p.published } : p
      ))
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-navy-50">Blog Management</h1>
        <button
          onClick={() => {
            setEditingPost(null)
            setFormData({
              slug: '',
              title: { bn: '', en: '' },
              category: { bn: '', en: '' },
              excerpt: { bn: '', en: '' },
              body: { bn: '', en: '' },
              published: false,
              youtubeVideo: ''
            })
            setShowForm(!showForm)
          }}
          className="flex items-center justify-center px-4 py-2 min-h-[44px] bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold text-navy-50 mb-4">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  placeholder="my-blog-post"
                  disabled={!!editingPost}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video ID (optional)</label>
                <input
                  type="text"
                  value={formData.youtubeVideo}
                  onChange={(e) => setFormData({...formData, youtubeVideo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  placeholder="dQw4w9WgXcQ"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (English) — optional</label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => setFormData({...formData, title: {...formData.title, en: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Bengali) — optional</label>
                <input
                  type="text"
                  value={formData.title.bn}
                  onChange={(e) => setFormData({...formData, title: {...formData.title, bn: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category (English) — optional</label>
                <input
                  type="text"
                  value={formData.category.en}
                  onChange={(e) => setFormData({...formData, category: {...formData.category, en: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category (Bengali) — optional</label>
                <input
                  type="text"
                  value={formData.category.bn}
                  onChange={(e) => setFormData({...formData, category: {...formData.category, bn: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt (English) — optional</label>
              <textarea
                value={formData.excerpt.en}
                onChange={(e) => setFormData({...formData, excerpt: {...formData.excerpt, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                rows="2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt (Bengali) — optional</label>
              <textarea
                value={formData.excerpt.bn}
                onChange={(e) => setFormData({...formData, excerpt: {...formData.excerpt, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                rows="2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Body (English) — optional</label>
              <textarea
                value={formData.body.en}
                onChange={(e) => setFormData({...formData, body: {...formData.body, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                rows="8"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Body (Bengali) — optional</label>
              <textarea
                value={formData.body.bn}
                onChange={(e) => setFormData({...formData, body: {...formData.body, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                rows="8"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  className="w-5 h-5 text-brass-50 border-gray-300 rounded focus:ring-brass-50"
                />
                <span className="ml-2 text-sm text-gray-700">Published</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors"
              >
                {editingPost ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No blog posts yet
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{post.title.en}</div>
                      <div className="text-sm text-gray-500">{post.title.bn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{post.category.en}</div>
                      <div className="text-sm text-gray-500">{post.category.bn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(post.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={post.published ? 'Unpublish' : 'Publish'}
                          aria-label={post.published ? 'Unpublish' : 'Publish'}
                        >
                          {post.published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                          aria-label="Edit post"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                          aria-label="Delete post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminBlog
