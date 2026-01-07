'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Bell, Check, X, Eye, MessageCircle, UserPlus, Award, Bookmark, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ChatWindow from '@/components/chat/ChatWindow'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedId?: string
  actionUrl?: string
  senderId?: string
  senderName?: string
  senderImage?: string
}

interface ChatData {
  conversationId: string
  otherParticipant: {
    id: string
    name: string
    type: 'PLAYER' | 'RECRUITER' | 'HYBRID'
    club?: string
    position?: string
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'PROFILE_VIEW' | 'MESSAGE' | 'WATCHLIST_ADD'>('all')
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status, router])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/auth/user/notifications')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
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
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/auth/user/notifications/read-all')
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/auth/user/notifications/${notificationId}`)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // If it's a message notification, open the chat
    if (notification.type === 'MESSAGE' && notification.actionUrl) {
      // Extract conversation ID from actionUrl (format: /chat/{conversationId})
      const conversationId = notification.actionUrl.replace('/chat/', '')
      
      try {
        // Fetch conversation details to get other participant info
        const response = await axios.get(`/api/chat/conversations/${conversationId}`)
        const conversation = response.data.conversation
        
        if (conversation) {
          // Determine other participant based on current user role and conversation type
          let otherParticipant: ChatData['otherParticipant']
          
          // For HYBRID users, we need to check if they're the player or recruiter in this conversation
          const isHybridAsPlayer = session?.user?.role === 'HYBRID' && 
            conversation.playerId && 
            conversation.player?.user?.id === session.user.id
          
          if (session?.user?.role === 'PLAYER' || isHybridAsPlayer) {
            // User is the player in this conversation, so other participant is the recruiter
            otherParticipant = {
              id: conversation.recruiter?.id || '',
              name: conversation.recruiter?.user?.name || notification.senderName || 'Recruiter',
              type: 'RECRUITER',
              club: conversation.recruiter?.club?.name || ''
            }
          } else if (session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID') {
            // Check if this is a recruiter-to-recruiter conversation
            if (conversation.secondRecruiterId && !conversation.playerId) {
              // Recruiter-to-recruiter chat - find the other recruiter
              const isInitiator = notification.senderId !== session.user.id
              const otherRecruiter = isInitiator 
                ? conversation.recruiter 
                : conversation.secondRecruiter
              
              otherParticipant = {
                id: otherRecruiter?.id || '',
                name: otherRecruiter?.user?.name || notification.senderName || 'Recruiter',
                type: 'RECRUITER',
                club: otherRecruiter?.club?.name || ''
              }
            } else {
              // Recruiter/Hybrid is viewing player conversation (they are the recruiter)
              otherParticipant = {
                id: conversation.player?.id || '',
                name: conversation.player ? `${conversation.player.firstName} ${conversation.player.lastName}` : notification.senderName || 'Player',
                type: 'PLAYER',
                position: conversation.player?.positions?.join(', ') || ''
              }
            }
          } else {
            // Fallback for any other role
            otherParticipant = {
              id: notification.senderId || '',
              name: notification.senderName || 'User',
              type: 'PLAYER',
              position: ''
            }
          }

          setChatData({
            conversationId,
            otherParticipant
          })
          setShowChat(true)
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
        // Fallback: use notification data directly
        // Determine fallback type based on user role
        const fallbackType: 'PLAYER' | 'RECRUITER' = session?.user?.role === 'PLAYER' ? 'RECRUITER' : 'PLAYER'
        
        setChatData({
          conversationId,
          otherParticipant: {
            id: notification.senderId || '',
            name: notification.senderName || notification.title.replace('Message from ', ''),
            type: fallbackType,
            club: ''
          }
        })
        setShowChat(true)
      }
    }
  }

  const closeChat = () => {
    setShowChat(false)
    setChatData(null)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROFILE_VIEW':
        return <Eye className="w-5 h-5" />
      case 'MESSAGE':
        return <MessageCircle className="w-5 h-5" />
      case 'CHAT_REQUEST':
        return <UserPlus className="w-5 h-5" />
      case 'CLUB_INTEREST':
      case 'RECRUITER_INTEREST':
        return <Award className="w-5 h-5" />
      case 'WATCHLIST_ADD':
        return <Bookmark className="w-5 h-5" />
      case 'WATCHLIST_UPDATE':
      case 'PROFILE_UPDATE':
        return <RefreshCw className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
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

    // Handle watchlist notifications
    if (notification.type === 'WATCHLIST_ADD') {
      return {
        title: t('notifications.watchlistAdd'),
        message: notification.message
      }
    }

    if (notification.type === 'WATCHLIST_UPDATE' || notification.type === 'PROFILE_UPDATE') {
      return {
        title: notification.title,
        message: notification.message
      }
    }
    
    // Legacy format: use as-is
    return {
      title: notification.title,
      message: notification.message
    }
  }

  const filteredNotifications = notifications
    .filter(n => filter === 'unread' ? !n.read : true)
    .filter(n => typeFilter === 'all' ? true : n.type === typeFilter)

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('notifications.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('notifications.title')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} {t('notifications.unread')}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                  filter === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('notifications.all')} ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                  filter === 'unread'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('notifications.unreadOnly')} ({unreadCount})
              </button>
            </div>

            {/* Type Filter */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  typeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{t('notifications.all')}</span>
              </button>
              <button
                onClick={() => setTypeFilter('PROFILE_VIEW')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  typeFilter === 'PROFILE_VIEW'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{t('notifications.profileViews')}</span>
                <span className="hidden sm:inline">({notifications.filter(n => n.type === 'PROFILE_VIEW').length})</span>
              </button>
              <button
                onClick={() => setTypeFilter('MESSAGE')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  typeFilter === 'MESSAGE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{t('notifications.messages')}</span>
                <span className="hidden sm:inline">({notifications.filter(n => n.type === 'MESSAGE').length})</span>
              </button>
              <button
                onClick={() => setTypeFilter('WATCHLIST_ADD')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  typeFilter === 'WATCHLIST_ADD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{t('notifications.watchlist')}</span>
                <span className="hidden sm:inline">({notifications.filter(n => n.type === 'WATCHLIST_ADD').length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {filter === 'unread' ? t('notifications.noUnread') : t('notifications.noNotifications')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const { title, message } = getNotificationText(notification)
              const isClickable = notification.type === 'MESSAGE' && notification.actionUrl
              return (
              <div
                key={notification.id}
                onClick={isClickable ? () => handleNotificationClick(notification) : undefined}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 transition hover:shadow-xl ${
                  !notification.read ? 'border-l-4 border-red-600' : ''
                } ${isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : ''}`}
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                    !notification.read
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">
                          {title}
                        </h3>
                        {isClickable && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {t('notifications.clickToReply')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleString('de-CH')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm break-words">
                      {message}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition"
                        title={t('notifications.markRead')}
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                      title={t('notifications.delete')}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {showChat && chatData && session?.user && (
        <ChatWindow
          conversationId={chatData.conversationId}
          otherParticipant={chatData.otherParticipant}
          currentUserId={session.user.id}
          currentUserType={session.user.role as 'PLAYER' | 'RECRUITER' | 'HYBRID'}
          onClose={closeChat}
        />
      )}
    </div>
  )
}
