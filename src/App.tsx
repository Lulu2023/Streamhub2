import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TVGuidePage } from './pages/TVGuidePage';
import { LiveTVPage } from './pages/LiveTVPage';
import { LiveDetailPage } from './pages/LiveDetailPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProgramPage } from './pages/ProgramPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { PlatformDetailPage } from './pages/PlatformDetailPage';
import { PlatformVideoPage } from './pages/PlatformVideoPage';
import { BottomNav } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<TVGuidePage />} />
            <Route path="/direct" element={<LiveTVPage />} />
            <Route path="/live/:liveId" element={<LiveDetailPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/video/:videoId" element={<VideoDetailPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/program/:programId" element={<ProgramPage />} />
            <Route path="/platforms" element={<PlatformsPage />} />
            <Route path="/platform/:platformSlug" element={<PlatformDetailPage />} />
            <Route path="/platform/:platformSlug/:contentType/:contentId" element={<PlatformVideoPage />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
