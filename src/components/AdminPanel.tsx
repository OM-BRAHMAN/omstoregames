import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  Smartphone,
  ExternalLink,
  Download,
  Key,
  Database,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Image as ImageIcon,
  FileCode,
  Plus,
} from 'lucide-react';
import { Game, GameCategory } from '../types/game';
import { uploadFile, createGame, deleteGame } from '../services/api';
import {
  isFirebaseActive,
  uploadApkToFirebaseStorage,
  uploadImageToFirebaseStorage,
  saveGameToFirestore,
  deleteGameFromFirestore,
} from '../services/firebase';
import { CATEGORIES } from './CategoryPills';

interface AdminPanelProps {
  games: Game[];
  onGameAdded: (game: Game) => void;
  onGameDeleted: (id: string) => void;
  onOpenFirebaseModal: () => void;
  isFirebaseConnected: boolean;
  onCloseAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  games,
  onGameAdded,
  onGameDeleted,
  onOpenFirebaseModal,
  isFirebaseConnected,
  onCloseAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'catalog' | 'firebase'>('upload');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GameCategory>('Action');
  const [developer, setDeveloper] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [packageName, setPackageName] = useState('');
  const [minAndroid, setMinAndroid] = useState('Android 8.0+');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [editorsChoice, setEditorsChoice] = useState(false);

  // File Upload State
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [iconUrlCustom, setIconUrlCustom] = useState<string>('');

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [bannerUrlCustom, setBannerUrlCustom] = useState<string>('');

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkSizeMb, setApkSizeMb] = useState<number>(45.0);

  // Status & Progress State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [storageDestination, setStorageDestination] = useState<'local' | 'firebase'>('local');

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);

  // Icon file handler
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Banner file handler
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // APK file handler
  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setApkFile(file);
      const sizeInMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      setApkSizeMb(sizeInMb);
      if (!name) {
        // Auto-guess name from APK filename
        const clean = file.name.replace(/\.apk$/i, '').replace(/[-_]/g, ' ');
        setName(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    }
  };

  // Sample icon presets
  const sampleIcons = [
    { label: 'Action & Combat', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=256&auto=format&fit=crop&q=80' },
    { label: 'Speed & Racing', url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=256&auto=format&fit=crop&q=80' },
    { label: 'Puzzle & Mind', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80' },
    { label: 'Space Shooter', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=256&auto=format&fit=crop&q=80' },
    { label: 'RPG Roguelike', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=256&auto=format&fit=crop&q=80' },
    { label: 'Tools & App', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=256&auto=format&fit=crop&q=80' },
  ];

  // Submit and Publish Game
  const handlePublishGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter a Game Name');
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMessage('Please provide a brief description');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);

      let finalIconUrl = iconUrlCustom.trim();
      let finalBannerUrl = bannerUrlCustom.trim();
      let finalApkUrl = '';
      let finalApkFileName = apkFile ? apkFile.name : `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${version}.apk`;

      // 1. Upload Icon
      if (iconFile) {
        setUploadProgress(25);
        if (storageDestination === 'firebase' && isFirebaseActive()) {
          finalIconUrl = await uploadImageToFirebaseStorage(iconFile, 'icons', (pct) => setUploadProgress(20 + Math.round(pct * 0.15)));
        } else {
          const uploaded = await uploadFile(iconFile);
          finalIconUrl = uploaded.fileUrl;
        }
      } else if (!finalIconUrl) {
        // Fallback default icon
        finalIconUrl = sampleIcons[0].url;
      }

      // 2. Upload Banner
      if (bannerFile) {
        setUploadProgress(45);
        if (storageDestination === 'firebase' && isFirebaseActive()) {
          finalBannerUrl = await uploadImageToFirebaseStorage(bannerFile, 'banners', (pct) => setUploadProgress(40 + Math.round(pct * 0.15)));
        } else {
          const uploaded = await uploadFile(bannerFile);
          finalBannerUrl = uploaded.fileUrl;
        }
      } else if (!finalBannerUrl) {
        finalBannerUrl = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80';
      }

      // 3. Upload APK File
      setUploadProgress(65);
      if (apkFile) {
        if (storageDestination === 'firebase' && isFirebaseActive()) {
          const uploadedApk = await uploadApkToFirebaseStorage(apkFile, (pct) => setUploadProgress(60 + Math.round(pct * 0.3)));
          finalApkUrl = uploadedApk.downloadUrl;
          finalApkFileName = uploadedApk.fileName;
        } else {
          const uploadedApk = await uploadFile(apkFile, (pct) => setUploadProgress(60 + Math.round(pct * 0.3)));
          finalApkUrl = uploadedApk.fileUrl;
          finalApkFileName = uploadedApk.fileName;
        }
      }

      setUploadProgress(95);

      // 4. Save to Backend / Database
      const payload: Partial<Game> = {
        name: name.trim(),
        category,
        developer: developer.trim() || 'OM Indie Studio',
        version: version.trim() || '1.0.0',
        packageName: packageName.trim() || `com.omstore.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        minAndroidVersion: minAndroid.trim(),
        shortDescription: shortDescription.trim(),
        description: (description || shortDescription).trim(),
        iconUrl: finalIconUrl,
        bannerUrl: finalBannerUrl,
        apkUrl: finalApkUrl, // if empty, Express backend automatically sets `/api/download-apk/:id`
        apkFileName: finalApkFileName,
        apkSizeMb,
        featured,
        editorsChoice,
      };

      const newGame = await createGame(payload);

      // Also sync to Firestore if Firebase is active
      if (isFirebaseActive()) {
        try {
          await saveGameToFirestore(newGame);
        } catch (fbErr) {
          console.warn('Could not mirror to Firestore:', fbErr);
        }
      }

      setUploadProgress(100);
      setSuccessMessage(`"${newGame.name}" successfully published to OM.COM!`);
      onGameAdded(newGame);

      // Reset form
      setName('');
      setShortDescription('');
      setDescription('');
      setDeveloper('');
      setPackageName('');
      setIconFile(null);
      setIconPreview('');
      setBannerFile(null);
      setBannerPreview('');
      setApkFile(null);
      setFeatured(false);
      setEditorsChoice(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      if (apkInputRef.current) apkInputRef.current.value = '';

      setTimeout(() => {
        setActiveTab('catalog');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to publish game:', err);
      setErrorMessage(err.message || 'Failed to publish game');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Delete Game handler
  const handleDeleteGame = async (id: string, gameName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${gameName}" from OM.COM?`)) return;

    try {
      await deleteGame(id);
      if (isFirebaseActive()) {
        await deleteGameFromFirestore(id).catch(console.warn);
      }
      onGameDeleted(id);
    } catch (err: any) {
      alert(`Failed to delete game: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            OM.COM Developer Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Panel & APK Publisher
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload new Android games, manage catalog listings, and configure Firebase Firestore & Storage for OM.COM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isFirebaseConnected
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>{isFirebaseConnected ? 'Firebase Active' : 'Setup Firebase'}</span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Games Listed</div>
          <div className="text-2xl font-black text-white mt-1">{games.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Live in store</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total APK Downloads</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {games.reduce((acc, g) => acc + (g.downloadsCount || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Real-time counter</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Backend API</div>
          <div className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Express Server
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Node.js + Multer</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Cloud Database</div>
          <div className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected ? 'bg-amber-400' : 'bg-slate-500'
              }`}
            />
            {isFirebaseConnected ? 'Firestore Active' : 'Local JSON Store'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isFirebaseConnected ? 'Real-time sync' : 'data/games.json'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Publish Game</span>
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Manage Catalog ({games.length})</span>
          {activeTab === 'catalog' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'firebase'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-amber-400" />
          <span>Firebase Setup Guide</span>
          {activeTab === 'firebase' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: UPLOAD GAME FORM */}
      {/* ======================================================== */}
      {activeTab === 'upload' && (
        <form onSubmit={handlePublishGame} className="space-y-8">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Game Details */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              1. Basic Game Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Game Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Drift Racing 3D"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!packageName) {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                      setPackageName(`com.omstore.${clean}`);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Category / Genre <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GameCategory)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.filter((c) => c.name !== 'All').map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Developer / Studio Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Velocity Nitro Interactive"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Version & Package Name
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="com.omstore.game"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Short Description (Store Card Snippet) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={140}
                placeholder="Brief one-sentence pitch displayed on cards (max 140 chars)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Detailed Store Description
              </label>
              <textarea
                rows={4}
                placeholder="Full gameplay features, story background, controls, and highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: File Uploads (Icon, Banner, APK) */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              2. Assets & Binary Files (Icon, Banner, APK)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Game Icon */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Game Icon (Photo)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    PNG, JPG, or WebP. Recommend 512x512 squircle.
                  </p>

                  <div
                    onClick={() => iconInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] bg-slate-950/50"
                  >
                    {iconPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={iconPreview}
                          alt="Icon Preview"
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold">Change file</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                        <span className="text-xs font-medium text-slate-300">Choose Icon File</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">or drag & drop</span>
                      </>
                    )}
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 block mb-1">Or paste image URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={iconUrlCustom}
                    onChange={(e) => setIconUrlCustom(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  />
                </div>
              </div>

              {/* Game Banner / Artwork */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Header Banner Artwork
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Featured widescreen artwork for banner & detail view (16:9).
                  </p>

                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] bg-slate-950/50"
                  >
                    {bannerPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="w-full h-16 rounded-xl object-cover border border-slate-700 shadow"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold">Change file</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                        <span className="text-xs font-medium text-slate-300">Choose Banner File</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">or drag & drop</span>
                      </>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 block mb-1">Or paste banner URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={bannerUrlCustom}
                    onChange={(e) => setBannerUrlCustom(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  />
                </div>
              </div>

              {/* Game APK Binary */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Game APK Binary File <span className="text-emerald-400 font-normal">(.apk)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Upload compiled Android APK (up to 200MB).
                  </p>

                  <div
                    onClick={() => apkInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] bg-emerald-950/10"
                  >
                    {apkFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileCode className="w-8 h-8 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-100 truncate max-w-[180px]">
                          {apkFile.name}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {apkSizeMb} MB
                        </span>
                        <span className="text-[10px] text-slate-400 underline mt-1">Change file</span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-8 h-8 text-emerald-400 mb-1" />
                        <span className="text-xs font-bold text-emerald-400">Choose .APK File</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Drag APK here or browse</span>
                      </>
                    )}
                    <input
                      ref={apkInputRef}
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleApkChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Or manual APK package size (MB):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="1000"
                    value={apkSizeMb}
                    onChange={(e) => setApkSizeMb(parseFloat(e.target.value) || 25)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Quick Icon Preset selector */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Quick Preset Icons (Click to apply if you don't have an icon yet):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleIcons.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIconUrlCustom(item.url);
                      setIconPreview(item.url);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                  >
                    <img src={item.url} alt={item.label} className="w-5 h-5 rounded-md object-cover" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Promotion & Storage Options */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-sm font-bold text-white">Store Visibility & Badges</div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Feature on Hero Carousel</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={editorsChoice}
                    onChange={(e) => setEditorsChoice(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Award Editor's Choice Badge</span>
                </label>
              </div>
            </div>

            {/* Storage Target Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Target Storage:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setStorageDestination('local')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    storageDestination === 'local'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Express Disk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isFirebaseActive()) {
                      onOpenFirebaseModal();
                    } else {
                      setStorageDestination('firebase');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    storageDestination === 'firebase'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Firebase Storage</span>
                  {isFirebaseConnected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {isSubmitting && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Uploading assets and generating APK record...</span>
                <span className="text-emerald-400 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCloseAdmin}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Publishing to OM.COM...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish Game to OM.COM</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAGE CATALOG */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Currently Listed Applications ({games.length})
            </h2>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
            >
              <Plus className="w-4 h-4" />
              Upload Another Game
            </button>
          </div>

          {games.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Your Store Catalog is Empty</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All pre-made demo games have been removed. You can now publish your own custom Android games, apps, and APK files.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 mt-2 hover:bg-emerald-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Your First Game</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Game</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Version</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Downloads</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {games.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={g.iconUrl}
                            alt={g.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{g.name}</span>
                              {g.editorsChoice && (
                                <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-slate-950 rounded font-bold">
                                  CHOICE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {g.packageName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {g.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                        v{g.version}
                      </td>

                      <td className="py-3 px-4 font-mono">{g.apkSizeMb} MB</td>

                      <td className="py-3 px-4 font-bold text-slate-200">
                        {(g.downloadsCount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-amber-400 font-bold">
                        ★ {g.rating.toFixed(1)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={g.apkUrl}
                            download={g.apkFileName || `${g.name}.apk`}
                            title="Download APK"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteGame(g.id, g.name)}
                            title="Delete Game"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FIREBASE SETUP & CREDENTIALS */}
      {/* ======================================================== */}
      {activeTab === 'firebase' && (
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Database className="w-4 h-4" />
                Firebase Real-time Architecture
              </div>
              <h2 className="text-xl font-black text-white">
                How OMSTORE.COM Connects to Firebase
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                OMSTORE is architected with dual-mode storage: it works out of the box using our Express REST API & disk storage, and can seamlessly switch to Google Cloud Firestore (for instant real-time sync across devices) and Firebase Storage (for high-bandwidth APK delivery).
              </p>
            </div>

            <button
              onClick={onOpenFirebaseModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-400/20"
            >
              <Key className="w-4 h-4" />
              <span>Configure Credentials</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                1. Cloud Firestore (Database)
              </div>
              <p className="text-slate-400 leading-relaxed font-normal">
                Stores the <code className="text-emerald-400">games</code> collection. When any admin uploads a game, Firestore's <code className="text-amber-300">onSnapshot()</code> automatically pushes real-time updates to all connected visitors without requiring page refreshes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                2. Firebase Storage (Object Storage)
              </div>
              <p className="text-slate-400 leading-relaxed font-normal">
                Houses large binary assets in buckets: <code className="text-emerald-400">/apks/</code> for heavy Android application packages and <code className="text-emerald-400">/images/</code> for game icons and screenshots with CDN edge caching.
              </p>
            </div>
          </div>

          {/* Code snippet demonstration */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-slate-300 text-xs flex items-center justify-between">
              <span>Your Pre-Configured Firebase Setup (Project: omcom-9aa9b)</span>
              <span className="text-[10px] text-emerald-400 font-mono">omcom-9aa9b</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto leading-normal">
{`// Configured Project in src/services/firebase.ts:
const firebaseConfig = {
  projectId: "omcom-9aa9b",
  projectNumber: "724459194015",
  authDomain: "omcom-9aa9b.firebaseapp.com",
  storageBucket: "omcom-9aa9b.firebasestorage.app",
  messagingSenderId: "724459194015",
  apiKey: "YOUR_API_KEY",  // Enter in Firebase Keys modal or .env
  appId: "YOUR_APP_ID"
};`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
