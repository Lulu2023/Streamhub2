import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { BackButton } from '../components/BackButton';
import { rtbfAPI } from '../services/rtbf-api';
import { Calendar } from 'lucide-react';

export function ProgramPage() {
  const { programId } = useParams();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<any>(null);
  const [seasons, setSeasons] = useState<number[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    if (programId) {
      loadProgramVideos();
    }
  }, [programId]);

  const loadProgramVideos = async () => {
    try {
      const data = await rtbfAPI.getProgramVideos(programId!);
      setVideos(data);

      if (data.length > 0) {
        const firstItem = data[0];
        const isAudioProgram = firstItem.is_radio || firstItem.type === 'audio' || firstItem.content_type === 'audio';

        setProgram({
          title: firstItem.program?.label || firstItem.program_title || 'Programme',
          description: firstItem.program_description || firstItem.description,
          isAudio: isAudioProgram,
        });

        if (data.length === 1) {
          window.location.href = `/video/${data[0].external_id || data[0].id}`;
          return;
        }

        const extractedSeasons = new Set<number>();
        data.forEach((video: any) => {
          const seasonMatch = video.subtitle?.match(/S(\d+)/) || video.title?.match(/Saison\s*(\d+)/i);
          if (seasonMatch) {
            extractedSeasons.add(parseInt(seasonMatch[1], 10));
          }
        });

        if (extractedSeasons.size > 0) {
          const seasonArray = Array.from(extractedSeasons).sort((a, b) => b - a);
          setSeasons(seasonArray);
          setSelectedSeason(seasonArray[0]);
        }
      }
    } catch (err: any) {
      console.error('Error loading program videos:', err);
      setError(err.message);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
        <Header showSearch />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        {program && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{program.title}</h1>
            {program.description && (
              <p className="text-gray-300 text-lg max-w-4xl">{program.description}</p>
            )}
          </div>
        )}

        {videos.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <h2 className="text-xl font-bold">
                  {seasons.length > 0 && selectedSeason
                    ? `Saison ${selectedSeason} - ${videos.filter((v: any) => {
                        const seasonMatch = v.subtitle?.match(/S(\d+)/) || v.title?.match(/Saison\s*(\d+)/i);
                        return seasonMatch && parseInt(seasonMatch[1], 10) === selectedSeason;
                      }).length} épisodes`
                    : `${videos.length} vidéos`}
                </h2>
              </div>

              {seasons.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Saison:</span>
                  <select
                    value={selectedSeason || ''}
                    onChange={(e) => setSelectedSeason(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Toutes les saisons</option>
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        Saison {season}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {videos
                .filter((video: any) => {
                  if (!selectedSeason) return true;
                  const seasonMatch = video.subtitle?.match(/S(\d+)/) || video.title?.match(/Saison\s*(\d+)/i);
                  return seasonMatch && parseInt(seasonMatch[1], 10) === selectedSeason;
                })
                .map((video) => (
                <div key={video.id} className="group">
                  <VideoCard
                    video={{
                      id: video.id,
                      assetId: video.external_id || video.id,
                      title: video.title,
                      subtitle: video.subtitle,
                      description: video.description,
                      illustration: {
                        l: video.images?.illustration?.['16x9']?.['1248x702'] || video.images?.cover?.['1x1']?.['770x770'] || '',
                      },
                      duration: video.duration,
                      publishedFrom: video.date_publish_from,
                      publishedTo: video.date_publish_to,
                      type: 'VIDEO',
                      programId: programId,
                      isAudioOnly: video.is_radio || video.type === 'audio' || video.content_type === 'audio',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : program?.isAudio ? (
          <div className="text-center py-16">
            <div className="bg-gray-900 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Programme Audio</h2>
              <p className="text-gray-400">Ce programme contient du contenu audio. Veuillez sélectionner un épisode pour l'écouter.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Aucune vidéo disponible pour ce programme
          </div>
        )}
      </div>
    </div>
  );
}
