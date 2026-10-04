import React from 'react';
import {
  Download,
  Star,
  Award,
  CheckCircle2,
  HardDrive,
  FileCode,
} from 'lucide-react';
import { Game } from '../types/game';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onDownload: (game: Game, e: React.MouseEvent) => void;
  layout?: 'grid' | 'list';
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  onDownload,
  layout = 'grid',
}) => {
  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelect(game)}
        className="group relative flex items-center gap-4 p-3.5 rounded-2xl glass-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      >
        <div className="relative shrink-0">
          <img
            src={game.iconUrl}
            alt={game.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-700/60 shadow-md group-hover:scale-105 transition-transform"
          />
          {game.editorsChoice && (
            <span
              title="Editor's Choice"
              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-400 text-slate-950 shadow"
            >
              <Award className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
              {game.name}
            </h3>
            {game.featured && (
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PROMOTED
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
            {game.developer} • <span className="text-slate-300">{game.category}</span>
          </p>

          <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-normal hidden sm:block">
            {game.shortDescription}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {game.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span>{game.apkSizeMb} MB</span>
            <span>•</span>
            <span>{(game.downloadsCount || 0).toLocaleString()} DLs</span>
          </div>
        </div>

        <button
          onClick={(e) => onDownload(game, e)}
          className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title={`Download ${game.name} APK`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Get APK</span>
        </button>
      </div>
    );
  }

  // Grid layout (default Play Store card)
  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative flex flex-col rounded-2xl glass-card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5"
    >
      {/* Thumbnail with overlay badges */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3.5 bg-slate-900 border border-slate-800">
        <img
          src={game.iconUrl}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {game.editorsChoice && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md">
              <Award className="w-3 h-3" />
              CHOICE
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow">
            {game.category}
          </span>
        </div>

        {/* Quick APK Size pill */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
          {game.apkSizeMb} MB
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {game.name}
          </h3>
        </div>

        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-1.5">
          {game.developer}
        </p>

        <p className="text-xs text-slate-400 line-clamp-2 font-normal mb-3 flex-1">
          {game.shortDescription}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 mb-3">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({game.ratingsCount > 1000 ? `${(game.ratingsCount / 1000).toFixed(1)}k` : game.ratingsCount})
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {game.downloadsCount > 1000 ? `${(game.downloadsCount / 1000).toFixed(0)}k+` : game.downloadsCount} DLs
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={(e) => onDownload(game, e)}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-800/90 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-200 border border-slate-700/80 group-hover:border-emerald-400 transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download APK</span>
        </button>
      </div>
    </div>
  );
};
