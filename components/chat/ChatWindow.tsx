'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, X, CheckCheck, Check, Smile, Paperclip, Image as ImageIcon, FileText } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

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
  attachmentUrl?: string
  attachmentType?: 'image' | 'pdf'
  attachmentName?: string
}

interface ChatWindowProps {
  conversationId: string
  otherParticipant: {
    id: string
    name: string
    type: 'PLAYER' | 'RECRUITER' | 'HYBRID'
    club?: string
    position?: string
    profileImage?: string
  }
  currentUserId: string
  currentUserType: 'PLAYER' | 'RECRUITER' | 'HYBRID'
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
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingSentRef = useRef<number>(0)

  useEffect(() => {
    loadMessages()
    checkTypingStatus()
    const messageInterval = setInterval(loadMessages, 3000) // Poll every 3 seconds
    const typingInterval = setInterval(checkTypingStatus, 2000) // Check typing every 2 seconds
    return () => {
      clearInterval(messageInterval)
      clearInterval(typingInterval)
      // Clear typing status on unmount
      axios.delete(`/api/chat/conversations/${conversationId}/typing`).catch(() => {})
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkTypingStatus = async () => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/typing`)
      setIsOtherTyping(response.data.isTyping)
    } catch (error) {
      // Silently fail - typing indicator is not critical
    }
  }

  const sendTypingStatus = async () => {
    const now = Date.now()
    // Only send typing status every 2 seconds to avoid spamming
    if (now - lastTypingSentRef.current < 2000) return
    lastTypingSentRef.current = now
    
    try {
      await axios.post(`/api/chat/conversations/${conversationId}/typing`)
    } catch (error) {
      // Silently fail - typing indicator is not critical
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Send typing status
    if (e.target.value.trim()) {
      sendTypingStatus()
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to clear typing status after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        axios.delete(`/api/chat/conversations/${conversationId}/typing`).catch(() => {})
      }, 3000)
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    
    if (!isImage && !isPdf) {
      toast.error(t('chat.invalidFileType') || 'Only images and PDFs are allowed')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('chat.fileTooLarge') || 'File is too large (max 10MB)')
      return
    }

    setSelectedFile(file)
    
    // Create preview for images
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File): Promise<{ url: string; type: 'image' | 'pdf'; name: string } | null> => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      
      if (!cloudName || !uploadPreset) {
        console.error('Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.')
        return null
      }
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData
      )
      
      return {
        url: response.data.secure_url,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        name: file.name
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  // Determine the actual sender type for messages
  // HYBRID users need to be mapped to either PLAYER or RECRUITER based on context
  const getActualSenderType = (): 'PLAYER' | 'RECRUITER' => {
    if (currentUserType === 'PLAYER') return 'PLAYER'
    if (currentUserType === 'RECRUITER') return 'RECRUITER'
    // For HYBRID users, determine based on who the other participant is:
    // - If other is RECRUITER, we're the player in this conversation → send as PLAYER
    // - If other is PLAYER, we're the recruiter in this conversation → send as RECRUITER
    if (otherParticipant.type === 'RECRUITER') return 'PLAYER'
    return 'RECRUITER' // Default to RECRUITER for hybrid users chatting with players
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || sending || uploading) return

    setSending(true)
    setUploading(!!selectedFile)
    
    try {
      let attachmentData = null
      
      // Upload file if selected
      if (selectedFile) {
        attachmentData = await uploadFile(selectedFile)
        if (!attachmentData) {
          throw new Error('Failed to upload file')
        }
      }

      const actualSenderType = getActualSenderType()
      const response = await axios.post(`/api/chat/conversations/${conversationId}/messages`, {
        content: newMessage || (attachmentData ? `📎 ${attachmentData.name}` : ''),
        senderType: actualSenderType,
        attachmentUrl: attachmentData?.url,
        attachmentType: attachmentData?.type,
        attachmentName: attachmentData?.name
      })

      setMessages([...messages, response.data.message])
      setNewMessage('')
      clearSelectedFile()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-96 sm:max-w-[calc(100vw-2rem)] h-full sm:h-[500px] sm:max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border-2 border-gray-200 dark:border-gray-700" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-red-700 dark:bg-red-800 text-white px-4 py-3 sm:rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {otherParticipant.profileImage ? (
            <img 
              src={otherParticipant.profileImage} 
              alt={otherParticipant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {otherParticipant.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">{otherParticipant.name}</h3>
            <p className="text-xs text-white/80 truncate max-w-[180px] sm:max-w-none">
              {otherParticipant.type === 'RECRUITER' ? `Coach • ${otherParticipant.club}` : otherParticipant.position}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('chat.loadingMessages')}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p>{t('chat.noMessages')}</p>
            <p className="text-sm">{t('chat.startConversation')}</p>
          </div>
        ) : (
          messages.map((message) => {
            // For HYBRID users, check if they sent the message by comparing with actual sender type
            const actualSenderType = getActualSenderType()
            const isOwnMessage = currentUserType === 'HYBRID' 
              ? message.senderType === actualSenderType
              : message.senderType === currentUserType
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-red-600 dark:bg-red-700 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {/* Attachment display */}
                  {message.attachmentUrl && (
                    <div className="mb-2">
                      {message.attachmentType === 'image' ? (
                        <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Image 
                            src={message.attachmentUrl} 
                            alt={message.attachmentName || 'Image'} 
                            width={200}
                            height={150}
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <a 
                          href={message.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            isOwnMessage ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                          } transition`}
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-sm truncate max-w-[150px]">{message.attachmentName || 'Document'}</span>
                        </a>
                      )}
                    </div>
                  )}
                  {message.content && !message.content.startsWith('📎') && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-white/70 justify-end' : 'text-gray-500 dark:text-gray-400'}`}>
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
        
        {/* Typing Indicator */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('chat.typing') || 'typing...'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sm:rounded-b-2xl pb-safe">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" width={48} height={48} className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={clearSelectedFile}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
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
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          className="hidden"
        />
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title={t('chat.addEmoji')}
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title={t('chat.attachFile') || 'Attach file'}
            disabled={uploading}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={t('chat.writeMessage')}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            disabled={sending || uploading}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
            className="flex-shrink-0 bg-red-600 dark:bg-red-700 text-white p-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
