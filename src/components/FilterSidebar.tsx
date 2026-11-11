import React from 'react';
import {
  Folder,
  Star,
  Clock,
  AlertTriangle,
  Tag,
  HardDrive,
  ExternalLink,
  UserCheck,
  ReceiptText,
  GraduationCap,
  HeartPulse,
  Home,
  Scale,
  Users,
  FolderArchive,
  ChevronRight,
} from 'lucide-react';
import { ARCHIVE_CATEGORIES, ArchiveCategory, ArchiveDocument } from '../types/archive';
import { DriveFolderInfo } from '../services/driveApi';
import { checkExpiryStatus } from '../utils/formatters';

interface FilterSidebarProps {
  documents: ArchiveDocument[];
  selectedCategory: ArchiveCategory | 'all';
  onSelectCategory: (category: ArchiveCategory | 'all') => void;
  statusFilter: 'all' | 'starred' | 'expiring' | 'recent';
  onSelectStatusFilter: (status: 'all' | 'starred' | 'expiring' | 'recent') => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  folderInfo: DriveFolderInfo | null;
}

// Icon mapper for categories
const ICON_MAP: Record<string, React.ReactNode> = {
  UserCheck: <UserCheck className="w-4 h-4" />,
  ReceiptText: <ReceiptText className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Scale: <Scale className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  FolderArchive: <FolderArchive className="w-4 h-4" />,
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  documents,
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatusFilter,
  selectedTag,
  onSelectTag,
  folderInfo,
}) => {
  // Count documents per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    }
    return counts;
  }, [documents]);

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    for (const doc of documents) {
      if (doc.tags && Array.isArray(doc.tags)) {
        for (const t of doc.tags) {
          if (t.trim()) tagSet.add(t.trim());
        }
      }
    }
    return Array.from(tagSet).sort();
  }, [documents]);

  const starredCount = documents.filter((d) => d.isStarred).length;
  const expiringCount = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const st = checkExpiryStatus(d.expiryDate);
    return st.status === 'warning' || st.status === 'expired';
  }).length;

  return (
    <aside className="w-full lg:w-64 space-y-6 shrink-0">
      {/* Quick Status Navigation */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 space-y-1">
        <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Filter Cepat
        </p>

        <button
          onClick={() => {
            onSelectStatusFilter('all');
            onSelectCategory('all');
            onSelectTag(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === 'all' && selectedCategory === 'all' && !selectedTag
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Folder className="w-4 h-4" />
            <span>Semua Dokumen</span>
          </div>
          <span className="text-[11px] opacity-75 font-mono">{documents.length}</span>
        </button>

        <button
          onClick={() => onSelectStatusFilter('starred')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === 'starred'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Berbintang (Favorit)</span>
          </div>
          {starredCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {starredCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectStatusFilter('expiring')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === 'expiring'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Perlu Perpanjangan</span>
          </div>
          {expiringCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono animate-pulse">
              {expiringCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectStatusFilter('recent')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === 'recent'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Terbaru (30 Hari)</span>
          </div>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Kategori Arsip
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          {ARCHIVE_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(isSelected ? 'all' : cat.id);
                  if (statusFilter !== 'all') onSelectStatusFilter('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? `${cat.bgColor} ${cat.color} font-semibold border ${cat.borderColor}`
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
                title={cat.description}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={cat.color}>{ICON_MAP[cat.iconName] || <Folder className="w-4 h-4" />}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-slate-400">{count}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filter Cloud */}
      {allTags.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Label / Tag</span>
            </div>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Google Drive Folder Info Box */}
      {folderInfo && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-900/60 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>Folder Google Drive</span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono truncate">
            {folderInfo.name}
          </p>
          <p className="text-[10px] text-slate-400">
            Semua file tersimpan langsung di direktori ini di Google Drive Anda.
          </p>
          {folderInfo.webViewLink && (
            <a
              href={folderInfo.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-medium pt-1"
            >
              <span>Buka di Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </aside>
  );
};
