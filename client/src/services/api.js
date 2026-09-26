import axios from 'axios'

// Relative by default: in dev the Vite proxy forwards /api to localhost:5000,
// in production the Vercel rewrite forwards /api to the Render backend.
// Same-origin requests are what let the admin auth cookie actually stick.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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
  login: (pin, rememberDevice) => api.post('/admin/login', { pin, rememberDevice }),
  logout: () => api.post('/admin/logout'),
  
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
