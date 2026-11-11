import React, { useState } from 'react';
import { X, Edit2, Calendar, Tag, Star, HardDrive } from 'lucide-react';
import {
  ARCHIVE_CATEGORIES,
  ArchiveCategory,
  ArchiveDocument,
} from '../types/archive';

interface EditModalProps {
  document: ArchiveDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: ArchiveDocument, updates: Partial<ArchiveDocument>) => Promise<void>;
  isSaving: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
  isSaving,
}) => {
  if (!isOpen || !document) return null;

  const [title, setTitle] = useState(document.title);
  const [category, setCategory] = useState<ArchiveCategory>(document.category);
  const [tagsInput, setTagsInput] = useState((document.tags || []).join(', '));
  const [notes, setNotes] = useState(document.notes || '');
  const [documentDate, setDocumentDate] = useState(document.documentDate || '');
  const [expiryDate, setExpiryDate] = useState(document.expiryDate || '');
  const [isStarred, setIsStarred] = useState(!!document.isStarred);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onSave(document, {
      title: title.trim(),
      category,
      tags,
      notes: notes.trim(),
      documentDate: documentDate || undefined,
      expiryDate: expiryDate || undefined,
      isStarred,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Edit Informasi Arsip</h2>
            <p className="text-xs text-slate-400 font-mono truncate max-w-xs">
              {document.fileName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Dokumen <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kategori Arsip
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal Dokumen
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Masa Berlaku
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Label / Tag (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="KTP, Asli, 2024"
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Lokasi Berkas Fisik
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editStar"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="editStar"
              className="text-xs text-slate-300 select-none flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Dokumen Bintang / Favorit</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
