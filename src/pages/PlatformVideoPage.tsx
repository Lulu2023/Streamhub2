import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { VideoPlayer } from '../components/VideoPlayer';
import { AudioPlayer } from '../components/AudioPlayer';
import { unifiedPlatformsAPI } from '../services/unified-platforms-api';
import type { Platform } from '../types';

export function PlatformVideoPage() {
  const { platformSlug, contentType, contentId } = useParams<{
    platformSlug: string;
    contentType: string;
    contentId: string;
  }>();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamType, setStreamType] = useState<'hls' | 'dash' | 'mp4'>('hls');
  const [drmConfig, setDrmConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (platformSlug && contentId) {
      loadPlatformAndStream();
    }
  }, [platformSlug, contentId]);

  async function loadPlatformAndStream() {
    if (!platformSlug || !contentId) return;

    try {
      setLoading(true);
      setError(null);

      const platformData = await unifiedPlatformsAPI.getPlatformBySlug(platformSlug);
      setPlatform(platformData);

      if (platformData?.requires_auth) {
        setError('Cette plateforme nécessite une authentification. Veuillez vous connecter dans les paramètres.');
        setLoading(false);
        return;
      }

      const stream = await unifiedPlatformsAPI.getLiveStream(platformSlug, contentId);

      setStreamUrl(stream.url);
      setStreamType(stream.type);

      if (stream.drm) {
        setDrmConfig({
          servers: {
            'com.widevine.alpha': stream.drm.licenseUrl,
          },
        });
      }
    } catch (err: any) {
      console.error('Erreur chargement stream:', err);
      setError(err.message || 'Erreur lors du chargement de la vidéo');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="p-4">
          <BackButton />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement du flux vidéo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="p-4">
          <BackButton />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 max-w-md">
            <h3 className="text-red-500 font-bold mb-2">Erreur de lecture</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="p-4">
          <BackButton />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Aucun flux disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      {contentType === 'audio' ? (
        <AudioPlayer src={streamUrl} title={platform?.name || 'Lecture audio'} />
      ) : (
        <VideoPlayer
          src={streamUrl}
          manifestType={streamType}
          drm={drmConfig}
        />
      )}
    </div>
  );
}
