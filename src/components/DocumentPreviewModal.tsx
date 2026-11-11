import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  FileText,
  Clock,
  HardDrive,
  Copy,
  Check,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileQuestion,
} from 'lucide-react';
import { ArchiveDocument } from '../types/archive';
import {
  formatBytes,
  formatDate,
  formatDateTime,
  checkExpiryStatus,
  getCategoryMeta,
  getFileExtension,
} from '../utils/formatters';
import { fetchFileBlob } from '../services/driveApi';

interface DocumentPreviewModalProps {
  document: ArchiveDocument | null;
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  onDownload: (doc: ArchiveDocument) => void;
  onDeleteRequest: (doc: ArchiveDocument) => void;
  onEdit: (doc: ArchiveDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  accessToken,
  onDownload,
  onDeleteRequest,
  onEdit,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!isOpen || !document || !accessToken) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    let isMounted = true;
    setLoadingPreview(true);
    setPreviewError(null);
    setZoomLevel(1);

    const isImage = document.mimeType.startsWith('image/');
    const isPdf = document.mimeType.includes('pdf');
    const isText = document.mimeType.startsWith('text/');

    if (isImage || isPdf || isText) {
      fetchFileBlob(accessToken, document.driveFileId)
        .then(({ blob }) => {
          if (!isMounted) return;
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoadingPreview(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('Direct blob load failed:', err);
          setPreviewError('Tidak dapat memuat pratinjau langsung.');
          setLoadingPreview(false);
        });
    } else {
      setLoadingPreview(false);
    }

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, document?.driveFileId, accessToken]);

  if (!isOpen || !document) return null;

  const catMeta = getCategoryMeta(document.category);
  const expiry = checkExpiryStatus(document.expiryDate);
  const ext = getFileExtension(document.fileName);
  const isImage = document.mimeType.startsWith('image/');
  const isPdf = document.mimeType.includes('pdf');

  const handleCopyId = () => {
    navigator.clipboard.writeText(document.driveFileId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catMeta.bgColor} ${catMeta.color} ${catMeta.borderColor} shrink-0`}
            >
              {catMeta.name}
            </span>
            <div className="truncate">
              <h2 className="text-base font-bold text-white truncate" title={document.title}>
                {document.title}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {document.fileName} &bull; {formatBytes(document.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {document.webViewLink && (
              <a
                href={document.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>Buka di Drive</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <button
              onClick={() => onDownload(document)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Preview (left/main) and Metadata Inspector (right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Viewer Area */}
          <div className="lg:col-span-8 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-auto relative">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Mengambil pratinjau berkas dari Google Drive...</p>
              </div>
            ) : blobUrl && isImage ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-auto p-2">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-medium px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <img
                  src={blobUrl}
                  alt={document.title}
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl origin-center"
                />
              </div>
            ) : blobUrl && isPdf ? (
              <iframe
                src={`${blobUrl}#toolbar=1`}
                className="w-full h-full rounded-xl border border-slate-800 bg-white"
                title={document.title}
              />
            ) : (
              <div className="text-center p-8 max-w-md space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FileQuestion className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Pratinjau Dalam Aplikasi Tidak Tersedia</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Format berkas <span className="font-mono text-indigo-300 font-bold">.{ext}</span> dapat langsung dibuka melalui Google Drive web viewer resmi atau diunduh ke perangkat Anda.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {document.webViewLink && (
                    <a
                      href={document.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka di Google Drive</span>
                    </a>
                  )}
                  <button
                    onClick={() => onDownload(document)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Details Panel */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 p-6 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Informasi Arsip
              </h3>

              {/* Status Expiry Box */}
              {expiry.status !== 'none' && (
                <div
                  className={`p-3 rounded-xl border mb-4 ${
                    expiry.status === 'expired'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : expiry.status === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    {expiry.status === 'expired' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {expiry.status === 'warning' && <Clock className="w-4 h-4 text-amber-400" />}
                    <span>{expiry.label}</span>
                  </div>
                  {document.expiryDate && (
                    <p className="text-[11px] opacity-80 mt-1">
                      Masa berlaku: {formatDate(document.expiryDate)}
                    </p>
                  )}
                </div>
              )}

              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-slate-400 text-[11px]">Judul Arsip</dt>
                  <dd className="font-semibold text-white mt-0.5">{document.title}</dd>
                </div>

                <div>
                  <dt className="text-slate-400 text-[11px]">Nama Berkas Asli</dt>
                  <dd className="font-mono text-slate-300 text-[11px] mt-0.5 break-all">
                    {document.fileName}
                  </dd>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-slate-400 text-[11px]">Ukuran Berkas</dt>
                    <dd className="font-semibold text-white mt-0.5">{formatBytes(document.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Format</dt>
                    <dd className="font-semibold text-white mt-0.5 font-mono">{ext}</dd>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-slate-400 text-[11px]">Tanggal Terbit</dt>
                    <dd className="text-slate-200 mt-0.5">
                      {formatDate(document.documentDate || document.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Tanggal Diarsip</dt>
                    <dd className="text-slate-200 mt-0.5">{formatDate(document.createdAt)}</dd>
                  </div>
                </div>

                {/* Google Drive File ID */}
                <div>
                  <dt className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>Google Drive File ID</span>
                    <button
                      onClick={handleCopyId}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </dt>
                  <dd className="font-mono text-[10px] text-slate-400 mt-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 break-all select-all">
                    {document.driveFileId}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Label / Tag
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {document.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {document.notes && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan
                </h4>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {document.notes}
                </p>
              </div>
            )}

            {/* Action buttons footer inside sidebar */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => onEdit(document)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Edit Metadata Dokumen</span>
              </button>

              <button
                onClick={() => onDeleteRequest(document)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Hapus dari Google Drive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
