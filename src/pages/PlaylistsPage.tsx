import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { storage } from '../utils/storage';
import { Playlist } from '../types';
import { Link } from 'react-router-dom';

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [watchProgress, setWatchProgress] = useState(storage.getWatchProgress());

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const lists = storage.getPlaylists();
    setPlaylists(lists);
    if (lists.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(lists[0].id);
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = storage.addPlaylist(newPlaylistName.trim());
      setPlaylists(storage.getPlaylists());
      setSelectedPlaylist(newPlaylist.id);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleDeletePlaylist = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste?')) {
      storage.deletePlaylist(id);
      const updated = storage.getPlaylists();
      setPlaylists(updated);
      if (selectedPlaylist === id) {
        setSelectedPlaylist(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleRemoveVideo = (playlistId: string, videoId: string) => {
    storage.removeVideoFromPlaylist(playlistId, videoId);
    loadPlaylists();
  };

  const removeFromContinueWatching = (videoId: string) => {
    storage.removeWatchProgress(videoId);
    setWatchProgress(storage.getWatchProgress());
  };

  const selectedPlaylistData = playlists.find((p) => p.id === selectedPlaylist);

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mes Listes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Créer une liste
          </button>
        </div>

        {watchProgress.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Reprendre</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchProgress.map((item) => (
                <div key={item.videoId}>
                  <VideoCard
                    video={item.video}
                    showProgress
                    progress={item.progress}
                    onRemove={() => removeFromContinueWatching(item.videoId)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedPlaylist === playlist.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {playlist.name}
              <span className="text-sm opacity-75">({playlist.videos.length})</span>
            </button>
          ))}
        </div>

        {selectedPlaylistData ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedPlaylistData.name}</h2>
              <button
                onClick={() => handleDeletePlaylist(selectedPlaylistData.id)}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={20} />
                Supprimer
              </button>
            </div>

            {selectedPlaylistData.videos.length > 0 ? (
              <div className="space-y-4">
                {selectedPlaylistData.videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                  >
                    <Link
                      to={`/video/${video.assetId || video.id}`}
                      className="flex-shrink-0 w-48 aspect-video bg-gray-800 rounded overflow-hidden"
                    >
                      <img
                        src={video.illustration?.l}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/video/${video.assetId || video.id}`}>
                        <h3 className="text-lg font-bold mb-2 hover:text-blue-400 transition-colors">
                          {video.title}
                          {video.subtitle && ` - ${video.subtitle}`}
                        </h3>
                      </Link>
                      {video.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveVideo(selectedPlaylistData.id, video.id)
                      }
                      className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                Cette liste est vide. Ajoutez des vidéos depuis les pages de contenu.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Aucune liste créée. Créez votre première liste pour commencer.
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Créer une liste</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nom de la liste"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePlaylist();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
