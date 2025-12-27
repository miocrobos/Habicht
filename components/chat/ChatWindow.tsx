'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, X, CheckCheck, Check, Smile } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface Message {
  id: string
  content: string
  senderId: string
  senderType: 'PLAYER' | 'RECRUITER'
  status: 'SENT' | 'DELIVERED' | 'READ'
  createdAt: string
  readAt?: string
}

interface ChatWindowProps {
  conversationId: string
  otherParticipant: {
    id: string
    name: string
    type: 'PLAYER' | 'RECRUITER'
    club?: string
    position?: string
  }
  currentUserId: string
  currentUserType: 'PLAYER' | 'RECRUITER'
  onClose: () => void
}

export default function ChatWindow({
  conversationId,
  otherParticipant,
  currentUserId,
  currentUserType,
  onClose
}: ChatWindowProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`)
      setMessages(response.data.messages)
      
      // Mark messages as read
      await axios.patch(`/api/chat/conversations/${conversationId}/read`)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await axios.post(`/api/chat/conversations/${conversationId}/messages`, {
        content: newMessage,
        senderType: currentUserType
      })

      setMessages([...messages, response.data.message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border-2 border-gray-200 dark:border-gray-700" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="bg-red-700 text-white px-4 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
            {otherParticipant.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold">{otherParticipant.name}</h3>
            <p className="text-xs text-white/80">
              {otherParticipant.type === 'RECRUITER' ? `Coach • ${otherParticipant.club}` : otherParticipant.position}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Lade Nachrichten...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Keine Nachrichten</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderType === currentUserType
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-white/70 justify-end' : 'text-gray-500'}`}>
                    <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
                    {isOwnMessage && (
                      <>
                        {message.status === 'READ' ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : message.status === 'DELIVERED' ? (
                          <CheckCheck className="w-3 h-3 opacity-50" />
                        ) : (
                          <Check className="w-3 h-3 opacity-50" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-2xl">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker
              onEmojiClick={(emojiObject: any) => {
                setNewMessage(prev => prev + emojiObject.emoji)
                setShowEmojiPicker(false)
              }}
              width={300}
              height={400}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-xl transition"
            title={t('chat.addEmoji')}
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.writeMessage')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
