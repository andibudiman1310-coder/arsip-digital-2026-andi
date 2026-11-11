import React from 'react';
import { Files, HardDrive, Star, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ArchiveDocument } from '../types/archive';
import { formatBytes, checkExpiryStatus } from '../utils/formatters';

interface StatsBannerProps {
  documents: ArchiveDocument[];
  onSelectFilter: (filter: 'all' | 'starred' | 'expiring') => void;
  activeFilter: string;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  documents,
  onSelectFilter,
  activeFilter,
}) => {
  const totalDocs = documents.length;
  const totalBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
  const starredCount = documents.filter((doc) => doc.isStarred).length;

  const expiringDocs = documents.filter((doc) => {
    if (!doc.expiryDate) return false;
    const status = checkExpiryStatus(doc.expiryDate);
    return status.status === 'warning' || status.status === 'expired';
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Archives */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === 'all'
            ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Arsip</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Files className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{totalDocs}</span>
          <span className="text-xs text-slate-400">dokumen</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tersinkron di Google Drive</span>
        </div>
      </div>

      {/* Storage Used */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Ukuran di Drive</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {formatBytes(totalBytes)}
          </span>
          <span className="text-xs text-slate-400">terpakai</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Kapasitas Google Drive Pribadi
        </div>
      </div>

      {/* Starred / Penting */}
      <div
        onClick={() => onSelectFilter('starred')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === 'starred'
            ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Dokumen Utama</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Star className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{starredCount}</span>
          <span className="text-xs text-slate-400">berbintang</span>
        </div>
        <div className="mt-2 text-[11px] text-amber-400/90">
          Akses cepat dokumen favorit
        </div>
      </div>

      {/* Expiry alerts */}
      <div
        onClick={() => onSelectFilter('expiring')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === 'expiring'
            ? 'bg-slate-800/90 border-rose-500/60 shadow-lg shadow-rose-500/10'
            : expiringDocs.length > 0
            ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Perhatian Masa Berlaku</span>
          <div
            className={`p-2 rounded-xl ${
              expiringDocs.length > 0
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              expiringDocs.length > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {expiringDocs.length}
          </span>
          <span className="text-xs text-slate-400">dokumen</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {expiringDocs.length > 0 ? (
            <span className="text-rose-400 font-medium">Segera / sudah kadaluarsa</span>
          ) : (
            <span>Semua dokumen aman</span>
          )}
        </div>
      </div>
    </div>
  );
};
