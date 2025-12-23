'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Eye, MessageCircle, UserPlus, Award } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { useLanguage } from '@/contexts/LanguageContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedId?: string
}

export default function NotificationPopup() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/auth/user/notifications?limit=5')
      const notifs = response.data.notifications || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length)
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/auth/user/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'profile_view':
      case 'PROFILE_VIEW':
        return <Eye className="w-4 h-4" />
      case 'message':
      case 'MESSAGE':
        return <MessageCircle className="w-4 h-4" />
      case 'connection':
        return <UserPlus className="w-4 h-4" />
      case 'achievement':
        return <Award className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    // Handle new translation key format
    if (notification.type === 'PROFILE_VIEW' && notification.title === 'notifications.profileViewed') {
      return {
        title: t('notifications.profileViewed'),
        message: t('notifications.profileViewedMessage').replace('{name}', notification.message)
      }
    }
    
    if (notification.type === 'MESSAGE' && !notification.title.includes('vo ')) {
      // New format: title is senderName, message is the actual message
      return {
        title: t('notifications.messageFrom').replace('{name}', notification.title),
        message: notification.message
      }
    }
    
    // Legacy format: use as-is
    return {
      title: notification.title,
      message: notification.message
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return t('notifications.justNow')
    if (diffMins < 60) return `${diffMins} ${t('notifications.minutes')}`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ${t('notifications.hours')}`
    return `${Math.floor(diffMins / 1440)} ${t('notifications.days')}`
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-600 dark:text-red-500' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup */}
      {showPopup && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup Content */}
          <div className="absolute right-0 top-12 z-50 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">{t('notifications.title')}</h3>
                {unreadCount > 0 && (
                  <span className="bg-white text-red-600 text-xs rounded-full px-2 py-0.5 font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="hover:bg-red-700 p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const { title, message } = getNotificationText(notification)
                  return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                      !notification.read ? 'bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        !notification.read
                          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              className="block p-3 text-center text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition border-t border-gray-200 dark:border-gray-700"
              onClick={() => setShowPopup(false)}
            >
              {t('notifications.viewAll')}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
