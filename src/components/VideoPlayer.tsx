import { useEffect, useRef, useState } from 'react';
import { rtbfAPI } from '../services/rtbf-api';
import { storage } from '../utils/storage';
import { CastButton } from './CastButton';
import { CastControls } from './CastControls';
import { useCast } from '../hooks/useCast';

declare const shaka: any;

interface VideoPlayerProps {
  assetId: string;
  videoData?: any;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({ assetId, videoData, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const { isCasting, loadVideoMedia } = useCast();

  useEffect(() => {
    if (typeof shaka === 'undefined') {
      setError('Le lecteur vidéo n\'est pas encore chargé. Veuillez rafraîchir la page.');
      setLoading(false);
      return;
    }

    if (!shaka.Player.isBrowserSupported()) {
      setError('Votre navigateur ne supporte pas la lecture vidéo avec DRM');
      setLoading(false);
      return;
    }

    let player: shaka.Player | null = null;
    let isMounted = true;

    const initPlayer = async () => {
      try {
        if (!videoRef.current || !containerRef.current) return;

        player = new shaka.Player();
        await player!.attach(videoRef.current);
        playerRef.current = player;

        player!.configure({
          drm: {
            servers: {},
          },
          streaming: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 3,
              baseDelay: 1000,
              backoffFactor: 2,
            },
          },
        });

        const streamData = await rtbfAPI.getVideoStream(assetId);

        if (!streamData.formats || streamData.formats.length === 0) {
          if (streamData.httpCode === 403 && streamData.message === 'NOT_ENTITLED') {
            throw new Error('Ce contenu est disponible uniquement avec un abonnement Sooner Premium. Ce contenu nécessite un abonnement payant pour être visionné.');
          }
          throw new Error('Aucun format vidéo disponible');
        }

        const FORMAT_PRIORITY: { [key: string]: number } = {
          '': 0,
          'MSS': 1,
          'AAC': 2,
          'MP3': 3,
          'SMOOTHSTREAMING': 4,
          'HLS': 5,
          'DASH': 6,
        };

        const sortedFormats = [...streamData.formats].sort((a, b) => {
          const priorityA = FORMAT_PRIORITY[a.format?.toUpperCase() || ''] || 0;
          const priorityB = FORMAT_PRIORITY[b.format?.toUpperCase() || ''] || 0;
          return priorityB - priorityA;
        });

        let selectedFormat: any = null;
        let licenseUrl: string | null = null;

        for (const format of sortedFormats) {
          if (!format.format || !format.mediaLocator) continue;

          selectedFormat = format;

          if (format.drm && Object.keys(format.drm).length > 0) {
            if (format.drm['com.widevine.alpha']) {
              licenseUrl = format.drm['com.widevine.alpha'].licenseServerUrl;
              break;
            }
          } else if (format.format.toUpperCase() === 'HLS') {
            break;
          }
        }

        if (!selectedFormat) {
          throw new Error('Aucun format compatible trouvé');
        }

        if (licenseUrl) {
          setLicenseUrl(licenseUrl);
          player!.configure({
            drm: {
              servers: {
                'com.widevine.alpha': licenseUrl,
              },
            },
          });

          if (selectedFormat.drm?.['com.widevine.alpha']?.certificateUrl) {
            try {
              const certUrl = selectedFormat.drm['com.widevine.alpha'].certificateUrl;
              const certResponse = await fetch(certUrl);
              const certData = await certResponse.arrayBuffer();

              player!.configure({
                drm: {
                  advanced: {
                    'com.widevine.alpha': {
                      serverCertificate: new Uint8Array(certData),
                    },
                  },
                },
              });
            } catch (certErr) {
              console.warn('Certificate fetch failed, continuing without it:', certErr);
            }
          }
        }

        await player!.load(selectedFormat.mediaLocator);
        setStreamUrl(selectedFormat.mediaLocator);

        const progressList = storage.getWatchProgress();
        const savedProgress = progressList.find((p) => p.videoId === assetId);
        if (savedProgress && videoRef.current) {
          videoRef.current.currentTime = savedProgress.progress * videoRef.current.duration;
        }

        if (isMounted) {
          setLoading(false);
        }

        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

      } catch (err: any) {
        console.error('Error initializing player:', err);
        if (isMounted) {
          const errorMsg = err.message || 'Erreur lors du chargement de la vidéo';
          setError(errorMsg);
          setLoading(false);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && videoData) {
        const progress = videoRef.current.currentTime / videoRef.current.duration;
        if (onProgress) {
          onProgress(progress);
        }
        storage.updateWatchProgress(assetId, progress, videoData);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [assetId, videoData, onProgress]);

  useEffect(() => {
    if (isCasting && streamUrl && videoData) {
      loadVideoMedia(
        streamUrl,
        videoData.title,
        licenseUrl || undefined,
        videoData.subtitle,
        videoData.illustration?.l,
        videoData,
        assetId
      );
    }
  }, [isCasting, streamUrl, videoData, assetId, licenseUrl, loadVideoMedia]);

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-8 text-center rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      <div className="absolute top-4 right-4 z-10">
        <CastButton />
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white">Chargement...</div>
        </div>
      )}
      {isCasting ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-8">
          <div className="text-center max-w-2xl">
            {videoData?.illustration?.l && (
              <img
                src={videoData.illustration.l}
                alt={videoData.title}
                className="w-64 h-36 object-cover rounded-lg shadow-2xl mb-6 mx-auto"
              />
            )}
            <h3 className="text-2xl font-bold mb-2">{videoData?.title}</h3>
            {videoData?.subtitle && (
              <p className="text-gray-400 mb-4">{videoData.subtitle}</p>
            )}
            <p className="text-blue-400 mb-6">Diffusion en cours sur votre Chromecast</p>
            <CastControls />
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
        />
      )}
    </div>
  );
}
