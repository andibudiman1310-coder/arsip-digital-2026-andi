import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Tag,
  Calendar,
  AlertCircle,
  Star,
  CheckCircle2,
  HardDrive,
  FileCheck,
} from 'lucide-react';
import {
  ARCHIVE_CATEGORIES,
  ArchiveCategory,
  ArchiveDocument,
} from '../types/archive';
import {
  guessCategoryFromFileName,
  formatBytes,
} from '../utils/formatters';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: File,
    meta: {
      title: string;
      category: ArchiveCategory;
      tags: string[];
      notes?: string;
      documentDate?: string;
      expiryDate?: string;
      isStarred?: boolean;
    },
    onProgress: (percent: number, status: string) => void
  ) => Promise<ArchiveDocument>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArchiveCategory>('identitas');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [expiryDate, setExpiryDate] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    // Auto-suggest title and category
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    setTitle(cleanTitle);
    const guessedCategory = guessCategoryFromFileName(file.name);
    setCategory(guessedCategory);

    // Auto suggest tags
    const autoTags: string[] = [];
    if (guessedCategory === 'identitas') autoTags.push('Kependudukan', 'Resmi');
    if (guessedCategory === 'keuangan') autoTags.push('Pajak', 'Finansial');
    if (guessedCategory === 'aset') autoTags.push('Kepemilikan');
    if (autoTags.length > 0) {
      setTagsInput(autoTags.join(', '));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Silakan pilih berkas yang akan diarsipkan.');
      return;
    }
    if (!title.trim()) {
      setError('Judul dokumen wajib diisi.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadPercent(5);
      setUploadStatus('Memulai unggahan...');

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onUpload(
        selectedFile,
        {
          title: title.trim(),
          category,
          tags,
          notes: notes.trim(),
          documentDate: documentDate || undefined,
          expiryDate: expiryDate || undefined,
          isStarred,
        },
        (percent, status) => {
          setUploadPercent(percent);
          setUploadStatus(status);
        }
      );

      // Reset and close
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengunggah dokumen ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setTitle('');
    setCategory('identitas');
    setTagsInput('');
    setNotes('');
    setExpiryDate('');
    setIsStarred(false);
    setError(null);
    setUploadPercent(0);
    onClose();
  };

  // Preset expiry helper
  const setExpiryPreset = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    setExpiryDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/40 text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Arsipkan Dokumen Baru
            </h2>
            <p className="text-xs text-slate-400">
              Berkas akan diunggah dan disimpan langsung di Google Drive Anda
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* File Picker / Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Berkas Dokumen <span className="text-rose-400">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-950/60 hover:bg-slate-800/40 rounded-2xl p-7 text-center transition-all cursor-pointer group"
              >
                <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 flex items-center justify-center transition-all">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  Tarik berkas ke sini atau klik untuk memilih
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Mendukung PDF, Foto/Scan (JPG, PNG, WEBP), Word, Excel hingga 50 MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(selectedFile.size)} &bull; {selectedFile.type || 'Berkas'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama / Judul Dokumen <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: KTP Andi Budiman, Ijazah S1, Slip Gaji Nov"
                required
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori Arsip <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArchiveCategory)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              >
                {ARCHIVE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Terbit / Dokumen
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tanggal Kadaluarsa (Jika Ada)
                </label>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(1)}
                    className="hover:text-indigo-400 cursor-pointer"
                  >
                    +1 Thn
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setExpiryPreset(5)}
                    className="hover:text-indigo-400 cursor-pointer"
                  >
                    +5 Thn
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setExpiryDate('')}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="Opsional untuk SIM, Paspor, dsb."
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Label / Tag (Pisahkan dengan tanda koma)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Contoh: KTP, Asli, Disdukcapil, Penting"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Nomor Registrasi, lokasi berkas fisik di lemari A, atau keperluan perpanjangan"
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Starred Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="starDoc"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="starDoc"
              className="text-xs text-slate-300 select-none flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Tandai sebagai dokumen berbintang / favorit</span>
            </label>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-indigo-300">{uploadStatus}</span>
                <span className="font-mono text-slate-400">{uploadPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${uploadPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HardDrive className="w-4 h-4" />
              <span>{isUploading ? 'Menyimpan ke Drive...' : 'Simpan ke Google Drive'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
