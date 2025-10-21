import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useCast } from '../hooks/useCast';

export function CastControls() {
  const { isCasting, remotePlayer, remotePlayerController, play, pause, seek } = useCast();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!remotePlayer || !remotePlayerController) return;

    const updateListener = () => {
      setCurrentTime(remotePlayer.currentTime);
      setDuration(remotePlayer.duration);
      setIsPaused(remotePlayer.isPaused);
    };

    remotePlayerController.addEventListener(
      window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
      updateListener
    );
    remotePlayerController.addEventListener(
      window.cast.framework.RemotePlayerEventType.DURATION_CHANGED,
      updateListener
    );
    remotePlayerController.addEventListener(
      window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
      updateListener
    );

    updateListener();

    return () => {
      remotePlayerController.removeEventListener(
        window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        updateListener
      );
      remotePlayerController.removeEventListener(
        window.cast.framework.RemotePlayerEventType.DURATION_CHANGED,
        updateListener
      );
      remotePlayerController.removeEventListener(
        window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
        updateListener
      );
    };
  }, [remotePlayer, remotePlayerController]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleSkipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isCasting) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Contrôles Chromecast</h3>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleSkipBackward}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          aria-label="Reculer de 10 secondes"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={() => isPaused ? play() : pause()}
          className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          aria-label={isPaused ? 'Lecture' : 'Pause'}
        >
          {isPaused ? <Play size={24} className="ml-0.5" /> : <Pause size={24} />}
        </button>

        <button
          onClick={handleSkipForward}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          aria-label="Avancer de 10 secondes"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
