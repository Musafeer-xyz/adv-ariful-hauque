import axios from 'axios'

// Always call the API same-origin ('/api'): dev resolves via the Vite proxy,
// production via the Vercel rewrite to Render. The admin auth cookie only
// sticks on same-origin requests, so an absolute API URL (e.g. a full
// onrender.com address, like VITE_API_URL on Vercel) would break the admin
// panel — those are deliberately ignored here.
const rawApiUrl = import.meta.env.VITE_API_URL
const API_BASE_URL = rawApiUrl && rawApiUrl.startsWith('/') ? rawApiUrl : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Public API calls
export const publicAPI = {
  // Slots
  getSlots: (date) => api.get(`/slots?date=${date}`),
  
  // Appointments
  createAppointment: (data) => api.post('/appointments', data),
  
  // Blog
  getBlogPosts: () => api.get('/blog'),
  getBlogPost: (slug) => api.get(`/blog/${slug}`),
  
  // Profile
  getProfile: () => api.get('/profile'),
  
  // Practice Areas
  getPracticeAreas: () => api.get('/practice-areas'),
}

// Admin API calls
export const adminAPI = {
  // Auth
  login: (email, pin, rememberDevice) => api.post('/admin/login', { email, pin, rememberDevice }),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),
  changeMyPin: (currentPin, newPin) => api.put('/admin/me/pin', { currentPin, newPin }),

  // Team management (owner only)
  getUsers: () => api.get('/admin/users'),
  createUser: (email, pin) => api.post('/admin/users', { email, pin }),
  resetUserPin: (id, pin) => api.put(`/admin/users/${id}/pin`, { pin }),
  setUserActive: (id, active) => api.put(`/admin/users/${id}/active`, { active }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Appointments
  getAppointments: (status) => api.get(`/admin/appointments${status ? `?status=${status}` : ''}`),
  confirmAppointment: (id) => api.patch(`/admin/appointments/${id}/confirm`),
  cancelAppointment: (id) => api.patch(`/admin/appointments/${id}/cancel`),
  
  // Slots
  getSlots: () => api.get('/admin/slots'),
  createSlotDay: (data) => api.post('/admin/slots', data),
  toggleSlot: (date, time) => api.patch(`/admin/slots/${date}/${time}/toggle`),
  deleteSlot: (date, time) => api.delete(`/admin/slots/${date}/${time}`),
  
  // Blog
  getBlogPosts: () => api.get('/admin/blog'),
  createBlogPost: (data) => api.post('/admin/blog', data),
  updateBlogPost: (slug, data) => api.put(`/admin/blog/${slug}`, data),
  deleteBlogPost: (slug) => api.delete(`/admin/blog/${slug}`),
  
  // Profile
  updateProfile: (data) => api.put('/admin/profile', data),
  changePin: (currentPin, newPin) => api.put('/admin/change-pin', { currentPin, newPin }),
  uploadProfilePhoto: (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post('/admin/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}

export default api
