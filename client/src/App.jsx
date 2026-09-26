import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './layouts/Layout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import PracticeAreas from './pages/PracticeAreas'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminSlots from './pages/admin/AdminSlots'
import AdminBlog from './pages/admin/AdminBlog'
import AdminProfile from './pages/admin/AdminProfile'
import AdminTeam from './pages/admin/AdminTeam'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="practice-areas" element={<PracticeAreas />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="appointment" element={<Appointment />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="team" element={<AdminTeam />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
