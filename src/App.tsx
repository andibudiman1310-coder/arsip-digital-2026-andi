import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
  getFriendlyAuthErrorMessage,
} from './services/firebase';
import {
  getOrCreateArchiveFolder,
  loadArchiveCatalog,
  saveArchiveCatalog,
  uploadDocumentToDrive,
  deleteDocumentFromDrive,
  updateDocumentMetadata,
  downloadFileToBrowser,
  DriveFolderInfo,
  ROOT_FOLDER_NAME,
} from './services/driveApi';
import {
  ArchiveDocument,
  ArchiveCatalog,
  ArchiveCategory,
  ViewMode,
  SortField,
  SortOrder,
} from './types/archive';
import { checkExpiryStatus } from './utils/formatters';

// Components
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { DocumentCard } from './components/DocumentCard';
import { DocumentTableView } from './components/DocumentTableView';
import { UploadModal } from './components/UploadModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EditModal } from './components/EditModal';

import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  FolderOpen,
  Search,
  AlertCircle,
  FilePlus2,
  CheckCircle,
  Sparkles,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

// Sample starter documents for immediate demo preview
const createInitialDemoDocs = (): ArchiveDocument[] => {
  const today = new Date();
  const expiringSoonDate = new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const passportExpiringDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return [
    {
      id: 'demo-ktp',
      driveFileId: 'demo-drive-ktp-101',
      fileName: 'eKTP_Andi_Budiman_Scan.pdf',
      title: 'Kartu Tanda Penduduk (e-KTP)',
      category: 'identitas',
      tags: ['KTP', 'Identitas', 'Resmi', 'Disdukcapil'],
      notes: 'NIK: 3271021310920005. Berkas fisik asli ada di Map Dokumen Pribadi (Lemari 1).',
      mimeType: 'application/pdf',
      size: 450200,
      documentDate: '2021-04-15',
      isStarred: true,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'demo-sim',
      driveFileId: 'demo-drive-sim-102',
      fileName: 'SIM_A_Kepolisian_RI.jpg',
      title: 'Surat Izin Mengemudi (SIM A)',
      category: 'identitas',
      tags: ['SIM', 'Polri', 'Perpanjangan'],
      notes: 'No SIM: 920512345678. Segera perpanjang di SATPAS / SIM Keliling.',
      mimeType: 'image/jpeg',
      size: 680400,
      documentDate: '2021-12-05',
      expiryDate: expiringSoonDate, // 25 days remaining -> triggers amber alert!
      isStarred: true,
      createdAt: '2024-02-12T11:20:00Z',
      updatedAt: '2024-02-12T11:20:00Z',
    },
    {
      id: 'demo-spt',
      driveFileId: 'demo-drive-spt-103',
      fileName: 'BPE_SPT_Tahunan_Pribadi_2023.pdf',
      title: 'Bukti Penerimaan Elektronik (BPE) SPT Pajak',
      category: 'keuangan',
      tags: ['Pajak', 'DJP', 'SPT', 'Keuangan'],
      notes: 'Status SPT: Nihil. Dilaporkan melalui DJP Online.',
      mimeType: 'application/pdf',
      size: 210800,
      documentDate: '2024-03-25',
      isStarred: true,
      createdAt: '2024-03-26T09:15:00Z',
      updatedAt: '2024-03-26T09:15:00Z',
    },
    {
      id: 'demo-ijazah',
      driveFileId: 'demo-drive-ijazah-104',
      fileName: 'Ijazah_Sarjana_Komputer_Legalisir.pdf',
      title: 'Ijazah Sarjana Komputer (S1) Legalisir',
      category: 'pendidikan',
      tags: ['Ijazah', 'Sarjana', 'Kuliah', 'Legalisir'],
      notes: 'Nomor Ijazah Nasional: 552012020001234. IPK: 3.82.',
      mimeType: 'application/pdf',
      size: 1240500,
      documentDate: '2020-09-18',
      isStarred: false,
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-15T08:30:00Z',
    },
    {
      id: 'demo-bpjs',
      driveFileId: 'demo-drive-bpjs-105',
      fileName: 'Kartu_Digital_BPJS_Kesehatan.png',
      title: 'Kartu BPJS Kesehatan Kelas 1',
      category: 'kesehatan',
      tags: ['BPJS', 'Asuransi', 'Kesehatan'],
      notes: 'Faskes Tingkat 1: Puskesmas Kebayoran Baru.',
      mimeType: 'image/png',
      size: 320100,
      documentDate: '2022-01-10',
      isStarred: false,
      createdAt: '2024-01-20T14:40:00Z',
      updatedAt: '2024-01-20T14:40:00Z',
    },
    {
      id: 'demo-shm',
      driveFileId: 'demo-drive-shm-106',
      fileName: 'Sertifikat_Hak_Milik_Rumah_No45.pdf',
      title: 'Sertifikat Hak Milik (SHM) Properti',
      category: 'aset',
      tags: ['SHM', 'Sertifikat', 'Tanah', 'BPN'],
      notes: 'Luas Tanah: 180m2. Asli disimpan di Safe Deposit Box Bank.',
      mimeType: 'application/pdf',
      size: 2450000,
      documentDate: '2019-11-20',
      isStarred: true,
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z',
    },
    {
      id: 'demo-paspor',
      driveFileId: 'demo-drive-paspor-107',
      fileName: 'Paspor_Republik_Indonesia_48Halaman.pdf',
      title: 'Paspor RI 48 Halaman',
      category: 'identitas',
      tags: ['Paspor', 'Imigrasi', 'Internasional'],
      notes: 'Kantor Imigrasi Jakarta Selatan.',
      mimeType: 'application/pdf',
      size: 890000,
      documentDate: '2022-06-14',
      expiryDate: passportExpiringDate,
      isStarred: false,
      createdAt: '2024-02-01T12:00:00Z',
      updatedAt: '2024-02-01T12:00:00Z',
    },
  ];
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Archive & Drive states
  const [folderInfo, setFolderInfo] = useState<DriveFolderInfo | null>(null);
  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'starred' | 'expiring' | 'recent'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<ArchiveDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDoc, setEditDoc] = useState<ArchiveDocument | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initialize Firebase Auth listener on mount with safety timeout
  useEffect(() => {
    // Safety fallback: Never keep user stuck on loading spinner for more than 800ms
    const timer = setTimeout(() => {
      setAuthChecking(false);
    }, 800);

    try {
      const unsubscribe = initAuth(
        (currentUser, accessToken) => {
          clearTimeout(timer);
          setUser(currentUser);
          setToken(accessToken);
          setIsDemoMode(false);
          setAuthChecking(false);
        },
        () => {
          clearTimeout(timer);
          setAuthChecking(false);
        }
      );

      return () => {
        clearTimeout(timer);
        unsubscribe?.();
      };
    } catch (e) {
      clearTimeout(timer);
      setAuthChecking(false);
    }
  }, []);

  // Fetch Folder & Catalog when token is available
  const loadDriveData = useCallback(async (currentAccessToken: string) => {
    try {
      setIsLoadingData(true);
      setDataError(null);

      // 1. Get or create root folder
      const folder = await getOrCreateArchiveFolder(currentAccessToken);
      setFolderInfo(folder);

      // 2. Load catalog & documents
      const catalog = await loadArchiveCatalog(currentAccessToken, folder.id);
      setDocuments(catalog.documents);
    } catch (err: any) {
      console.error('Error loading Drive data:', err);
      setDataError(
        err.message ||
          'Gagal menghubungkan ke folder Google Drive. Anda tetap dapat menggunakan aplikasi dalam Mode Demo.'
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (token && !isDemoMode) {
      loadDriveData(token);
    }
  }, [token, isDemoMode, loadDriveData]);

  // Login Handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setAccessToken(res.accessToken);
        setIsDemoMode(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setAuthError(friendlyMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Demo Mode Handler (Allows user to immediately use the app)
  const handleEnterDemoMode = () => {
    setIsDemoMode(true);
    setAuthError(null);
    setDocuments(createInitialDemoDocs());
    setFolderInfo({
      id: 'demo-folder-drive',
      name: ROOT_FOLDER_NAME,
      webViewLink: 'https://drive.google.com',
    });
    // Create a mock user
    const mockUser: any = {
      uid: 'demo-user-123',
      displayName: 'Pengguna Pribadi',
      email: 'andibudiman1310@gmail.com',
      photoURL: null,
    };
    setUser(mockUser);
    showToast('Mode Demo Aktif: Menampilkan arsip contoh.');
  };

  // Logout Handler
  const handleLogout = async () => {
    if (!isDemoMode) {
      await logout();
    }
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
    setFolderInfo(null);
    setDocuments([]);
  };

  // Upload Document Handler
  const handleUploadDocument = async (
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
  ): Promise<ArchiveDocument> => {
    // In demo mode: simulate local upload
    if (isDemoMode) {
      onProgress(30, 'Membaca berkas lokal...');
      await new Promise((r) => setTimeout(r, 400));
      onProgress(70, 'Menyimpan ke katalog arsip...');
      await new Promise((r) => setTimeout(r, 400));
      onProgress(100, 'Selesai!');

      const mockDoc: ArchiveDocument = {
        id: 'local-' + Date.now(),
        driveFileId: 'demo-drive-' + Date.now(),
        fileName: file.name,
        title: meta.title,
        category: meta.category,
        tags: meta.tags,
        notes: meta.notes,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        documentDate: meta.documentDate || new Date().toISOString().slice(0, 10),
        expiryDate: meta.expiryDate,
        isStarred: !!meta.isStarred,
        webViewLink: 'https://drive.google.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [mockDoc, ...prev]);
      showToast(`Dokumen "${mockDoc.title}" berhasil diarsipkan!`);
      return mockDoc;
    }

    if (!token || !folderInfo) {
      throw new Error('Sesi Google Drive belum siap.');
    }

    const newDoc = await uploadDocumentToDrive(
      token,
      folderInfo.id,
      file,
      meta,
      onProgress
    );

    // Update catalog in drive & state
    const updatedDocs = [newDoc, ...documents.filter((d) => d.id !== newDoc.id)];
    setDocuments(updatedDocs);

    const catalog: ArchiveCatalog = {
      version: 1,
      lastSync: new Date().toISOString(),
      documents: updatedDocs,
    };
    await saveArchiveCatalog(token, folderInfo.id, catalog).catch((e) =>
      console.warn('Failed to update catalog index:', e)
    );

    showToast(`Dokumen "${newDoc.title}" berhasil disimpan di Google Drive!`);
    return newDoc;
  };

  // Toggle Star Handler
  const handleToggleStar = async (doc: ArchiveDocument) => {
    const newStarred = !doc.isStarred;
    const updated = { ...doc, isStarred: newStarred };
    const updatedDocs = documents.map((d) => (d.id === doc.id ? updated : d));
    setDocuments(updatedDocs);

    if (isDemoMode) {
      showToast(newStarred ? `"${doc.title}" dibintangi` : `Bintang dihapus`);
      return;
    }

    if (!token || !folderInfo) return;

    try {
      await updateDocumentMetadata(token, doc, { isStarred: newStarred });
      const catalog: ArchiveCatalog = {
        version: 1,
        lastSync: new Date().toISOString(),
        documents: updatedDocs,
      };
      await saveArchiveCatalog(token, folderInfo.id, catalog);
      showToast(
        newStarred
          ? `"${doc.title}" ditambahkan ke Berbintang`
          : `"${doc.title}" dihapus dari Berbintang`
      );
    } catch (err: any) {
      console.error('Failed to update star:', err);
      setDocuments(documents);
      showToast('Gagal memperbarui status bintang.');
    }
  };

  // Download Handler
  const handleDownload = async (doc: ArchiveDocument) => {
    if (isDemoMode) {
      // In demo mode, trigger a text or sample download
      const content = `ARSIP DIGITAL PRIBADI - SALINAN RESMI\n\nJudul: ${doc.title}\nNama Berkas: ${doc.fileName}\nKategori: ${doc.category}\nTanggal: ${doc.documentDate || doc.createdAt}\nCatatan: ${doc.notes || '-'}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.txt') ? doc.fileName : `${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Mengunduh berkas arsip: ${doc.title}`);
      return;
    }

    if (!token) return;
    try {
      showToast(`Mengunduh "${doc.fileName}"...`);
      await downloadFileToBrowser(token, doc.driveFileId, doc.fileName);
    } catch (err: any) {
      console.error(err);
      showToast('Gagal mengunduh berkas. Coba buka langsung melalui Google Drive.');
    }
  };

  // Delete Document Handler (Mandatory confirmation modal triggers this)
  const handleConfirmDelete = async (doc: ArchiveDocument) => {
    try {
      setIsDeleting(true);

      if (!isDemoMode && token) {
        await deleteDocumentFromDrive(token, doc.driveFileId);
      }

      const updatedDocs = documents.filter((d) => d.id !== doc.id);
      setDocuments(updatedDocs);

      if (!isDemoMode && token && folderInfo) {
        const catalog: ArchiveCatalog = {
          version: 1,
          lastSync: new Date().toISOString(),
          documents: updatedDocs,
        };
        await saveArchiveCatalog(token, folderInfo.id, catalog).catch((e) =>
          console.warn('Failed to update catalog index:', e)
        );
      }

      setDeleteDoc(null);
      if (previewDoc?.id === doc.id) {
        setPreviewDoc(null);
      }
      showToast(`Dokumen "${doc.title}" berhasil dihapus.`);
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Gagal menghapus berkas.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit Metadata Handler
  const handleSaveEdit = async (
    doc: ArchiveDocument,
    updates: Partial<ArchiveDocument>
  ) => {
    try {
      setIsSavingEdit(true);
      const updated = { ...doc, ...updates, updatedAt: new Date().toISOString() };
      const updatedDocs = documents.map((d) => (d.id === doc.id ? updated : d));
      setDocuments(updatedDocs);

      if (previewDoc?.id === doc.id) {
        setPreviewDoc(updated);
      }

      if (!isDemoMode && token && folderInfo) {
        await updateDocumentMetadata(token, doc, updates);
        const catalog: ArchiveCatalog = {
          version: 1,
          lastSync: new Date().toISOString(),
          documents: updatedDocs,
        };
        await saveArchiveCatalog(token, folderInfo.id, catalog);
      }

      showToast('Metadata dokumen berhasil diperbarui!');
    } catch (err: any) {
      console.error('Edit failed:', err);
      showToast(err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Create Starter Sample Document if empty
  const handleCreateSampleDoc = async () => {
    try {
      const sampleContent = `ARSIP DIGITAL PRIBADI - PANDUAN PENGGUNAAN\n===============================================\nSelamat datang di aplikasi Arsip Digital Pribadi Anda!\n\nFolder: ${ROOT_FOLDER_NAME}\nWaktu: ${new Date().toLocaleString('id-ID')}\n\nTIPS PENGELOLAAN:\n1. Simpan berkas fisik penting (KTP, SIM, Ijazah, Pajak).\n2. Aktifkan tanggal masa berlaku untuk pengingat otomatis.\n3. Akses berkas kapan saja dan di mana saja.`;
      const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
      const file = new File([blob], 'Panduan_Arsip_Digital_Pribadi.txt', {
        type: 'text/plain',
      });

      await handleUploadDocument(
        file,
        {
          title: 'Panduan & Petunjuk Arsip Digital',
          category: 'lainnya',
          tags: ['Panduan', 'Awal'],
          notes: 'Berkas pengantar otomatis sistem arsip',
          documentDate: new Date().toISOString().slice(0, 10),
          isStarred: true,
        },
        () => {}
      );
    } catch (e: any) {
      console.error(e);
      showToast('Gagal membuat dokumen panduan.');
    }
  };

  // Filter & Search & Sort Pipeline
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          doc.fileName.toLowerCase().includes(q) ||
          (doc.notes && doc.notes.toLowerCase().includes(q)) ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((doc) => doc.category === selectedCategory);
    }

    // Status filter
    if (statusFilter === 'starred') {
      result = result.filter((doc) => doc.isStarred);
    } else if (statusFilter === 'expiring') {
      result = result.filter((doc) => {
        if (!doc.expiryDate) return false;
        const st = checkExpiryStatus(doc.expiryDate);
        return st.status === 'warning' || st.status === 'expired';
      });
    } else if (statusFilter === 'recent') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((doc) => {
        const d = new Date(doc.createdAt).getTime();
        return d >= thirtyDaysAgo;
      });
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((doc) => doc.tags && doc.tags.includes(selectedTag));
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const dateA = new Date(a.documentDate || a.createdAt).getTime();
        const dateB = new Date(b.documentDate || b.createdAt).getTime();
        comparison = dateA - dateB;
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'size') {
        comparison = (a.size || 0) - (b.size || 0);
      } else if (sortField === 'expiryDate') {
        const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : 9999999999999;
        const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : 9999999999999;
        comparison = expA - expB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    documents,
    searchQuery,
    selectedCategory,
    statusFilter,
    selectedTag,
    sortField,
    sortOrder,
  ]);

  // Loading initial auth state (quick 800ms max)
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Membuka Arsip Digital Pribadi...
        </p>
      </div>
    );
  }

  // Not signed in and not in demo mode -> Render Auth Screen
  if ((!user || !token) && !isDemoMode) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        isLoading={isLoggingIn}
        errorMessage={authError}
        onEnterDemoMode={handleEnterDemoMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl shadow-indigo-950 border border-indigo-400/30 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-4 h-4 text-indigo-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-sky-900/90 to-indigo-950/90 border-b border-indigo-500/30 px-4 py-2 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">Mode Uji Coba Aktif:</strong> Anda sedang menjelajahi arsip dengan data contoh lokal.
            </span>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-[11px] shadow transition-colors cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan ke Google Drive'}</span>
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user!}
        folderInfo={folderInfo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => (isDemoMode ? showToast('Data lokal diperbarui') : token && loadDriveData(token))}
        isRefreshing={isLoadingData}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Drive Connection Error alert if any */}
        {dataError && !isDemoMode && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{dataError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => token && loadDriveData(token)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleEnterDemoMode}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                Gunakan Mode Demo
              </button>
            </div>
          </div>
        )}

        {/* Stats & Highlights Banner */}
        <StatsBanner
          documents={documents}
          onSelectFilter={(f) => {
            setStatusFilter(f);
            setSelectedCategory('all');
            setSelectedTag(null);
          }}
          activeFilter={statusFilter}
        />

        {/* Layout: Sidebar + Document Workspace */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <FilterSidebar
            documents={documents}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            statusFilter={statusFilter}
            onSelectStatusFilter={setStatusFilter}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            folderInfo={folderInfo}
          />

          {/* Right Main Panel */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            {/* Action Bar (View Switcher, Sort, Active Filter Badges) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              {/* Active Filter Title */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-white">
                  {statusFilter === 'starred'
                    ? 'Dokumen Berbintang'
                    : statusFilter === 'expiring'
                    ? 'Perlu Perpanjangan / Kadaluarsa'
                    : statusFilter === 'recent'
                    ? 'Ditambahkan Baru-baru Ini'
                    : selectedCategory !== 'all'
                    ? `Kategori: ${selectedCategory}`
                    : 'Semua Dokumen Arsip'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {filteredDocuments.length}
                </span>

                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px]">
                    <span>Tag: #{selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="hover:text-white cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>

              {/* Controls: Sorting & Grid/Table toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="date" className="bg-slate-900">Tanggal</option>
                    <option value="title" className="bg-slate-900">Judul</option>
                    <option value="size" className="bg-slate-900">Ukuran</option>
                    <option value="expiryDate" className="bg-slate-900">Masa Berlaku</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-slate-400 hover:text-white px-1 font-mono text-[10px] cursor-pointer"
                    title={sortOrder === 'asc' ? 'Urutan Naik (A-Z)' : 'Urutan Turun (Z-A)'}
                  >
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </button>
                </div>

                {/* Grid / Table Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Kisi"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Tabel"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Container */}
            {isLoadingData ? (
              <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-white">
                  Menyinkronkan dokumen dari Google Drive...
                </p>
                <p className="text-xs text-slate-400">
                  Memeriksa berkas di folder "{ROOT_FOLDER_NAME}"
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-12 sm:p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center">
                {documents.length === 0 ? (
                  // Empty drive state
                  <div className="max-w-md space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Belum Ada Dokumen di Arsip
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Mulai arsipkan KTP, KK, Ijazah, atau dokumen penting lainnya ke dalam vault pribadi Anda.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Unggah Dokumen Baru</span>
                      </button>

                      <button
                        onClick={handleCreateSampleDoc}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                      >
                        <FilePlus2 className="w-4 h-4 text-sky-400" />
                        <span>Buat Dokumen Panduan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Filtered out / No search results
                  <div className="max-w-sm space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      Tidak Ada Dokumen yang Cocok
                    </h3>
                    <p className="text-xs text-slate-400">
                      Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setStatusFilter('all');
                        setSelectedTag(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={setPreviewDoc}
                    onDownload={handleDownload}
                    onDeleteRequest={setDeleteDoc}
                    onToggleStar={handleToggleStar}
                    onEdit={setEditDoc}
                  />
                ))}
              </div>
            ) : (
              <DocumentTableView
                documents={filteredDocuments}
                onPreview={setPreviewDoc}
                onDownload={handleDownload}
                onDeleteRequest={setDeleteDoc}
                onToggleStar={handleToggleStar}
                onEdit={setEditDoc}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* 1. Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadDocument}
      />

      {/* 2. Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        accessToken={token || ''}
        onDownload={handleDownload}
        onDeleteRequest={(doc) => {
          setDeleteDoc(doc);
        }}
        onEdit={(doc) => {
          setEditDoc(doc);
        }}
      />

      {/* 3. Delete Confirmation Modal (Mandatory User Confirmation per Workspace integration skill) */}
      <DeleteConfirmModal
        document={deleteDoc}
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* 4. Edit Metadata Modal */}
      <EditModal
        document={editDoc}
        isOpen={!!editDoc}
        onClose={() => setEditDoc(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />
    </div>
  );
}
