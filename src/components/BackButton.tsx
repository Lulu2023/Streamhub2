import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-20 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors shadow-lg"
      title="Retour"
    >
      <ChevronLeft size={24} />
    </button>
  );
}
