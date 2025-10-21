import { useEffect, useState } from 'react';
import { ChevronRight, X, Tv, Play } from 'lucide-react';
import { rtbfAPI } from '../services/rtbf-api';
import { unifiedPlatformsAPI } from '../services/unified-platforms-api';
import { storage } from '../utils/storage';
import { VideoCard } from '../components/VideoCard';
import { Header } from '../components/Header';
import { Link } from 'react-router-dom';
import type { Platform } from '../types';

export function HomePage() {
  const [homeData, setHomeData] = useState<any>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchProgress, setWatchProgress] = useState(storage.getWatchProgress());

  useEffect(() => {
    loadHomeData();
    loadPlatforms();
  }, []);

  const loadHomeData = async () => {
    try {
      const data = await rtbfAPI.getHomePage();
      setHomeData(data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlatforms = async () => {
    try {
      const data = await unifiedPlatformsAPI.getAllAvailablePlatforms();
      setPlatforms(data.slice(0, 6));
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const removeFromContinueWatching = (videoId: string) => {
    storage.removeWatchProgress(videoId);
    setWatchProgress(storage.getWatchProgress());
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

  const widgets = homeData?.data?.widgets || [];
  const bannerWidget = widgets.find((w: any) => w.type.includes('BANNER'));
  const categoryListWidget = widgets.find((w: any) => w.type === 'CATEGORY_LIST');
  const otherWidgets = widgets.filter(
    (w: any) => w.type.endsWith('_LIST') && !w.type.includes('FAVORITE') && w.type !== 'CATEGORY_LIST'
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />

      {bannerWidget && bannerWidget.content && bannerWidget.content.length > 0 && (
        <div className="relative h-[60vh] mb-8">
          <div className="absolute inset-0">
            <img
              src={bannerWidget.content[0].illustration?.l}
              alt={bannerWidget.content[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {bannerWidget.content[0].title}
              </h1>
              {bannerWidget.content[0].subtitle && (
                <p className="text-xl mb-4">{bannerWidget.content[0].subtitle}</p>
              )}
              {bannerWidget.content[0].description && (
                <p className="text-lg text-gray-300 max-w-2xl mb-6 line-clamp-3">
                  {bannerWidget.content[0].description}
                </p>
              )}
              <Link
                to={`/video/${bannerWidget.content[0].assetId || bannerWidget.content[0].id}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Regarder
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Plateformes Belges</h2>
            <Link
              to="/platforms"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
            >
              Voir tout
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map(platform => (
              <Link
                key={platform.id}
                to={`/platform/${platform.slug}`}
                className="group bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all transform hover:scale-105"
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-2xl font-bold text-white mb-2"
                  style={{ backgroundColor: platform.primary_color }}
                >
                  {platform.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="text-sm font-semibold text-white text-center group-hover:text-blue-400 transition-colors line-clamp-1">
                  {platform.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {watchProgress.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Reprendre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {watchProgress.map((item) => (
                <div key={item.videoId} className="relative">
                  <VideoCard
                    video={item.video}
                    showProgress
                    progress={item.progress}
                  />
                  <button
                    onClick={() => removeFromContinueWatching(item.videoId)}
                    className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white p-1.5 rounded-full transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {otherWidgets.map((widget: any) => (
          <section key={widget.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{widget.title}</h2>
              {widget.contentPath && (
                <Link
                  to={`/category/${widget.id}`}
                  state={{ url: widget.contentPath }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Voir plus
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 min-w-min">
                {widget.content?.slice(0, 10).map((item: any) => {
                  if (item.assetId || item.resourceType === 'MEDIA') {
                    return (
                      <div key={item.id || item.assetId} className="w-64 flex-shrink-0">
                        <VideoCard video={item} />
                      </div>
                    );
                  }

                  if (item.resourceType === 'PROGRAM' || item.path) {
                    return (
                      <Link
                        key={item.id}
                        to={`/program/${item.id}`}
                        className="w-64 flex-shrink-0 group"
                      >
                        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                          {item.illustration && (
                            <img
                              src={item.illustration.l || item.illustration.m || item.illustration.s}
                              alt={item.title || item.label}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-white font-medium mt-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {item.title || item.label}
                        </h3>
                        {item.subtitle && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                      </Link>
                    );
                  }

                  if (item.contentPath) {
                    return (
                      <Link
                        key={item.id}
                        to={`/category/${item.id}`}
                        state={{ url: item.contentPath }}
                        className="w-64 flex-shrink-0 group"
                      >
                        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                          {item.illustration && (
                            <img
                              src={item.illustration.l || item.illustration.m || item.illustration.s}
                              alt={item.title || item.label}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-white font-medium mt-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {item.title || item.label}
                        </h3>
                        {item.subtitle && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                      </Link>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </section>
        ))}

        {categoryListWidget?.content?.map((category: any) => (
          <section key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{category.title}</h2>
              {category.contentPath && (
                <Link
                  to={`/category/${category.id}`}
                  state={{ url: category.contentPath }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Voir plus
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 min-w-min">
                {(category.loadedContent || []).slice(0, 10).map((item: any) => {
                  if (item.assetId || item.resourceType === 'MEDIA') {
                    return (
                      <div key={item.id || item.assetId} className="w-64 flex-shrink-0">
                        <VideoCard video={item} />
                      </div>
                    );
                  }

                  if (item.resourceType === 'PROGRAM' || item.path) {
                    return (
                      <Link
                        key={item.id}
                        to={`/program/${item.id}`}
                        className="w-48 flex-shrink-0 group"
                      >
                        <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative">
                          {item.illustration && (
                            <img
                              src={item.illustration.l || item.illustration.m || item.illustration.s}
                              alt={item.title || item.label}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-white font-medium mt-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {item.title || item.label}
                        </h3>
                      </Link>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
