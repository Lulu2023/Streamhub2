import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { rtbfAPI } from '../services/rtbf-api';
import { storage } from '../utils/storage';
import { CastButton } from './CastButton';
import { CastControls } from './CastControls';
import { useCast } from '../hooks/useCast';

interface AudioPlayerProps {
  assetId: string;
  audioData?: any;
  onProgress?: (progress: number) => void;
}

export function AudioPlayer({ assetId, audioData, onProgress }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { isCasting, loadAudioMedia } = useCast();

  useEffect(() => {
    let isMounted = true;

    const initPlayer = async () => {
      try {
        if (!audioRef.current) return;

        const streamData = await rtbfAPI.getVideoStream(assetId);

        if (!streamData.formats || streamData.formats.length === 0) {
          throw new Error('Aucun format audio disponible');
        }

        const audioFormat = streamData.formats.find((f: any) =>
          f.format?.toUpperCase() === 'MP3' || f.format?.toUpperCase() === 'AAC'
        );

        if (!audioFormat) {
          throw new Error('Format audio non supporté');
        }

        audioRef.current.src = audioFormat.mediaLocator;
        setAudioUrl(audioFormat.mediaLocator);

        const progressList = storage.getWatchProgress();
        const savedProgress = progressList.find((p) => p.videoId === assetId);
        if (savedProgress && audioRef.current) {
          audioRef.current.currentTime = savedProgress.progress * audioRef.current.duration;
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error initializing audio player:', err);
        if (isMounted) {
          const errorMsg = err.message || 'Erreur lors du chargement de l\'audio';
          setError(errorMsg);
          setLoading(false);
        }
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  useEffect(() => {
    if (isCasting && audioUrl && audioData) {
      loadAudioMedia(
        audioUrl,
        audioData.title,
        audioData.subtitle,
        audioData.illustration?.l,
        audioData,
        assetId
      );
    }
  }, [isCasting, audioUrl, audioData, assetId, loadAudioMedia]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audioData && audio.duration) {
        const progress = audio.currentTime / audio.duration;
        if (onProgress) {
          onProgress(progress);
        }
        storage.updateWatchProgress(assetId, progress, audioData);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [assetId, audioData, onProgress]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-gray-900 text-white p-8 text-center rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 relative">
      <div className="absolute top-4 right-4 z-10">
        <CastButton />
      </div>

      {loading && (
        <div className="text-center text-white mb-4">Chargement de l'audio...</div>
      )}

      {isCasting && (
        <div className="text-center mb-4">
          <p className="text-blue-400 font-semibold mb-4">
            Diffusion en cours sur votre Chromecast Audio
          </p>
          <CastControls />
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {audioData?.illustration && (
          <div className="w-64 h-64 rounded-lg overflow-hidden shadow-2xl">
            <img
              src={audioData.illustration.l}
              alt={audioData.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              disabled={loading}
              className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={loading}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} />

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
