export type ArchiveCategory =
  | 'identitas'
  | 'pekerjaan'
  | 'pendidikan'
  | 'kesehatan'
  | 'aset'
  | 'keuangan'
  | 'hukum'
  | 'keluarga'
  | 'lainnya';

export interface CategoryMeta {
  id: ArchiveCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const ARCHIVE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'identitas',
    name: 'Identitas & Kependudukan',
    description: 'KTP, KK, SIM, Paspor, Akta Kelahiran, Buku Nikah',
    iconName: 'UserCheck',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'keuangan',
    name: 'Keuangan & Pajak',
    description: 'NPWP, SPT Pajak, Slip Gaji, Rekening Koran, Bukti Transfer',
    iconName: 'ReceiptText',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'pendidikan',
    name: 'Pendidikan & Karir',
    description: 'Ijazah, Transkrip, Sertifikat Kursus, Kontrak Kerja, SK',
    iconName: 'GraduationCap',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'kesehatan',
    name: 'Kesehatan & Medis',
    description: 'Kartu BPJS/Asuransi, Rekam Medis, Hasil Lab, Resep',
    iconName: 'HeartPulse',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  {
    id: 'aset',
    name: 'Aset & Properti',
    description: 'Sertifikat Tanah/Rumah, BPKB, STNK, Invoice Kendaraan',
    iconName: 'Home',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  {
    id: 'hukum',
    name: 'Hukum & Surat Resmi',
    description: 'Surat Perjanjian, Kuasa, Akta Notaris, Legalisir',
    iconName: 'Scale',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'keluarga',
    name: 'Keluarga & Pribadi',
    description: 'Foto Memori, Surat Rekomendasi, Catatan Pribadi',
    iconName: 'Users',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  {
    id: 'lainnya',
    name: 'Lainnya & Dokumen Bebas',
    description: 'Brosur, manual panduan, dokumen campuran',
    iconName: 'FolderArchive',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
];

export interface ArchiveDocument {
  id: string; // unique item id
  driveFileId: string; // Google Drive file ID
  fileName: string; // original uploaded file name
  title: string; // user given title
  category: ArchiveCategory;
  tags: string[];
  notes?: string;
  mimeType: string;
  size: number;
  documentDate?: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD (e.g. for SIM, Paspor, STNK)
  isStarred?: boolean;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveCatalog {
  version: number;
  lastSync: string;
  documents: ArchiveDocument[];
}

export type ViewMode = 'grid' | 'table';

export type SortField = 'date' | 'title' | 'size' | 'expiryDate';
export type SortOrder = 'asc' | 'desc';
