import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { BackButton } from '../components/BackButton';
import { rtbfAPI } from '../services/rtbf-api';

export function CategoryPage() {
  const location = useLocation();
  const contentUrl = location.state?.url;

  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentUrl) {
      loadCategoryData();
    }
  }, [contentUrl]);

  const loadCategoryData = async () => {
    try {
      const data = await rtbfAPI.getContentByUrl(contentUrl);
      setCategoryData(data);
    } catch (error) {
      console.error('Error loading category:', error);
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

  const content = categoryData?.data?.content || [];
  const title = categoryData?.data?.widgets?.[0]?.title || 'Catégorie';

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        {content.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.map((item: any) => {
              if (item.assetId) {
                return (
                  <VideoCard key={item.assetId || item.id} video={item} />
                );
              }
              return (
                <Link
                  key={item.id}
                  to={`/category/${item.id}`}
                  state={{ url: item.contentPath }}
                  className="group"
                >
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                    {item.illustration && (
                      <img
                        src={item.illustration.l}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="text-white font-medium mt-2 group-hover:text-blue-400 transition-colors">
                    {item.title || item.label}
                  </h3>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Aucun contenu disponible dans cette catégorie
          </div>
        )}
      </div>
    </div>
  );
}
