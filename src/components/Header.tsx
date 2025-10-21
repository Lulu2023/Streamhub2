import { Settings, Search, Tv } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function Header({ showSearch = false, onSearch }: HeaderProps) {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      if (onSearch) {
        onSearch(query);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-40">
      <div className="flex items-center justify-between h-16 px-4 max-w-screen-xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <Tv className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-white">AuvioStream</span>
        </Link>

        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Rechercher une vidéo, série..."
                className="w-full bg-gray-800 text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>
        )}

        <Link
          to="/settings"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Settings size={24} />
        </Link>
      </div>
    </header>
  );
}
