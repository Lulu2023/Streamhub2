import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { VideoPlayer } from '../components/VideoPlayer';
import { BackButton } from '../components/BackButton';
import { rtbfAPI } from '../services/rtbf-api';
import { LiveProgram } from '../types';
import { formatTime } from '../utils/helpers';
import { Clock } from 'lucide-react';

export function LiveDetailPage() {
  const { liveId } = useParams();
  const [channel, setChannel] = useState<LiveProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (liveId) {
      loadChannelDetails();
    }
  }, [liveId]);

  const loadChannelDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rtbfAPI.getLiveChannelDetails(liveId!);

      if (!data) {
        setError('Impossible de charger les informations du direct');
      } else {
        setChannel(data);
      }
    } catch (err) {
      console.error('Error loading channel details:', err);
      setError('Erreur lors du chargement des informations');
    } finally {
      setLoading(false);
    }
  };

  if (!liveId) {
    return (
      <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
        <Header showSearch />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-400">Direct introuvable</p>
        </div>
      </div>
    );
  }

  const channelLabel = channel?.channel
    ? typeof channel.channel === 'string'
      ? channel.channel
      : channel.channel.label
    : 'Chaîne inconnue';

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <VideoPlayer assetId={liveId} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-lg font-bold uppercase text-red-500">En direct</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Chargement des informations...</div>
            </div>
          ) : error ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400">{error}</p>
            </div>
          ) : channel ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span>{channelLabel}</span>
                </div>
                <h1 className="text-3xl font-bold mb-3">{channel.title}</h1>
                {channel.subtitle && (
                  <p className="text-xl text-gray-300 mb-3">{channel.subtitle}</p>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  <span>{formatTime(channel.start_date)} - {formatTime(channel.end_date)}</span>
                </div>
              </div>

              {channel.description && (
                <div>
                  <h2 className="text-xl font-bold mb-2">À propos</h2>
                  <p className="text-gray-300 leading-relaxed">{channel.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-900 rounded-lg p-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Disponibilité</div>
                  <div className="font-medium">{channel.geolock?.title || 'Non spécifiée'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">DRM</div>
                  <div className="font-medium">{channel.drm ? 'Oui' : 'Non'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Statut</div>
                  <div className="font-medium text-green-400">En direct</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Aucune information disponible pour ce direct</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
