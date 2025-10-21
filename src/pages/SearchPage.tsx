import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { BackButton } from '../components/BackButton';
import { rtbfAPI } from '../services/rtbf-api';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const isAuth = await rtbfAPI.ensureAuthentication();

      if (!isAuth) {
        setError('Vous devez être connecté pour effectuer une recherche');
        setLoading(false);
        return;
      }

      const data = await rtbfAPI.search(searchQuery);

      if (data.status === 200 && data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header showSearch />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Recherche</h1>
            {query && (
              <p className="text-gray-400 mt-1">
                Résultats pour "{query}"
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Recherche en cours...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
            {error.includes('connecté') && (
              <Link
                to="/settings"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Aller aux paramètres
              </Link>
            )}
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-16 text-gray-400">
            Aucun résultat trouvé pour "{query}"
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-8">
            {results.map((section) => {
              if (
                section.type === 'PROGRAM_LIST' ||
                (section.type === 'MEDIA_LIST' &&
                  section.content[0]?.resourceType !== 'LIVE')
              ) {
                const sectionId = section.title;
                const isExpanded = expandedSections.has(sectionId);
                const itemsToShow = isExpanded ? section.content : section.content.slice(0, 10);
                const hasMore = section.content.length > 10;

                return (
                  <section key={section.title}>
                    <h2 className="text-2xl font-bold mb-4">
                      {section.title} ({section.content.length})
                    </h2>

                    {section.content[0]?.resourceType === 'PROGRAM' ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                          {itemsToShow.map((program: any) => (
                            <Link
                              key={program.id}
                              to={`/program/${program.id}`}
                              className="group"
                            >
                              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                                <img
                                  src={program.illustration?.l}
                                  alt={program.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                              <h3 className="text-white font-medium mt-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {program.title}
                              </h3>
                            </Link>
                          ))}
                        </div>
                        {hasMore && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedSections);
                              if (isExpanded) {
                                newExpanded.delete(sectionId);
                              } else {
                                newExpanded.add(sectionId);
                              }
                              setExpandedSections(newExpanded);
                            }}
                            className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {isExpanded ? 'Voir moins' : `Voir plus (${section.content.length - 10} de plus)`}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                          {itemsToShow.map((video: any) => (
                            <VideoCard key={video.assetId || video.id} video={video} />
                          ))}
                        </div>
                        {hasMore && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedSections);
                              if (isExpanded) {
                                newExpanded.delete(sectionId);
                              } else {
                                newExpanded.add(sectionId);
                              }
                              setExpandedSections(newExpanded);
                            }}
                            className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {isExpanded ? 'Voir moins' : `Voir plus (${section.content.length - 10} de plus)`}
                          </button>
                        )}
                      </>
                    )}
                  </section>
                );
              }
              return null;
            })}
          </div>
        )}

        {!query && !loading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Utilisez la barre de recherche en haut pour trouver vos contenus
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
