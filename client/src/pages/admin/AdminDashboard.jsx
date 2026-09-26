import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { Calendar, Clock, CheckCircle, Users, Loader2 } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboard()
        setStats(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  // Never read stats properties while stats can still be null
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Failed to load dashboard stats. Please try again.</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Awaiting Confirmation',
      value: stats.awaitingAppointments,
      icon: Clock,
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Confirmed',
      value: stats.confirmedAppointments,
      icon: CheckCircle,
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Active Slot Days',
      value: stats.activeSlotDays,
      icon: Users,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy-50 mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.color} p-6 rounded-lg`}>
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={stat.iconColor} size={24} />
              <span className="text-3xl font-bold text-navy-50">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-navy-50 mb-4">Today's Appointments</h2>
        <p className="text-4xl font-bold text-brass-50">{stats.todayAppointments}</p>
        <p className="text-gray-600">appointments scheduled for today</p>
      </div>
    </div>
  )
}

export default AdminDashboard
