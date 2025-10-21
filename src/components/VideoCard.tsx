import { Play, Clock, AlertCircle } from 'lucide-react';
import { Video } from '../types';
import { formatDuration } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useEffect, useState } from 'react';

interface VideoCardProps {
  video: Video;
  showProgress?: boolean;
  progress?: number;
  onRemove?: () => void;
}

export function VideoCard({ video, showProgress, progress, onRemove }: VideoCardProps) {
  const [watchProgress, setWatchProgress] = useState<number | null>(null);

  useEffect(() => {
    const progressList = storage.getWatchProgress();
    const savedProgress = progressList.find((p) => p.videoId === (video.assetId || video.id));
    if (savedProgress) {
      setWatchProgress(savedProgress.progress);
    }
  }, [video.assetId, video.id]);
  const linkTarget = video.resourceType === 'PROGRAM'
    ? `/program/${video.id}`
    : `/video/${video.assetId || video.id}`;

  const getDaysUntilExpiration = (dateStr?: string) => {
    if (!dateStr) return null;
    const expirationDate = new Date(dateStr);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (dateStr?: string) => {
    const days = getDaysUntilExpiration(dateStr);
    return days !== null && days >= 0 && days < 7;
  };

  return (
    <Link
      to={linkTarget}
      state={{ video }}
      className="group relative block"
    >
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={video.illustration?.l}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {(showProgress && progress !== undefined) || (watchProgress !== null && watchProgress > 0.05) ? (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-600"
              style={{ width: `${((progress !== undefined ? progress : watchProgress) || 0) * 100}%` }}
            />
          </div>
        ) : null}

        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(video.duration)}
          </div>
        )}

        {isExpiringSoon(video.publishedTo) && (
          <div className="absolute top-2 left-2 bg-red-600 bg-opacity-90 px-2 py-1 rounded text-xs text-white font-semibold flex items-center gap-1 animate-pulse">
            <AlertCircle size={12} />
            {getDaysUntilExpiration(video.publishedTo)} jour{getDaysUntilExpiration(video.publishedTo) !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
          {video.title}
          {video.subtitle && ` - ${video.subtitle}`}
        </h3>
        {video.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {video.description}
          </p>
        )}
        {video.publishedTo && !isExpiringSoon(video.publishedTo) && (
          <p className="text-gray-500 text-xs mt-1">
            Jusqu'au {new Date(video.publishedTo).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </Link>
  );
}
