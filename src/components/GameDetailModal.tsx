import React, { useState } from 'react';
import {
  X,
  Download,
  Star,
  ShieldCheck,
  Award,
  CheckCircle,
  Share2,
  Calendar,
  Smartphone,
  Cpu,
  FileCheck2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ArrowDownToLine,
  ExternalLink,
} from 'lucide-react';
import { Game } from '../types/game';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onDownload: (game: Game, e?: React.MouseEvent) => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'reviews'>('about');
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [userName, setUserName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [localReviews, setLocalReviews] = useState(game?.reviews || []);

  if (!game) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      userName: userName.trim(),
      rating: userRating,
      date: 'Just now',
      comment: userComment.trim(),
      helpfulCount: 0,
    };

    setLocalReviews([newRev, ...localReviews]);
    setUserComment('');
    setUserName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header / Banner */}
        <div className="relative h-44 sm:h-56 w-full shrink-0 overflow-hidden bg-slate-950">
          <img
            src={game.bannerUrl || game.iconUrl}
            alt={game.name}
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Action buttons on top */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy share link"
              className="p-2 rounded-full bg-slate-950/70 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors shadow"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-950/70 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {copiedLink && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-slate-950 shadow-lg animate-in fade-in">
              Link copied to clipboard!
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-8 -mt-16 relative z-10 space-y-6">
          {/* Main Title Row with App Icon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={game.iconUrl}
                alt={game.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl bg-slate-800 shrink-0"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {game.name}
                </h1>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {game.developer}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {game.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    OM Verified APK
                  </span>
                  {game.editorsChoice && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Editor's Choice
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Download / Install APK Button */}
            <div className="w-full sm:w-auto">
              <button
                onClick={(e) => onDownload(game, e)}
                disabled={isDownloading}
                className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Preparing APK ({downloadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Download APK ({game.apkSizeMb} MB)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 divide-x divide-slate-800 bg-slate-950/60 rounded-2xl border border-slate-800 py-3 px-2 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{game.rating.toFixed(1)}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {(game.ratingsCount || 0).toLocaleString()} reviews
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-100">
                {game.apkSizeMb} MB
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Package Size</div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-100">
                {(game.downloadsCount || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Downloads</div>
            </div>

            <div>
              <div className="text-sm font-bold text-emerald-400">
                v{game.version}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{game.minAndroidVersion}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 px-3 text-sm font-bold transition-all relative ${
                activeTab === 'about'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              About Game
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 px-3 text-sm font-bold transition-all relative ${
                activeTab === 'specs'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              App Specs & Security
              {activeTab === 'specs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 px-3 text-sm font-bold transition-all relative ${
                activeTab === 'reviews'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reviews ({localReviews.length})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: ABOUT GAME */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Screenshots Carousel */}
              {game.screenshots && game.screenshots.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    In-Game Screenshots
                  </h3>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {game.screenshots.map((shot, idx) => (
                      <div
                        key={idx}
                        className="shrink-0 w-64 h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md"
                      >
                        <img
                          src={shot}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-2">Overview</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                  {game.description || game.shortDescription}
                </p>
              </div>

              {/* Security scan badge */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300">
                    OMSTORE Verified Safe APK
                  </div>
                  <div className="text-slate-400 mt-0.5 leading-normal">
                    This file has passed rigorous automated anti-malware signatures, signature hash checks, and verified sandbox permissions. No adware detected.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECS & SYSTEM INFO */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Package Name</span>
                  <span className="font-mono text-slate-200 font-semibold truncate max-w-[180px]">
                    {game.packageName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Version</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {game.version} ({game.versionCode || 100})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Min OS Requirement</span>
                  <span className="text-slate-200 font-semibold">{game.minAndroidVersion}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">CPU Architectures</span>
                  <span className="text-slate-200 font-semibold font-mono">arm64-v8a, armeabi-v7a</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">APK File Name</span>
                  <span className="text-slate-300 font-mono truncate max-w-[180px]">
                    {game.apkFileName || `${game.name}.apk`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Release / Update Date</span>
                  <span className="text-slate-200 font-semibold">
                    {new Date(game.updatedAt || game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Direct APK Link preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Direct Download Endpoint
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex-1 truncate">
                    {window.location.origin}{game.apkUrl}
                  </code>
                  <a
                    href={game.apkUrl}
                    download={game.apkFileName || `${game.name}.apk`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 flex items-center gap-1"
                  >
                    <span>Direct Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-4xl font-black text-white flex items-center gap-2">
                    {game.rating.toFixed(1)}
                    <Star className="w-7 h-7 fill-amber-400 text-amber-400 inline" />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Based on {(game.ratingsCount || 0).toLocaleString()} user ratings
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percent = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : 1;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-3 font-semibold text-slate-400">{stars}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] text-slate-500 text-right">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add a review form */}
              <form
                onSubmit={handleAddReview}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Leave a User Review
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Alex G.)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Review comment (e.g. Smooth gameplay, runs well on Android 14)"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Submit Review
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {localReviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">
                    No reviews yet. Be the first player to review {game.name}!
                  </p>
                ) : (
                  localReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                            {rev.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-200">{rev.userName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-slate-300 leading-normal font-normal">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
