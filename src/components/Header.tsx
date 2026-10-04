import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Database,
  CloudCheck,
  CloudOff,
  Menu,
  X,
  Smartphone,
  Layers,
  Flame,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Game } from '../types/game';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: 'home' | 'admin' | 'categories' | 'charts';
  onNavigate: (view: 'home' | 'admin' | 'categories' | 'charts') => void;
  isFirebaseConnected: boolean;
  onOpenFirebaseModal: () => void;
  onOpenShareModal: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  allGames: Game[];
  onSelectGame: (game: Game) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeView,
  onNavigate,
  isFirebaseConnected,
  onOpenFirebaseModal,
  onOpenShareModal,
  currentUser,
  onOpenAuthModal,
  allGames,
  onSelectGame,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Quick suggestions based on search
  const filteredSuggestions = searchQuery.trim()
    ? allGames
        .filter(
          (g) =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-400 transform group-hover:rotate-12 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.6 1.8L16.2 12 3.6 22.2C2.8 22.8 2 22.2 2 21.2V2.8C2 1.8 2.8 1.2 3.6 1.8ZM17.4 13L21.3 9.9C22.2 9.2 22.2 7.8 21.3 7.1L17.4 4 15 8.5 17.4 13Z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    OM
                  </span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    .COM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wide font-medium flex items-center gap-1 hidden sm:flex">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Official Android Store • OM.COM
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search games, apps, APKs... (Press '/')"
                className="w-full pl-10 pr-9 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Games ({filteredSuggestions.length})
                </div>
                {filteredSuggestions.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      onSelectGame(game);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <img
                      src={game.iconUrl}
                      alt={game.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">
                        {game.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{game.category}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">★ {game.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{game.apkSizeMb} MB</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links & Actions */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-2">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'home'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Store
              </button>

              <button
                onClick={() => onNavigate('charts')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'charts'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                Top Charts
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Admin Panel
              </button>
            </nav>

            {/* Firebase Status Badge */}
            <button
              onClick={onOpenFirebaseModal}
              title={
                isFirebaseConnected
                  ? 'Firebase Connected (Firestore & Storage Active)'
                  : 'Click to configure Firebase credentials'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isFirebaseConnected
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isFirebaseConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <CloudCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Firebase Active</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Express API</span>
                  <span className="text-[10px] text-slate-500 underline ml-0.5">Setup FB</span>
                </>
              )}
            </button>

            {/* Open on Phone / Share Button */}
            <button
              onClick={onOpenShareModal}
              title="Open on any Phone & Share"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all hover:text-white"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Phone & Share</span>
            </button>

            {/* User Account / Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentUser
                  ? 'bg-slate-800 border-emerald-500/40 text-emerald-400 hover:bg-slate-750'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {currentUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.displayName?.split(' ')[0] || 'Member'}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>

            {/* Upload APK Quick Button */}
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Game
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 focus:outline-none"
              title="User Account"
            >
              <UserIcon className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onOpenShareModal}
              className="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 focus:outline-none"
              title="Open on any Phone"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium flex items-center gap-2 ${
                activeView === 'home' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Store Catalog
            </button>

            <button
              onClick={() => {
                onNavigate('charts');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium flex items-center gap-2 ${
                activeView === 'charts' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Top Charts
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium flex items-center gap-2 ${
                activeView === 'admin' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              Admin Panel (Upload Games)
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenFirebaseModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs text-amber-400 font-medium py-1"
            >
              <Database className="w-4 h-4" />
              {isFirebaseConnected ? 'Firebase Connected' : 'Configure Firebase'}
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
            >
              + Upload APK
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
