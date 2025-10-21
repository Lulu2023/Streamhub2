import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Play, Tv, Search, LogIn } from 'lucide-react';
import { unifiedPlatformsAPI } from '../services/unified-platforms-api';
import type { Platform, PlatformContent } from '../types';

export function PlatformDetailPage() {
  const { platformSlug } = useParams<{ platformSlug: string }>();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [content, setContent] = useState<PlatformContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (platformSlug) {
      loadPlatform();
      loadContent();
    }
  }, [platformSlug]);

  async function loadPlatform() {
    if (!platformSlug) return;

    try {
      const data = await unifiedPlatformsAPI.getPlatformBySlug(platformSlug);
      setPlatform(data);
    } catch (error) {
      console.error('Erreur chargement plateforme:', error);
    }
  }

  async function loadContent() {
    if (!platformSlug) return;

    try {
      setLoading(true);
      const data = await unifiedPlatformsAPI.getPlatformContent(platformSlug);
      setContent(data);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!platformSlug || !searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await unifiedPlatformsAPI.searchContent(platformSlug, searchQuery);
      setContent(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleContentClick(item: PlatformContent) {
    if (item.type === 'live') {
      navigate(`/platform/${platformSlug}/live/${item.id}`);
    } else if (item.type === 'video') {
      navigate(`/platform/${platformSlug}/video/${item.id}`);
    } else if (item.type === 'program') {
      navigate(`/platform/${platformSlug}/program/${item.id}`);
    }
  }

  if (!platform) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title={platform.name} showBack />

      <div
        className="h-32 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${platform.primary_color}22 0%, ${platform.primary_color}11 100%)`,
        }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center text-3xl font-bold text-white mb-2"
            style={{ backgroundColor: platform.primary_color }}
          >
            {platform.name.substring(0, 2).toUpperCase()}
          </div>
          <p className="text-gray-400 text-sm">{platform.description}</p>
        </div>
      </div>

      <div className="p-4">
        {platform.requires_auth && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LogIn className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-yellow-500 font-semibold mb-1">Connexion requise</h4>
                <p className="text-gray-400 text-sm">
                  Cette plateforme nécessite une connexion pour accéder au contenu.
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher sur ${platform.name}...`}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {searchQuery ? 'Résultats de recherche' : 'Contenu disponible'}
          </h2>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                loadContent();
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Effacer
            </button>
          )}
        </div>

        {loading || isSearching ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg aspect-video animate-pulse" />
            ))}
          </div>
        ) : content.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.map(item => (
              <button
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="group relative bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <div className="aspect-video relative bg-gray-700">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'live' ? (
                        <Tv className="text-gray-600" size={32} />
                      ) : (
                        <Play className="text-gray-600" size={32} />
                      )}
                    </div>
                  )}
                  {item.type === 'live' && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      DIRECT
                    </div>
                  )}
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {Math.floor(item.duration / 60)}min
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400">
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucun contenu disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
