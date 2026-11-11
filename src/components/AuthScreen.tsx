import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  HardDrive,
  FolderLock,
  Search,
  BellRing,
  FileCheck2,
  Lock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onEnterDemoMode: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  isLoading,
  errorMessage,
  onEnterDemoMode,
}) => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderLock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Arsip Pribadi</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Google Drive Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">Vault Digital Dokumen & Berkas Penting</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInIframe && (
              <button
                onClick={handleOpenNewTab}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-2 rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
                title="Buka aplikasi di tab browser terpisah agar login Google lancar tanpa terhalang iframe"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Buka di Tab Baru</span>
              </button>
            )}

            <button
              onClick={onEnterDemoMode}
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Coba Mode Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Login */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aplikasi Arsip Dokumen Digital Pribadi Online</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Arsipkan Dokumen Penting Anda Secara{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-500">
                Aman di Google Drive
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Kelola KTP, KK, Ijazah, Polis Asuransi, SPT Pajak, BPKB, dan berkas penting lainnya dalam satu dashboard rapi. Bebas rasa cemas hilang atau rusak, langsung tersimpan di akun Google Drive pribadi Anda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Google Drive Native</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Berkas asli berada di Google Drive Anda. Tidak ada server pihak ketiga yang menyimpan dokumen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Privasi Terjaga</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hanya Anda yang memiliki akses penuh dengan enkripsi Google Cloud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Peringatan Kadaluarsa</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pantau masa berlaku SIM, Paspor, STNK, dan asuransi sebelum terlambat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Pencarian & Kategori Cepat</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Temukan berkas dalam hitungan detik berdasarkan kategori, tanggal, atau label.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Google Sign In Card & Demo Option */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-7 border border-slate-800 shadow-2xl shadow-indigo-950/50 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-[10px] font-bold text-white shadow-md">
                  Pilihan Masuk
                </span>
                <button
                  type="button"
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showTroubleshooting ? 'Tutup Bantuan' : 'Kendala Masuk?'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Masuk ke Ruang Arsip</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hubungkan akun Google Anda untuk mengakses folder{' '}
                  <span className="text-slate-200 font-medium font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                    📁 Arsip Digital Pribadi
                  </span>{' '}
                  di Google Drive.
                </p>
              </div>

              {/* Troubleshooting explanation box */}
              {showTroubleshooting && (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>Mengapa Login Google Bisa Terkendala?</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    <li>
                      <strong>Popup Diblokir Browser:</strong> Peramban sering memblokir jendela popup otomatis. Pastikan izinkan popup di bilah URL atas browser Anda.
                    </li>
                    <li>
                      <strong>Pratinjau dalam Frame (iFrame):</strong> Di lingkungan pratinjau AI Studio, Google membatasi cookie pihak ketiga. Solusi terbaik adalah klik <strong>"Buka di Tab Baru"</strong> di bawah.
                    </li>
                    <li>
                      <strong>Mode Demo:</strong> Anda juga bisa langsung mencoba semua fitur tanpa login dengan klik <strong>"Buka Mode Demo"</strong>.
                    </li>
                  </ul>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {isInIframe && (
                      <button
                        onClick={handleOpenNewTab}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/40 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        <span>Buka di Tab Baru</span>
                      </button>
                    )}
                    <button
                      onClick={onEnterDemoMode}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
                    >
                      Buka Mode Demo &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Official Sign In with Google Button per Workspace Guidelines */}
              <div className="space-y-3">
                <button
                  onClick={onLogin}
                  disabled={isLoading}
                  className="gsi-material-button w-full flex items-center justify-center transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    backgroundColor: '#131314',
                    backgroundImage: 'none',
                    border: '1px solid #747775',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    color: '#e3e3e3',
                    cursor: 'pointer',
                    fontFamily: "'Google Sans', Roboto, arial, sans-serif",
                    fontSize: '14px',
                    height: '48px',
                    letterSpacing: '0.25px',
                    outline: 'none',
                    overflow: 'hidden',
                    padding: '0 16px',
                    position: 'relative',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    width: '100%',
                  }}
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <div className="w-5 h-5 shrink-0">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block', width: '20px', height: '20px' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="font-semibold text-slate-100">
                      {isLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
                    </span>
                  </div>
                </button>

                {isInIframe && (
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-sky-400 hover:text-sky-300 text-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Aplikasi di Tab Penuh (Direkomendasikan)</span>
                  </button>
                )}

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-800"></div>
                  <span className="text-[11px] text-slate-400">atau</span>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                {/* Direct Demo / Instant Access Button */}
                <button
                  type="button"
                  onClick={onEnterDemoMode}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buka Langsung dengan Mode Demo Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mendukung PDF, Foto/Scan, Word, Excel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Dapat diakses juga di aplikasi Google Drive resmi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-400">
        <p>
          Arsip Digital Pribadi &bull; Terintegrasi dengan Google Workspace Drive API &bull; 100% Kepemilikan Pengguna
        </p>
      </footer>
    </div>
  );
};
