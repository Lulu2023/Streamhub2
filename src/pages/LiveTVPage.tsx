import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Header } from '../components/Header';
import { rtbfAPI } from '../services/rtbf-api';
import { Link } from 'react-router-dom';
import { LiveProgram } from '../types';
import { formatTime } from '../utils/helpers';

export function LiveTVPage() {
  const [channels, setChannels] = useState<LiveProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const data = await rtbfAPI.getLiveChannels();
      const liveChannels = data.filter((ch: LiveProgram) => {
        const isLive = ch.is_live === true || (ch.is_live as any) === 1 || (ch.is_live as any) === '1';
        const hasExternalId = ch.external_id || ch.id;
        return isLive && hasExternalId;
      });
      setChannels(liveChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">TV en Direct</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel) => {
            const channelLabel = typeof channel.channel === 'string'
              ? channel.channel
              : channel.channel.label;
            const isSelected = selectedChannel === channel.id;

            return (
              <div key={channel.id} className="relative group">
                <Link
                  to={`/live/${channel.external_id || channel.id}`}
                  className="block relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={channel.images.illustration['16x9']['1248x702']}
                    alt={channelLabel}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold uppercase text-red-500">
                        Direct
                      </span>
                    </div>
                    <h3 className="text-sm font-bold line-clamp-1">
                      {channel.title}
                    </h3>
                    {channel.subtitle && (
                      <p className="text-xs text-gray-300 line-clamp-1">
                        {channel.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{formatTime(channel.start_date)}</span>
                      <span>-</span>
                      <span>{formatTime(channel.end_date)}</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setSelectedChannel(isSelected ? null : channel.id)}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white p-2 rounded-full transition-all z-10"
                >
                  <Info size={16} />
                </button>

                {isSelected && (
                  <div className="absolute top-14 right-2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-20 w-72 max-w-[calc(100vw-2rem)]">
                    <h4 className="font-bold mb-2">{channelLabel}</h4>
                    {channel.description && (
                      <p className="text-sm text-gray-300 mb-3">
                        {channel.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>
                        <strong>Programme:</strong> {channel.title}
                      </p>
                      <p>
                        <strong>Horaire:</strong> {formatTime(channel.start_date)} - {formatTime(channel.end_date)}
                      </p>
                      <p>
                        <strong>Disponibilité:</strong> {channel.geolock.title}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <h3 className="font-bold text-white">{channelLabel}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {channels.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Aucune chaîne en direct disponible pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
