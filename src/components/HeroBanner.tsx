import React, { useState, useEffect } from 'react';
import {
  Download,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Game } from '../types/game';

interface HeroBannerProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onDownloadGame: (game: Game, e: React.MouseEvent) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  games,
  onSelectGame,
  onDownloadGame,
}) => {
  const featuredGames = games.filter((g) => g.featured || g.editorsChoice).slice(0, 5);
  const displayGames = featuredGames.length > 0 ? featuredGames : games.slice(0, 3);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 6 seconds
  useEffect(() => {
    if (displayGames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayGames.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayGames.length]);

  if (displayGames.length === 0) return null;

  const currentGame = displayGames[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayGames.length) % displayGames.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayGames.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl mb-8 group">
      {/* Background Banner with dynamic blur and gradient */}
      <div className="relative h-72 sm:h-88 md:h-96 w-full overflow-hidden">
        <img
          src={currentGame.bannerUrl || currentGame.iconUrl}
          alt={currentGame.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3" />
              Featured Spotlight
            </span>

            {currentGame.editorsChoice && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                Editor's Choice
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              {currentGame.category}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
            {currentGame.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-5 font-normal max-w-xl text-balance">
            {currentGame.shortDescription}
          </p>

          {/* Metadata & Actions */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <img
                src={currentGame.iconUrl}
                alt={currentGame.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {currentGame.developer}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {currentGame.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{currentGame.apkSizeMb} MB</span>
                  <span>•</span>
                  <span>{(currentGame.downloadsCount || 0).toLocaleString()} installs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              <button
                onClick={(e) => onDownloadGame(currentGame, e)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download APK
              </button>

              <button
                onClick={() => onSelectGame(currentGame)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        {displayGames.length > 1 && (
          <div className="absolute right-4 bottom-4 flex items-center gap-2 z-10">
            <button
              onClick={handlePrev}
              aria-label="Previous featured game"
              className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {displayGames.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-emerald-400'
                      : 'w-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              aria-label="Next featured game"
              className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
