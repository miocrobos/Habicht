'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, Video as VideoIcon, ExternalLink, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Video {
  id: string;
  url: string;
  title?: string;
  description?: string;
  videoType: string;
  createdAt: string;
}

interface VideoManagerProps {
  playerId: string;
  isOwner: boolean;
}

export default function VideoManager({ playerId, isOwner }: VideoManagerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newVideo, setNewVideo] = useState({
    url: '',
    title: '',
    description: '',
    videoType: 'HIGHLIGHT',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();
  }, [playerId]);

  const loadVideos = async () => {
    try {
      const response = await axios.get(`/api/players/${playerId}/videos`);
      setVideos(response.data.videos);
      setLoading(false);
    } catch (err) {
      console.error('Error loading videos:', err);
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.url.trim()) {
      setError('Bitte Gib En Video-URL II');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const response = await axios.post(`/api/players/${playerId}/videos`, newVideo);
      setVideos([response.data.video, ...videos]);
      setNewVideo({ url: '', title: '', description: '', videoType: 'HIGHLIGHT' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler Bim Hinzuefüge Vo Video');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Bisch Du Sicher, Dass Du Das Video Lösche Möchtisch?')) {
      return;
    }

    try {
      await axios.delete(`/api/players/${playerId}/videos/${videoId}`);
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler Bim Lösche Vo Video');
    }
  };

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    // Add more video platform conversions as needed
    return url;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <VideoIcon className="w-6 h-6 text-red-600" />
          Videos ({videos.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Add Video Form */}
      {isOwner && (
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Neus Video Hinzuefüge
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video URL * (YouTube, Vimeo, etc.)
              </label>
              <input
                type="url"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titel (Optional)
              </label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                placeholder="z.B. Highlights 2024/25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beschriibig (Optional)
              </label>
              <textarea
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                rows={2}
                placeholder="Beschriib Das Video..."
              />
            </div>
            <button
              onClick={handleAddVideo}
              disabled={adding || !newVideo.url.trim()}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird Hinzugefügt...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Video Hinzuefüge
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {isOwner ? 'Nonig Videos Hinzugefügt. Füeg Dis Erschte Video Obe Hinzu!' : 'Kei Videos Verfüegbar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="aspect-video bg-gray-900">
                <iframe
                  src={getEmbedUrl(video.url)}
                  className="w-full h-full"
                  allowFullScreen
                  title={video.title || 'Video'}
                />
              </div>
              <div className="p-4">
                {video.title && (
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h4>
                )}
                {video.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Original Link
                  </a>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Lösche
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
