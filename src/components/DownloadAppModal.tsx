import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Download,
  Laptop,
  CheckCircle2,
  X,
  Monitor,
  Sparkles,
  ArrowDownToLine,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
  isAlreadyInstalled?: boolean;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
  isAlreadyInstalled = false
}) => {
  const { settings } = usePharmacy();
  const [activeTab, setActiveTab] = useState<'chrome' | 'edge' | 'safari' | 'shortcut'>('chrome');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Download Desktop Launcher Shortcut File (.html)
  const handleDownloadDesktopLauncher = () => {
    const appUrl = window.location.href;
    const launcherHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${settings.pharmacyName} - Desktop Launcher</title>
  <meta http-equiv="refresh" content="0; url=${appUrl}">
  <script>
    window.location.href = "${appUrl}";
  </script>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
    }
    a {
      color: #10b981;
      font-weight: bold;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Launching ${settings.pharmacyName}...</h2>
    <p>Connecting to secure pharmacy portal...</p>
    <p>If not redirected automatically, <a href="${appUrl}">click here to launch</a>.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([launcherHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.pharmacyName.replace(/\s+/g, '_')}_Desktop_App.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice('Desktop App Launcher shortcut downloaded! Move it to your PC Desktop for instant 1-click access.');
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-6 flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs font-bold mb-1">
              <Laptop className="w-3.5 h-3.5" />
              <span>PC Desktop Application</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Download {settings.pharmacyName} to PC
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-md">
              Install as a standalone app on Windows, macOS, or Linux. Launch directly from your PC desktop with zero browser address bar clutter!
            </p>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Notification Alert */}
          {downloadNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
          )}

          {/* Primary Action Panel */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Direct PC App Installer</h3>
                  <p className="text-xs text-slate-400">
                    {deferredPrompt
                      ? '1-Click Desktop App installation is ready!'
                      : isAlreadyInstalled
                      ? 'App is installed on this PC'
                      : 'Click below to install directly to PC Desktop'}
                  </p>
                </div>
              </div>

              {/* Install / Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onTriggerInstall}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{deferredPrompt ? 'Install App on PC Now' : 'Trigger Install Prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDesktopLauncher}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs flex items-center justify-center gap-2 border border-slate-700 transition shrink-0"
                  title="Download Desktop Launcher Shortcut File"
                >
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                  <span>Save PC Shortcut File</span>
                </button>
              </div>

            </div>

            {/* Desktop Advantages Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant PC Taskbar Launch</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Isolated Window & High Speed</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full POS & Printer Support</span>
              </div>
            </div>
          </div>

          {/* Browser Instructions Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" /> PC Browser Installation Guide
              </h4>
              <span className="text-[11px] text-slate-500">Select your PC browser:</span>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {[
                { id: 'chrome', label: 'Google Chrome' },
                { id: 'edge', label: 'Microsoft Edge' },
                { id: 'safari', label: 'Mac Safari' },
                { id: 'shortcut', label: 'Desktop Shortcut' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Instructions Content */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
              {activeTab === 'chrome' && (
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Look at the right side of your Chrome address bar (URL bar) at the top of the browser.</li>
                  <li>Click the <strong className="text-emerald-400">Install / Download Icon</strong> (a small monitor icon with a down arrow <Download className="w-3 h-3 inline text-emerald-400" />).</li>
                  <li>Alternatively, click the <strong>3-dots menu (⋮)</strong> in Chrome → select <strong>"Save and share"</strong> → <strong>"Install Pharmacy Management System..."</strong></li>
                  <li>Click <strong>Install</strong>. A standalone PC App icon will be placed directly onto your <strong>Windows / Mac Desktop</strong>!</li>
                </ol>
              )}

              {activeTab === 'edge' && (
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Look at the right side of your Microsoft Edge address bar.</li>
                  <li>Click the <strong className="text-emerald-400">App Available Icon</strong> (<Monitor className="w-3 h-3 inline text-emerald-400" />).</li>
                  <li>Click <strong>Install</strong> to add {settings.pharmacyName} to your <strong>Windows Start Menu</strong>, <strong>Desktop</strong>, and <strong>Taskbar</strong>.</li>
                  <li>Right-click the app icon on your taskbar and select <strong>"Pin to taskbar"</strong> for instant 1-click access.</li>
                </ol>
              )}

              {activeTab === 'safari' && (
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>In Safari on macOS Sonoma or later: Click the <strong>Share button</strong> in the top toolbar or file menu.</li>
                  <li>Select <strong className="text-emerald-400">"Add to Dock"</strong>.</li>
                  <li>Confirm the app name as <strong>"{settings.pharmacyName}"</strong> and click <strong>Add</strong>.</li>
                  <li>The app will now be available in your macOS Applications folder and Mac Dock!</li>
                </ol>
              )}

              {activeTab === 'shortcut' && (
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Click the <strong className="text-emerald-400">"Save PC Shortcut File"</strong> button above.</li>
                  <li>A desktop launcher file named <code className="text-emerald-300 font-mono text-[11px] bg-slate-900 px-1 py-0.5 rounded">{settings.pharmacyName.replace(/\s+/g, '_')}_Desktop_App.html</code> will download to your PC.</li>
                  <li>Drag or move this file to your PC Desktop.</li>
                  <li>Double-clicking this icon on your PC desktop will instantly open your pharmacy app!</li>
                </ol>
              )}
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-2 flex justify-end border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
            >
              Close Window
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
