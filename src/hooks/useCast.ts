import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';

interface MediaInfo {
  contentId: string;
  contentType: string;
  streamType: 'BUFFERED' | 'LIVE';
  metadata: {
    type: number;
    title: string;
    subtitle?: string;
    images?: Array<{ url: string }>;
  };
}

export function useCast() {
  const [isCasting, setIsCasting] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);
  const [remotePlayer, setRemotePlayer] = useState<any>(null);
  const [remotePlayerController, setRemotePlayerController] = useState<any>(null);

  useEffect(() => {
    if (!window.cast || !window.cast.framework) {
      return;
    }

    const context = window.cast.framework.CastContext.getInstance();
    const player = new window.cast.framework.RemotePlayer();
    const controller = new window.cast.framework.RemotePlayerController(player);

    setRemotePlayer(player);
    setRemotePlayerController(controller);

    const sessionListener = () => {
      const session = context.getCurrentSession();
      setCastSession(session);
      setIsCasting(!!session);
    };

    context.addEventListener(
      window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      sessionListener
    );

    const currentSession = context.getCurrentSession();
    if (currentSession) {
      setCastSession(currentSession);
      setIsCasting(true);
    }

    return () => {
      context.removeEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        sessionListener
      );
    };
  }, []);

  const loadMedia = useCallback(
    (mediaInfo: MediaInfo, drmConfig?: any, videoData?: any, assetId?: string) => {
      if (!castSession) {
        console.error('No active cast session');
        return;
      }

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = 0;

      if (drmConfig) {
        request.media.customData = drmConfig;
      }

      if (assetId && videoData) {
        const progressList = storage.getWatchProgress();
        const savedProgress = progressList.find((p) => p.videoId === assetId);
        if (savedProgress) {
          request.currentTime = savedProgress.progress * (videoData.duration || 0);
        }
      }

      castSession
        .loadMedia(request)
        .then(() => {
          console.log('Media loaded successfully');

          if (assetId && videoData) {
            const media = castSession.getMediaSession();
            if (media) {
              media.addUpdateListener(() => {
                const currentTime = media.getEstimatedTime();
                const duration = media.media.duration;
                if (duration > 0) {
                  const progress = currentTime / duration;
                  storage.updateWatchProgress(assetId, progress, videoData);
                }
              });
            }
          }
        })
        .catch((error: any) => {
          console.error('Error loading media:', error);
        });
    },
    [castSession]
  );

  const loadVideoMedia = useCallback(
    (contentId: string, title: string, licenseUrl?: string, subtitle?: string, imageUrl?: string, videoData?: any, assetId?: string) => {
      const mediaInfo: any = {
        contentId,
        contentType: 'application/dash+xml',
        streamType: 'BUFFERED' as const,
        metadata: {
          type: window.chrome.cast.media.MetadataType.MOVIE,
          title,
          subtitle,
          images: imageUrl ? [{ url: imageUrl }] : [],
        },
      };

      if (licenseUrl) {
        mediaInfo.customData = {
          licenseUrl,
          widevine: {
            licenseUrl,
          },
        };
      }

      loadMedia(mediaInfo, undefined, videoData, assetId);
    },
    [loadMedia]
  );

  const loadAudioMedia = useCallback(
    (contentId: string, title: string, subtitle?: string, imageUrl?: string, videoData?: any, assetId?: string) => {
      const mediaInfo = {
        contentId,
        contentType: 'audio/mpeg',
        streamType: 'BUFFERED' as const,
        metadata: {
          type: window.chrome.cast.media.MetadataType.MUSIC_TRACK,
          title,
          subtitle,
          images: imageUrl ? [{ url: imageUrl }] : [],
        },
      };

      loadMedia(mediaInfo, undefined, videoData, assetId);
    },
    [loadMedia]
  );

  const play = useCallback(() => {
    if (remotePlayerController && remotePlayer.isPaused) {
      remotePlayerController.playOrPause();
    }
  }, [remotePlayer, remotePlayerController]);

  const pause = useCallback(() => {
    if (remotePlayerController && !remotePlayer.isPaused) {
      remotePlayerController.playOrPause();
    }
  }, [remotePlayer, remotePlayerController]);

  const stop = useCallback(() => {
    if (remotePlayerController) {
      remotePlayerController.stop();
    }
  }, [remotePlayerController]);

  const seek = useCallback(
    (time: number) => {
      if (remotePlayer) {
        remotePlayer.currentTime = time;
        remotePlayerController.seek();
      }
    },
    [remotePlayer, remotePlayerController]
  );

  return {
    isCasting,
    castSession,
    remotePlayer,
    loadVideoMedia,
    loadAudioMedia,
    play,
    pause,
    stop,
    seek,
  };
}
