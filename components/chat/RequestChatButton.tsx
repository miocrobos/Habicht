'use client'

import { useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import axios from 'axios'

interface RequestChatButtonProps {
  coach: {
    id: string
    firstName: string
    lastName: string
    club: string
    role: string
  }
  playerId: string
}

export default function RequestChatButton({ coach, playerId }: RequestChatButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const sendRequest = async () => {
    if (!message.trim()) {
      setError('Bitte schreib eine kurze Nachricht')
      return
    }

    setLoading(true)
    setError('')

    try {
      await axios.post('/api/chat/requests', {
        recruiterId: coach.id,
        playerId,
        message
      })

      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
        setMessage('')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Senden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <MessageCircle className="w-4 h-4" />
        Kontakt aufnehmen
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Anfrage gesendet!</h3>
                <p className="text-gray-600">
                  {coach.firstName} {coach.lastName} wird deine Anfrage prüfen.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Kontaktanfrage</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {coach.firstName} {coach.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{coach.role} • {coach.club}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deine Nachricht *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="z.B. Hallo, ich bin sehr interessiert an eurem Club und würde gerne mehr über Trainingsmöglichkeiten erfahren..."
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={sendRequest}
                    disabled={loading || !message.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Wird gesendet...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Anfrage senden
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
