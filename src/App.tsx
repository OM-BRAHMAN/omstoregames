/**
 * OMSTORE.COM - Alternative Android App Store
 * Main Application Component
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Download,
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Compass,
  CheckCircle,
  Clock,
  HardDrive,
  Gamepad2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Game } from './types/game';
import { fetchGames, recordDownload } from './services/api';
import {
  isFirebaseActive,
  subscribeToFirestoreGames,
  saveGameToFirestore,
  subscribeToAuthState,
} from './services/firebase';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryPills, CATEGORIES } from './components/CategoryPills';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { ShareInstallModal } from './components/ShareInstallModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'newest'>('downloads');
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'categories' | 'charts'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Modals & Download tracking
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [downloadingGameId, setDownloadingGameId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Route handling: Detect #admin or /admin in URL
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || path === '/admin' || hash === '#/admin') {
        setActiveView('admin');
      } else if (hash === '#charts') {
        setActiveView('charts');
      } else if (hash === '#categories') {
        setActiveView('categories');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Update hash when activeView changes
  const handleNavigate = (view: 'home' | 'admin' | 'categories' | 'charts') => {
    setActiveView(view);
    if (view === 'admin') window.location.hash = 'admin';
    else if (view === 'charts') window.location.hash = 'charts';
    else if (view === 'categories') window.location.hash = 'categories';
    else window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Initial Games & Real-time sync (Firestore or Auto-Sync)
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    let pollInterval: any = null;

    async function refreshCatalog() {
      try {
        const freshGames = await fetchGames();
        setGames(freshGames);
      } catch (err) {
        console.warn('Sync fetch failed:', err);
      }
    }

    async function loadData() {
      setLoading(true);
      try {
        // 1. Initial baseline fetch from Express REST API
        await refreshCatalog();

        // 2. Check if Firebase is active
        const fbActive = isFirebaseActive();
        setIsFirebaseConnected(fbActive);

        if (fbActive) {
          // Subscribe to live Firestore WebSocket real-time updates
          unsubscribeFirestore = subscribeToFirestoreGames((updatedGames) => {
            if (updatedGames) {
              setGames(updatedGames);
            }
          });
        } else {
          // Fallback auto-sync every 4 seconds for multi-tab / multi-device synchronization
          pollInterval = setInterval(refreshCatalog, 4000);
        }
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Re-sync on window focus
    window.addEventListener('focus', refreshCatalog);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('focus', refreshCatalog);
    };
  }, [isFirebaseConnected]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: games.length };
    games.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Filtered and Sorted Games
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.shortDescription.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(
        (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [games, searchQuery, selectedCategory, sortBy]);

  // Handle Game Download with visual progress
  const handleDownload = async (game: Game, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      setDownloadingGameId(game.id);
      setDownloadProgress(20);

      // Record download count on Express backend
      const res = await recordDownload(game.id);

      // Update local state instantly
      setGames((prev) =>
        prev.map((g) =>
          g.id === game.id ? { ...g, downloadsCount: res.downloadsCount } : g
        )
      );

      setDownloadProgress(60);

      // If Firebase active, update firestore
      if (isFirebaseActive()) {
        saveGameToFirestore({
          ...game,
          downloadsCount: (game.downloadsCount || 0) + 1,
        }).catch(console.warn);
      }

      setDownloadProgress(90);

      // Trigger browser download via hidden anchor
      const downloadLink = document.createElement('a');
      downloadLink.href = res.apkUrl || `/api/download-apk/${game.id}`;
      downloadLink.download = res.apkFileName || `${game.name}_v${game.version}.apk`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadProgress(100);
      showToast(`Downloading "${game.name}" APK (${game.apkSizeMb} MB)...`);
    } catch (err: any) {
      console.error('Download failed:', err);
      showToast(`Error initiating download: ${err.message}`);
    } finally {
      setTimeout(() => {
        setDownloadingGameId(null);
        setDownloadProgress(0);
      }, 800);
    }
  };

  // Add newly published game
  const handleGameAdded = (newGame: Game) => {
    setGames((prev) => [newGame, ...prev]);
    showToast(`"${newGame.name}" is now live on OMSTORE.COM!`);
  };

  // Remove deleted game
  const handleGameDeleted = (deletedId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== deletedId));
    if (selectedGame?.id === deletedId) setSelectedGame(null);
    showToast('Game package removed from store.');
  };

  // Curated subsets for Homepage Rows
  const editorsChoiceGames = useMemo(
    () => games.filter((g) => g.editorsChoice).slice(0, 4),
    [games]
  );

  const topChartsGames = useMemo(
    () => [...games].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 6),
    [games]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onNavigate={handleNavigate}
        isFirebaseConnected={isFirebaseConnected}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        allGames={games}
        onSelectGame={(g) => setSelectedGame(g)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======================================================== */}
        {/* VIEW 1: ADMIN PANEL */}
        {/* ======================================================== */}
        {activeView === 'admin' ? (
          <AdminPanel
            games={games}
            onGameAdded={handleGameAdded}
            onGameDeleted={handleGameDeleted}
            onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
            isFirebaseConnected={isFirebaseConnected}
            onCloseAdmin={() => handleNavigate('home')}
          />
        ) : activeView === 'charts' ? (
          /* ======================================================== */
          /* VIEW 2: TOP CHARTS */
          /* ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Flame className="w-4 h-4" />
                  OMSTORE Leaderboard
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Top Charts: Most Downloaded Android Games
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Ranked by total verified APK installations and community ratings.
                </p>
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setSortBy('downloads')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    sortBy === 'downloads'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Most Downloaded
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    sortBy === 'rating'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Highest Rated
                </button>
              </div>
            </div>

            {/* Top Charts Table / List */}
            <div className="space-y-3">
              {topChartsGames.map((game, index) => (
                <div key={game.id} className="flex items-center gap-3">
                  <div className="w-8 text-center font-black text-base sm:text-lg text-slate-500 shrink-0">
                    {index === 0 ? (
                      <span className="text-amber-400">#1</span>
                    ) : index === 1 ? (
                      <span className="text-slate-300">#2</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600">#3</span>
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                  <div className="flex-1">
                    <GameCard
                      game={game}
                      layout="list"
                      onSelect={(g) => setSelectedGame(g)}
                      onDownload={(g, e) => handleDownload(g, e)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 3: STORE HOME (DEFAULT) */
          /* ======================================================== */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Featured Hero Carousel */}
            {!searchQuery && selectedCategory === 'All' && (
              <HeroBanner
                games={games}
                onSelectGame={(g) => setSelectedGame(g)}
                onDownloadGame={(g, e) => handleDownload(g, e)}
              />
            )}

            {/* Category Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CategoryPills
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                categoryCounts={categoryCounts}
              />
            </div>

            {/* Search Query indicator */}
            {searchQuery && (
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>
                    Search results for <strong className="text-white">"{searchQuery}"</strong> ({filteredGames.length})
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Row 1: Editor's Choice Section (When on All category) */}
            {!searchQuery && selectedCategory === 'All' && editorsChoiceGames.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tight">
                        Editor's Choice Games
                      </h2>
                      <p className="text-xs text-slate-400">
                        Hand-curated standout titles with verified performance & zero bloatware
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {editorsChoiceGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={(g) => setSelectedGame(g)}
                      onDownload={(g, e) => handleDownload(g, e)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Games Grid / Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {selectedCategory === 'All'
                      ? 'Browse All Games & Apps'
                      : `${selectedCategory} Collection`}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                    {filteredGames.length}
                  </span>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort games by"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="downloads">Most Popular (Downloads)</option>
                    <option value="rating">Top Rated (Stars)</option>
                    <option value="newest">Recently Added</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-slate-400">Loading OMSTORE catalog...</p>
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="py-16 text-center rounded-3xl glass-panel border border-slate-800 p-8 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {searchQuery ? 'No matching games found' : 'Store is Clean & Ready for Uploads'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      {searchQuery
                        ? `No results match "${searchQuery}". Try a different keyword.`
                        : 'All ready-made demo games have been removed. You can now use the Admin Panel to upload and publish your genuine Android games, apps, and APK files!'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <span>+ Upload Your First Game to Store</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={(g) => setSelectedGame(g)}
                      onDownload={(g, e) => handleDownload(g, e)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onDownload={(g, e) => handleDownload(g, e)}
        isDownloading={downloadingGameId === selectedGame?.id}
        downloadProgress={downloadProgress}
      />

      {/* Firebase Setup Modal */}
      <FirebaseGuideModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConnectionChange={(connected) => setIsFirebaseConnected(connected)}
      />

      {/* Share & Install Modal */}
      <ShareInstallModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          showToast(`Welcome ${user.displayName || user.email}!`);
        }}
      />

      {/* Store Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/90 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-xs">
                  OM
                </div>
              </div>
              <div>
                <span className="font-extrabold text-slate-200 text-sm">OM.COM</span>
                <p className="text-[11px] text-slate-500">
                  Open Android Application Repository & Market • OM.COM
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
              <button onClick={() => handleNavigate('home')} className="hover:text-emerald-400 transition-colors">
                Discover
              </button>
              <button onClick={() => handleNavigate('charts')} className="hover:text-emerald-400 transition-colors">
                Top Charts
              </button>
              <button onClick={() => handleNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                Admin Publisher
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-emerald-400 font-semibold"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open on Phone & QR</span>
              </button>
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <span>Firebase Keys</span>
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>
              © {new Date().getFullYear()} OM.COM. Clean Android APK distribution platform. All trademarks and icons belong to their respective owners.
            </p>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Node.js & React</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
