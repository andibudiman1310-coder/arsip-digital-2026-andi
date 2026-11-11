import React from 'react';
import { User } from 'firebase/auth';
import {
  FolderLock,
  Search,
  ExternalLink,
  RefreshCw,
  LogOut,
  FolderOpen,
  X,
  HardDrive,
} from 'lucide-react';
import { DriveFolderInfo } from '../services/driveApi';

interface NavbarProps {
  user: User;
  folderInfo: DriveFolderInfo | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  folderInfo,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onLogout,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FolderLock className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Arsip Digital</span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Drive Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Vault Berkas Pribadi</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari arsip (KTP, SPT, nama dokumen, atau tag)..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden md:inline">Tambah Dokumen</span>
            <span className="md:hidden">Unggah</span>
          </button>

          {/* Direct Drive Folder link */}
          {folderInfo?.webViewLink && (
            <a
              href={folderInfo.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs transition-colors"
              title="Buka folder '📁 Arsip Digital Pribadi' di Google Drive resmi"
            >
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Buka di Drive</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Sinkronisasi ulang dengan Google Drive"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* User profile dropdown/badge */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}

            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[120px]">
                {user.displayName || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-400 leading-none truncate max-w-[120px] mt-1">
                {user.email}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
