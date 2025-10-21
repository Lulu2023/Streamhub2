import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { rtbfAPI } from '../services/rtbf-api';
import { formatTime } from '../utils/helpers';
import { Link } from 'react-router-dom';

interface EPGProgram {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  assetId?: string;
  illustration?: string;
}

interface EPGChannel {
  channelId: string;
  channelName: string;
  programs: EPGProgram[];
}

export function TVGuidePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [guide, setGuide] = useState<EPGChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTVGuide();
  }, [selectedDate]);

  const loadTVGuide = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rtbfAPI.getTVGuide(selectedDate);
      setGuide(data);
    } catch (err) {
      console.error('Error loading TV guide:', err);
      setError('Erreur lors du chargement du guide TV');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentlyPlaying = (program: EPGProgram) => {
    const now = new Date();
    const start = new Date(program.startTime);
    const end = new Date(program.endTime);
    return now >= start && now <= end;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Guide TV</h1>
          <button
            onClick={loadTVGuide}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 bg-gray-900 rounded-lg p-4">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center">
            <div className="text-xl font-bold">
              {isToday(selectedDate) ? "Aujourd'hui" : formatDate(selectedDate)}
            </div>
            {isToday(selectedDate) && (
              <div className="text-sm text-gray-400">{formatDate(selectedDate)}</div>
            )}
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-xl mb-2">Chargement du guide TV...</div>
              <div className="text-sm text-gray-400">Récupération des programmes en cours</div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadTVGuide}
              className="mt-4 px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : guide.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aucun programme disponible pour cette date</p>
            <p className="text-sm text-gray-500">
              Les données du guide TV peuvent être limitées ou temporairement indisponibles
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {guide.map((channel) => (
              <div key={channel.channelId} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-6 py-4">
                  <h2 className="text-xl font-bold">{channel.channelName}</h2>
                </div>
                <div className="p-4">
                  {channel.programs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Aucun programme disponible
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {channel.programs.map((program) => (
                        <div
                          key={program.id}
                          className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors ${
                            isCurrentlyPlaying(program) ? 'ring-2 ring-red-500' : ''
                          }`}
                        >
                          {isCurrentlyPlaying(program) && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-xs font-semibold uppercase text-red-500">
                                En direct
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mb-2">
                            {formatTime(program.startTime)} - {formatTime(program.endTime)}
                          </div>
                          <h3 className="font-bold mb-1 line-clamp-2">{program.title}</h3>
                          {program.subtitle && (
                            <p className="text-sm text-gray-300 mb-2 line-clamp-1">
                              {program.subtitle}
                            </p>
                          )}
                          {program.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                              {program.description}
                            </p>
                          )}
                          {program.assetId && (
                            <Link
                              to={`/video/${program.assetId}`}
                              state={{
                                video: {
                                  id: program.id,
                                  assetId: program.assetId,
                                  title: program.title,
                                  subtitle: program.subtitle,
                                  description: program.description,
                                  illustration: { l: program.illustration },
                                  type: 'VIDEO',
                                  duration: 0,
                                }
                              }}
                              className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Voir la vidéo
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
