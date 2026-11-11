import { ArchiveCategory, ARCHIVE_CATEGORIES } from '../types/archive';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export interface ExpiryStatus {
  status: 'expired' | 'warning' | 'safe' | 'none';
  label: string;
  daysRemaining?: number;
}

export function checkExpiryStatus(expiryDate?: string): ExpiryStatus {
  if (!expiryDate) {
    return { status: 'none', label: 'Tanpa Kadaluarsa' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) {
    return { status: 'none', label: 'Format tidak valid' };
  }

  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: `Kadaluarsa (${Math.abs(diffDays)} hari lalu)`,
      daysRemaining: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'warning',
      label: 'Kadaluarsa Hari Ini!',
      daysRemaining: 0,
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'warning',
      label: `Segera Kadaluarsa (${diffDays} hari lagi)`,
      daysRemaining: diffDays,
    };
  }

  return {
    status: 'safe',
    label: `Berlaku hingga ${formatDate(expiryDate)}`,
    daysRemaining: diffDays,
  };
}

export function getCategoryMeta(categoryId: ArchiveCategory) {
  return (
    ARCHIVE_CATEGORIES.find((c) => c.id === categoryId) || {
      id: 'lainnya',
      name: 'Lainnya',
      description: 'Dokumen umum',
      iconName: 'FolderArchive',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
    }
  );
}

export function guessCategoryFromFileName(fileName: string): ArchiveCategory {
  const lower = fileName.toLowerCase();

  if (
    lower.includes('ktp') ||
    lower.includes('sim') ||
    lower.includes('paspor') ||
    lower.includes('passport') ||
    lower.includes('kartu keluarga') ||
    lower.includes('kk') ||
    lower.includes('akta') ||
    lower.includes('nikah')
  ) {
    return 'identitas';
  }

  if (
    lower.includes('pajak') ||
    lower.includes('spt') ||
    lower.includes('npwp') ||
    lower.includes('gaji') ||
    lower.includes('slip') ||
    lower.includes('invoice') ||
    lower.includes('struk') ||
    lower.includes('transfer') ||
    lower.includes('rekening')
  ) {
    return 'keuangan';
  }

  if (
    lower.includes('ijazah') ||
    lower.includes('transkrip') ||
    lower.includes('sertifikat') ||
    lower.includes('kursus') ||
    lower.includes('training') ||
    lower.includes('diploma') ||
    lower.includes('kontrak') ||
    lower.includes('sk')
  ) {
    return 'pendidikan';
  }

  if (
    lower.includes('bpjs') ||
    lower.includes('medis') ||
    lower.includes('lab') ||
    lower.includes('resep') ||
    lower.includes('dokter') ||
    lower.includes('klinik') ||
    lower.includes('vaksin')
  ) {
    return 'kesehatan';
  }

  if (
    lower.includes('rumah') ||
    lower.includes('tanah') ||
    lower.includes('shm') ||
    lower.includes('ajb') ||
    lower.includes('bpkb') ||
    lower.includes('stnk') ||
    lower.includes('kendaraan') ||
    lower.includes('asuransi')
  ) {
    return 'aset';
  }

  if (
    lower.includes('perjanjian') ||
    lower.includes('mou') ||
    lower.includes('notaris') ||
    lower.includes('kuasa') ||
    lower.includes('hukum')
  ) {
    return 'hukum';
  }

  if (lower.includes('keluarga') || lower.includes('foto') || lower.includes('nikah')) {
    return 'keluarga';
  }

  return 'lainnya';
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || 'FILE' : 'FILE';
}
