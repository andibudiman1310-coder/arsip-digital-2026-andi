import React from 'react';
import { AlertTriangle, Trash2, X, HardDrive } from 'lucide-react';
import { ArchiveDocument } from '../types/archive';

interface DeleteConfirmModalProps {
  document: ArchiveDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (doc: ArchiveDocument) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-rose-950/40 text-slate-100">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Hapus Berkas dari Google Drive?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan menghapus dokumen ini secara permanen dari akun Google Drive Anda. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {/* File Detail Preview Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-white truncate">{document.title}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate pl-5">
            Nama Berkas: {document.fileName}
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate pl-5">
            ID Drive: {document.driveFileId}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(document)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-md shadow-rose-600/30 active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Menghapus dari Drive...' : 'Ya, Hapus Permanen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
