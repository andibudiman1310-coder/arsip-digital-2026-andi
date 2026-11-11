import React from 'react';
import {
  Star,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  MoreVertical,
  Edit2,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { ArchiveDocument } from '../types/archive';
import {
  formatBytes,
  formatDate,
  checkExpiryStatus,
  getCategoryMeta,
  getFileExtension,
} from '../utils/formatters';

interface DocumentCardProps {
  document: ArchiveDocument;
  onPreview: (doc: ArchiveDocument) => void;
  onDownload: (doc: ArchiveDocument) => void;
  onDeleteRequest: (doc: ArchiveDocument) => void;
  onToggleStar: (doc: ArchiveDocument) => void;
  onEdit: (doc: ArchiveDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
  onDeleteRequest,
  onToggleStar,
  onEdit,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const categoryMeta = getCategoryMeta(document.category);
  const expiry = checkExpiryStatus(document.expiryDate);
  const ext = getFileExtension(document.fileName);

  const isImage = document.mimeType.startsWith('image/');
  const isPdf = document.mimeType.includes('pdf');
  const isSheet =
    document.mimeType.includes('sheet') || document.mimeType.includes('excel');

  return (
    <div className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/20">
      <div>
        {/* Top bar: Category Badge + Star & Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryMeta.bgColor} ${categoryMeta.color} ${categoryMeta.borderColor} truncate`}
          >
            {categoryMeta.name}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleStar(document)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                document.isStarred
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title={document.isStarred ? 'Hapus bintang' : 'Beri bintang'}
            >
              <Star className="w-4 h-4" fill={document.isStarred ? 'currentColor' : 'none'} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onPreview(document);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lihat Pratinjau</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(document);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Edit Metadata</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDownload(document);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unduh Berkas</span>
                    </button>
                    {document.webViewLink && (
                      <a
                        href={document.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 transition-colors text-left"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>Buka di Google Drive</span>
                      </a>
                    )}
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteRequest(document);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus dari Drive</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* File Visual Icon / Thumbnail */}
        <div
          onClick={() => onPreview(document)}
          className="relative h-28 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center overflow-hidden mb-3.5 cursor-pointer group-hover:border-indigo-500/40 transition-colors"
        >
          {document.thumbnailLink ? (
            <img
              src={document.thumbnailLink}
              alt={document.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
              {isImage ? (
                <ImageIcon className="w-10 h-10" />
              ) : isPdf ? (
                <FileText className="w-10 h-10 text-rose-400/80" />
              ) : isSheet ? (
                <FileSpreadsheet className="w-10 h-10 text-emerald-400/80" />
              ) : (
                <FileText className="w-10 h-10 text-sky-400/80" />
              )}
            </div>
          )}

          {/* Extension Badge */}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-300">
            {ext}
          </span>
        </div>

        {/* Title & Filename */}
        <div>
          <h3
            onClick={() => onPreview(document)}
            className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
            title={document.title}
          >
            {document.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
            {document.fileName}
          </p>
        </div>

        {/* Expiry Warning Badge if applicable */}
        {expiry.status !== 'none' && (
          <div className="mt-2.5">
            {expiry.status === 'expired' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                <span>{expiry.label}</span>
              </span>
            )}
            {expiry.status === 'warning' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                <span>{expiry.label}</span>
              </span>
            )}
            {expiry.status === 'safe' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span>{expiry.label}</span>
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {document.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta & Quick Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>{formatBytes(document.size)}</span>
          <span>&bull;</span>
          <span>{formatDate(document.documentDate || document.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPreview(document)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pratinjau cepat"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownload(document)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Unduh berkas"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
