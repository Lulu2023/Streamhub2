import { useState } from 'react';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { rtbfAPI } from '../services/rtbf-api';
import { storage } from '../utils/storage';
import { Tv, Check, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tokens = storage.getAuthTokens();
  const isConnected = tokens && tokens.expiresAt && tokens.expiresAt > Date.now();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await rtbfAPI.authenticateComplete(email, password);
      storage.setUserSettings({ rtbfEmail: email, rtbfPassword: password });
      setSuccess(true);
      setEmail('');
      setPassword('');

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthTokens();
    storage.setUserSettings({});
    setSuccess(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 pb-20">
      <Header />
      <BackButton />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

        <div className="max-w-2xl space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">RTBF Auvio</h2>
                <p className="text-sm text-gray-400">
                  {isConnected ? 'Connecté' : 'Non connecté'}
                </p>
              </div>
              {isConnected && (
                <div className="ml-auto">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
              )}
            </div>

            {!isConnected ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-900 bg-opacity-20 p-3 rounded-lg">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-900 bg-opacity-20 p-3 rounded-lg">
                    <Check size={20} />
                    <span className="text-sm">Connexion réussie!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Vous n'avez pas de compte?{' '}
                  <a
                    href="https://www.rtbf.be/auvio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Créer un compte RTBF
                  </a>
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Vous êtes connecté à RTBF Auvio. Vous avez accès à tous les contenus.
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">À propos</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>AuvioStream v1.0</p>
              <p>Application de streaming vidéo pour plateformes francophones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
