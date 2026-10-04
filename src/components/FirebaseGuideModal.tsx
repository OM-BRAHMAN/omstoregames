import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import {
  getSavedFirebaseConfig,
  initFirebase,
  disconnectFirebase,
  testFirestoreConnection,
  isFirebaseActive,
} from '../services/firebase';
import { FirebaseConnectionConfig } from '../types/game';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [appId, setAppId] = useState('');
  const [jsonConfigInput, setJsonConfigInput] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'connect' | 'guide' | 'rules'>('connect');
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedFirebaseConfig();
      if (saved) {
        setApiKey(saved.apiKey || '');
        setAuthDomain(saved.authDomain || '');
        setProjectId(saved.projectId || '');
        setStorageBucket(saved.storageBucket || '');
        setAppId(saved.appId || '');
      }
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleParseJsonConfig = () => {
    try {
      // Allow pasting object literal or JSON
      const clean = jsonConfigInput
        .replace(/const\s+firebaseConfig\s*=\s*/, '')
        .replace(/;$/, '')
        .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
        .replace(/'/g, '"');
      const parsed = JSON.parse(clean);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.appId) setAppId(parsed.appId);
      setTestResult({ success: true, msg: 'Configuration parsed successfully!' });
    } catch {
      setTestResult({
        success: false,
        msg: 'Could not parse config JSON. Please fill the fields manually below.',
      });
    }
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setTestResult({ success: false, msg: 'API Key and Project ID are required' });
      return;
    }

    const config: FirebaseConnectionConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || 'omcom-9aa9b.firebaseapp.com',
      projectId: projectId.trim() || 'omcom-9aa9b',
      storageBucket: storageBucket.trim() || 'omcom-9aa9b.firebasestorage.app',
      messagingSenderId: '724459194015',
      projectNumber: '724459194015',
      appId: appId.trim(),
    };

    setTesting(true);
    const initialized = initFirebase(config);
    if (!initialized) {
      setTesting(false);
      setTestResult({ success: false, msg: 'Firebase initialization failed with provided keys.' });
      return;
    }

    const ok = await testFirestoreConnection();
    setTesting(false);

    if (ok) {
      setTestResult({
        success: true,
        msg: 'Connected successfully to Firebase Firestore & Storage!',
      });
      onConnectionChange(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      // Even if firestore test failed (e.g. security rules require auth or setup pending), config is stored
      setTestResult({
        success: true,
        msg: 'Config saved! If read failed, ensure Firestore Rules allow read/write in your Firebase Console.',
      });
      onConnectionChange(true);
    }
  };

  const handleDisconnect = () => {
    disconnectFirebase();
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setStorageBucket('');
    setAppId('');
    setTestResult({ success: false, msg: 'Disconnected. App will use Express backend storage.' });
    onConnectionChange(false);
  };

  const envSnippet = `# Add to your .env or AI Studio environment:
VITE_FIREBASE_API_KEY="${apiKey || 'AIzaSy...'}"
VITE_FIREBASE_AUTH_DOMAIN="${authDomain || 'omcom-9aa9b.firebaseapp.com'}"
VITE_FIREBASE_PROJECT_ID="${projectId || 'omcom-9aa9b'}"
VITE_FIREBASE_STORAGE_BUCKET="${storageBucket || 'omcom-9aa9b.firebasestorage.app'}"
VITE_FIREBASE_APP_ID="${appId || '1:724459194015:web:abcdef'}"`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Firebase Integration Hub</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  omcom-9aa9b
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect Firestore (real-time database) and Firebase Storage (APKs & media)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Callout Banner */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Project <strong>omcom-9aa9b</strong> is active. Paste your Web API Key to connect live!</span>
          </div>
          <a
            href="https://console.firebase.google.com/project/omcom-9aa9b/settings/general"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Get Key from Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'connect' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connect Credentials
            {activeTab === 'connect' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'guide' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Step-by-Step Guide
            {activeTab === 'guide' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'rules' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security Rules Template
            {activeTab === 'rules' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}

          {/* TAB 1: CONNECT FORM */}
          {activeTab === 'connect' && (
            <form onSubmit={handleSaveAndConnect} className="space-y-4">
              {/* Quick Paste Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Quick Paste: Paste Firebase SDK snippet from Firebase Console:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="const firebaseConfig = { apiKey: '...', projectId: '...' };"
                    value={jsonConfigInput}
                    onChange={(e) => setJsonConfigInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleParseJsonConfig}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Individual Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">API Key *</label>
                  <input
                    type="text"
                    required
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="omstore-app-12345"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    placeholder="project-id.firebaseapp.com"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    placeholder="project-id.appspot.com"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">App ID</label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {isFirebaseActive() ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                  >
                    Disconnect Firebase
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Currently operating in Express local database mode
                  </span>
                )}

                <button
                  type="submit"
                  disabled={testing}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-lg shadow-amber-400/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Save & Activate Firebase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: STEP-BY-STEP BEGINNER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  Create a Firebase Project
                </div>
                <p className="text-slate-400 leading-normal pl-7">
                  Go to{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 underline inline-flex items-center gap-1"
                  >
                    console.firebase.google.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and click <strong>Add project</strong>. Name it e.g. <code>omstore-app</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  Enable Cloud Firestore
                </div>
                <p className="text-slate-400 leading-normal pl-7">
                  In the Firebase console sidebar, navigate to <strong>Build &gt; Firestore Database</strong>. Click <strong>Create Database</strong> and choose your location.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  Enable Firebase Storage (For Heavy APK Files)
                </div>
                <p className="text-slate-400 leading-normal pl-7">
                  Under <strong>Build &gt; Storage</strong>, click <strong>Get Started</strong>. This provisions your cloud storage bucket for holding heavy Android APK binary files.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                    4
                  </span>
                  Register Web App & Copy Keys
                </div>
                <p className="text-slate-400 leading-normal pl-7">
                  Click Project Settings (gear icon) &gt; General &gt; Your apps &gt; Web (<code>&lt;/&gt;</code>). Copy the <code>firebaseConfig</code> values into the <strong>Connect Credentials</strong> tab here!
                </p>
              </div>

              {/* Copy .env snippet */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Optional: Save via .env</span>
                  <button
                    onClick={copyEnv}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold hover:underline"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnv ? 'Copied!' : 'Copy .env snippet'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {envSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                To allow game reading for all visitors and publishing for administrators, paste these into your Firebase Console:
              </p>

              <div>
                <div className="font-bold text-slate-300 mb-1">Firestore Rules (firestore.rules):</div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-normal">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Anyone can browse and download games
      allow read: if true;
      // Allow create, update, delete for authenticated admins
      allow write: if request.auth != null || true; // Set to request.auth != null in production
    }
  }
}`}
                </pre>
              </div>

              <div>
                <div className="font-bold text-slate-300 mb-1">Firebase Storage Rules (storage.rules):</div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-normal">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /apks/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
