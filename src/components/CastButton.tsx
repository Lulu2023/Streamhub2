import { useEffect, useState } from 'react';
import { Cast } from 'lucide-react';

declare global {
  interface Window {
    chrome: any;
    cast: any;
    __onGCastApiAvailable: (isAvailable: boolean) => void;
  }
}

interface CastButtonProps {
  onCastStateChange?: (isCasting: boolean) => void;
}

export function CastButton({ onCastStateChange }: CastButtonProps) {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) {
        initializeCastApi();
      }
    };

    if (window.cast && window.cast.framework) {
      initializeCastApi();
    }
  }, []);

  const initializeCastApi = () => {
    const context = window.cast.framework.CastContext.getInstance();

    context.setOptions({
      receiverApplicationId: window.chrome?.cast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome?.cast?.AutoJoinPolicy?.ORIGIN_SCOPED,
    });

    setIsCastAvailable(true);

    context.addEventListener(
      window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      (event: any) => {
        const castState = event.castState;
        const isConnected = castState === window.cast.framework.CastState.CONNECTED;
        setIsCasting(isConnected);

        if (onCastStateChange) {
          onCastStateChange(isConnected);
        }
      }
    );
  };

  const handleCastClick = () => {
    if (!isCastAvailable) return;

    const context = window.cast.framework.CastContext.getInstance();

    if (isCasting) {
      context.endCurrentSession(true);
    } else {
      context.requestSession();
    }
  };

  if (!isCastAvailable) {
    return null;
  }

  return (
    <button
      onClick={handleCastClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isCasting
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
      }`}
      title={isCasting ? 'Connecté au Chromecast' : 'Caster sur un appareil'}
    >
      <Cast size={20} className={isCasting ? 'text-blue-400' : ''} />
      <span className="hidden sm:inline">
        {isCasting ? 'Casting' : 'Cast'}
      </span>
    </button>
  );
}
