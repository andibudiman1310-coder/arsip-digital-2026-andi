import React from 'react';
import {
  Star,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Trash2,
  Edit2,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
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

interface DocumentTableViewProps {
  documents: ArchiveDocument[];
  onPreview: (doc: ArchiveDocument) => void;
  onDownload: (doc: ArchiveDocument) => void;
  onDeleteRequest: (doc: ArchiveDocument) => void;
  onToggleStar: (doc: ArchiveDocument) => void;
  onEdit: (doc: ArchiveDocument) => void;
}

export const DocumentTableView: React.FC<DocumentTableViewProps> = ({
  documents,
  onPreview,
  onDownload,
  onDeleteRequest,
  onToggleStar,
  onEdit,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4 w-10 text-center">Fav</th>
            <th className="py-3 px-4">Nama Dokumen</th>
            <th className="py-3 px-4">Kategori</th>
            <th className="py-3 px-4">Tgl Terbit</th>
            <th className="py-3 px-4">Masa Berlaku</th>
            <th className="py-3 px-4">Ukuran</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {documents.map((doc) => {
            const catMeta = getCategoryMeta(doc.category);
            const expiry = checkExpiryStatus(doc.expiryDate);
            const ext = getFileExtension(doc.fileName);
            const isImage = doc.mimeType.startsWith('image/');
            const isPdf = doc.mimeType.includes('pdf');
            const isSheet =
              doc.mimeType.includes('sheet') || doc.mimeType.includes('excel');

            return (
              <tr
                key={doc.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Star */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onToggleStar(doc)}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      doc.isStarred
                        ? 'text-amber-400'
                        : 'text-slate-600 hover:text-amber-400'
                    }`}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={doc.isStarred ? 'currentColor' : 'none'}
                    />
                  </button>
                </td>

                {/* Title & File */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => onPreview(doc)}
                      className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 cursor-pointer group-hover:border-indigo-500/50"
                    >
                      {isImage ? (
                        <ImageIcon className="w-4 h-4 text-sky-400" />
                      ) : isPdf ? (
                        <FileText className="w-4 h-4 text-rose-400" />
                      ) : isSheet ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        onClick={() => onPreview(doc)}
                        className="font-semibold text-white group-hover:text-indigo-300 transition-colors cursor-pointer truncate max-w-xs"
                      >
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {doc.fileName} &bull; {ext}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catMeta.bgColor} ${catMeta.color} ${catMeta.borderColor}`}
                  >
                    {catMeta.name}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                  {formatDate(doc.documentDate || doc.createdAt)}
                </td>

                {/* Expiry */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {expiry.status === 'expired' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      {expiry.label}
                    </span>
                  )}
                  {expiry.status === 'warning' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      {expiry.label}
                    </span>
                  )}
                  {expiry.status === 'safe' && (
                    <span className="text-[11px] text-slate-400">
                      {formatDate(doc.expiryDate)}
                    </span>
                  )}
                  {expiry.status === 'none' && (
                    <span className="text-[11px] text-slate-400">-</span>
                  )}
                </td>

                {/* Size */}
                <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                  {formatBytes(doc.size)}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onPreview(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Pratinjau"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Unduh"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {doc.webViewLink && (
                      <a
                        href={doc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                        title="Buka di Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus dari Google Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
