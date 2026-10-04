import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Globe,
  ExternalLink,
  MessageCircle,
  DownloadCloud
} from 'lucide-react';

interface ShareInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareInstallModal: React.FC<ShareInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // The permanent live URL for all phones & browsers
  const liveUrl = 'https://ais-pre-mlwppfzjtq775n67cs742s-670827780456.asia-east1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    liveUrl
  )}&bgcolor=020617&color=10b981&margin=1`;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = liveUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction
      alert(
        'To install on your phone:\n\n• Android: Tap the 3 dots (⋮) in Chrome > Tap "Install App" or "Add to Home screen"\n• iPhone: Tap the Share button (⎋) in Safari > Tap "Add to Home Screen"'
      );
    }
  };

  const shareText = encodeURIComponent(
    'Check out OM.COM - The Alternative Android App Store! Download popular Android games and apps directly: ' +
      liveUrl
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Globe className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Open on Any Phone & Browser</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available 24/7 on Android, iOS, Chrome, Safari, Samsung Internet
            </p>
          </div>
        </div>

        {/* Live Permanent URL Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Worldwide App Link
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Cloud Hosted</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Share on WhatsApp</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(liveUrl)}&text=${encodeURIComponent(
              'OM.COM - Alternative Android App Store'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share on Telegram</span>
          </a>
        </div>

        {/* QR Code Scan Section */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="w-32 h-32 bg-slate-950 p-2 rounded-2xl border border-emerald-500/30 shadow-inner shrink-0 flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="Scan to open OM.COM on Phone"
              className="w-full h-full rounded-xl"
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan with any Mobile Camera</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apne mobile phone ke camera ya Google Lens se is QR code ko scan karke direct store open karein!
            </p>
            <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Works on iPhone & Android</span>
            </div>
          </div>
        </div>

        {/* Install as App (PWA) Button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Install OM.COM on Your Phone</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Install as a standalone Android app directly on your mobile home screen.
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Installed' : 'Install App'}</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>
              • <strong>Chrome / Android:</strong> Tap "Install App" or Menu (⋮) &gt; "Install app"
            </p>
            <p>
              • <strong>Safari / iPhone:</strong> Tap Share button (⎋) &gt; "Add to Home Screen"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
