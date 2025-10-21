import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Play, Tv, Radio } from 'lucide-react';
import { unifiedPlatformsAPI } from '../services/unified-platforms-api';
import type { Platform } from '../types';

export function PlatformsPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      setLoading(true);
      const data = await unifiedPlatformsAPI.getAllAvailablePlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Erreur chargement plateformes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPlatforms = selectedCategory === 'all'
    ? platforms
    : platforms.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Toutes', icon: Tv },
    { id: 'national', label: 'Nationales', icon: Tv },
    { id: 'local', label: 'Locales', icon: Play },
    { id: 'radio', label: 'Radios', icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Plateformes Belges" showBack />

      <div className="p-4">
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlatforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => navigate(`/platform/${platform.slug}`)}
                className="group bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all transform hover:scale-105"
                style={{
                  borderLeft: `4px solid ${platform.primary_color}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: platform.primary_color }}
                  >
                    {platform.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {platform.name}
                    </h3>
                    {platform.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {platform.description}
                      </p>
                    )}
                    {platform.requires_auth && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">
                        Connexion requise
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && filteredPlatforms.length === 0 && (
          <div className="text-center py-12">
            <Tv className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400">Aucune plateforme dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
