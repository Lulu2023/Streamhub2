import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Clock, Plus, Check, ChevronRight, ChevronDown, ChevronUp, Calendar, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { VideoPlayer } from '../components/VideoPlayer';
import { AudioPlayer } from '../components/AudioPlayer';
import { VideoCard } from '../components/VideoCard';
import { BackButton } from '../components/BackButton';
import { storage } from '../utils/storage';
import { rtbfAPI } from '../services/rtbf-api';
import { Playlist } from '../types';

export function VideoDetailPage() {
  const { videoId } = useParams();
  const location = useLocation();
  const [videoData, setVideoData] = useState<any>(location.state?.video || null);
  const [loading, setLoading] = useState(!location.state?.video);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [programInfo, setProgramInfo] = useState<any>(null);
  const [showFullCast, setShowFullCast] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullProgramDescription, setShowFullProgramDescription] = useState(false);

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    if (location.state?.video) {
      setVideoData(location.state.video);
      setLoading(false);

      if (location.state.video.programId) {
        try {
          const programData = await rtbfAPI.getProgramDetails(location.state.video.programId);
          if (programData) {
            setProgramInfo(programData);
            setRelatedVideos(programData.videos.filter((v: any) => v.id !== videoId).slice(0, 8));
          }
        } catch (error) {
          console.error('Error loading program data:', error);
        }
      }
    } else if (videoId) {
      try {
        const data = await rtbfAPI.getVideoDetails(videoId);
        if (data) {
          const video = {
            id: data.id,
            assetId: data.external_id || data.id,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            illustration: {
              l: data.images?.illustration?.['16x9']?.['1248x702'] || '',
            },
            duration: data.duration,
            publishedFrom: data.date_publish_from,
            publishedTo: data.date_publish_to,
            type: 'VIDEO' as const,
            programId: data.program?.id,
            casting: data.casting,
            category: data.category?.label,
            channel: data.channel?.label,
            isAudioOnly: data.is_radio || data.type === 'audio' || data.content_type === 'audio',
          };
          setVideoData(video);

          if (data.program?.id) {
            const programData = await rtbfAPI.getProgramDetails(data.program.id);
            if (programData) {
              setProgramInfo(programData);
              setRelatedVideos(programData.videos.filter((v: any) => v.id !== videoId).slice(0, 8));
            }
          }
        }
      } catch (error) {
        console.error('Error loading video details:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const togglePlaylistSelection = (playlistId: string) => {
    setSelectedPlaylists((prev) => {
      if (prev.includes(playlistId)) {
        return prev.filter((id) => id !== playlistId);
      }
      return [...prev, playlistId];
    });
  };

  const confirmAddToPlaylists = () => {
    if (videoData) {
      selectedPlaylists.forEach((playlistId) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        const isAlreadyInPlaylist = playlist?.videos.some((v) => v.id === videoId);
        if (!isAlreadyInPlaylist) {
          storage.addVideoToPlaylist(playlistId, videoData);
        }
      });
      setPlaylists(storage.getPlaylists());
      setShowPlaylistModal(false);
      setSelectedPlaylists([]);
    }
  };

  const isInPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    return playlist?.videos.some((v) => v.id === videoId);
  };

  useEffect(() => {
    if (showPlaylistModal) {
      const initialSelected = playlists
        .filter((p) => isInPlaylist(p.id))
        .map((p) => p.id);
      setSelectedPlaylists(initialSelected);
    }
  }, [showPlaylistModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
        <Header showSearch />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!videoId || !videoData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
        <Header showSearch />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-400">Vidéo introuvable</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const getDaysUntilExpiration = (dateStr: string) => {
    if (!dateStr) return null;
    const expirationDate = new Date(dateStr);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (dateStr: string) => {
    const days = getDaysUntilExpiration(dateStr);
    return days !== null && days >= 0 && days < 7;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className={`${videoData.isAudioOnly ? 'mb-6' : 'aspect-video'} bg-black rounded-lg overflow-hidden mb-6`}>
            {videoData.isAudioOnly ? (
              <AudioPlayer
                assetId={videoId}
                audioData={videoData}
                onProgress={(progress) => {
                  console.log('Progress:', progress);
                }}
              />
            ) : (
              <VideoPlayer
                assetId={videoId}
                videoData={videoData}
                onProgress={(progress) => {
                  console.log('Progress:', progress);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{videoData.title}</h1>
              {videoData.subtitle && (
                <p className="text-xl text-gray-300 mb-3">{videoData.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                {videoData.duration && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {formatDuration(videoData.duration)}
                  </span>
                )}
                {videoData.publishedFrom && (
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(videoData.publishedFrom)}
                  </span>
                )}
                {videoData.category && (
                  <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                    {videoData.category}
                  </span>
                )}
                {videoData.channel && (
                  <span className="bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full text-sm text-blue-300">
                    {videoData.channel}
                  </span>
                )}
              </div>

              {videoData.publishedTo && (
                <div className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isExpiringSoon(videoData.publishedTo)
                    ? 'bg-red-900 bg-opacity-30 text-red-300'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {isExpiringSoon(videoData.publishedTo) && <AlertCircle size={18} />}
                  <span className="text-sm">
                    Disponible jusqu'au {formatDate(videoData.publishedTo)}
                    {getDaysUntilExpiration(videoData.publishedTo) !== null && (
                      <span className="font-semibold ml-2">
                        ({getDaysUntilExpiration(videoData.publishedTo)} jour{getDaysUntilExpiration(videoData.publishedTo) !== 1 ? 's' : ''} restant{getDaysUntilExpiration(videoData.publishedTo) !== 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Ajouter à une liste
              </button>
            </div>

            {videoData.description && (
              <div>
                <h2 className="text-xl font-bold mb-2">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {showFullDescription || videoData.description.length <= 300
                    ? videoData.description
                    : `${videoData.description.substring(0, 300)}...`}
                </p>
                {videoData.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    {showFullDescription ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>
            )}

            {videoData.casting && videoData.casting.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Distribution</h2>
                <div className="space-y-2">
                  {(showFullCast ? videoData.casting : videoData.casting.slice(0, 3)).map((person: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="font-medium text-white">
                          {person.firstname} {person.lastname}
                        </p>
                        <p className="text-sm text-gray-400">{person.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {videoData.casting.length > 3 && (
                  <button
                    onClick={() => setShowFullCast(!showFullCast)}
                    className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showFullCast ? (
                      <>
                        <ChevronUp size={18} />
                        Voir moins
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} />
                        Voir plus ({videoData.casting.length - 3} de plus)
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {programInfo && (
              <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Programme : {programInfo.title}</h2>
                  <Link
                    to={`/program/${programInfo.id}`}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Voir tous les épisodes
                    <ChevronRight size={20} />
                  </Link>
                </div>
                {programInfo.description && (
                  <>
                    <p className="text-gray-400 mb-2">
                      {showFullProgramDescription || programInfo.description.length <= 200
                        ? programInfo.description
                        : `${programInfo.description.substring(0, 200)}...`}
                    </p>
                    {programInfo.description.length > 200 && (
                      <button
                        onClick={() => setShowFullProgramDescription(!showFullProgramDescription)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm mb-4"
                      >
                        {showFullProgramDescription ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {relatedVideos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Autres épisodes</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {relatedVideos.map((video: any) => (
                    <VideoCard
                      key={video.id}
                      video={{
                        id: video.id,
                        assetId: video.external_id || video.id,
                        title: video.title,
                        subtitle: video.subtitle,
                        description: video.description,
                        illustration: {
                          l: video.images?.illustration?.['16x9']?.['1248x702'] || '',
                        },
                        duration: video.duration,
                        publishedFrom: video.date_publish_from,
                        type: 'VIDEO',
                        programId: programInfo.id,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Ajouter à une liste</h2>

            {playlists.length > 0 ? (
              <>
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylists.includes(playlist.id);
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => togglePlaylistSelection(playlist.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        <span>{playlist.name}</span>
                        {isSelected && <Check size={20} />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPlaylistModal(false);
                      setSelectedPlaylists([]);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <Link
                    to="/playlists"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-center"
                  >
                    Gérer
                  </Link>
                  <button
                    onClick={confirmAddToPlaylists}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold"
                  >
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-4 text-center py-8">
                  Aucune liste n'est encore créée
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPlaylistModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  <Link
                    to="/playlists"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-center"
                  >
                    Gérer les listes
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
