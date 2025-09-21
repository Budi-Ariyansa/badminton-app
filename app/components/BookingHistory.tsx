'use client'

import { useState, useEffect } from 'react'
import { History, Calendar, Users, Clock, MapPin } from 'lucide-react'

interface Booking {
  id: number
  date: string
  court_name: string
  court_location: string
  court_price: number
  shuttlecock_name: string
  shuttlecock_price: number
  shuttlecock_count: number
  duration: number
  player_count: number
  total_cost: number
  cost_per_person: number
  bank_name?: string
  bank_account_name?: string
  bank_account_number?: string
  created_at: string
}

interface BookingHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export default function BookingHistory({ isOpen, onClose }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadBookings()
    }
  }, [isOpen])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setBookings([])
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Riwayat Booking</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Memuat riwayat...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Belum ada riwayat booking</div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(booking.date)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{(booking as any).courtName || 'Unknown'} - {(booking as any).courtLocation || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{(booking as any).playerCount || 0} pemain</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{(booking as any).duration || 0} jam</span>
                        </div>
                        <div>
                          <span>🏸 {(booking as any).shuttlecockName || 'Unknown'} ({(booking as any).shuttlecockCount || 0} biji)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        Rp {((booking as any).costPerPerson || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        per orang
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Total: Rp {((booking as any).totalCost || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
