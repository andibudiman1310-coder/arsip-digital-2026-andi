import { ArchiveCatalog, ArchiveDocument, ArchiveCategory } from '../types/archive';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
export const ROOT_FOLDER_NAME = '📁 Arsip Digital Pribadi';
export const CATALOG_FILE_NAME = '_arsip_catalog.json';

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface UploadProgressCallback {
  (percentage: number, status: string): void;
}

/**
 * Finds or creates the main archive folder in Google Drive.
 */
export async function getOrCreateArchiveFolder(accessToken: string): Promise<DriveFolderInfo> {
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${ROOT_FOLDER_NAME}' and trashed = false`
  );

  const searchRes = await fetch(
    `${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,webViewLink)&spaces=drive`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const errorData = await searchRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal memeriksa folder di Google Drive (${searchRes.status})`
    );
  }

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    return {
      id: data.files[0].id,
      name: data.files[0].name,
      webViewLink: data.files[0].webViewLink,
    };
  }

  // Create folder if not found
  const createRes = await fetch(`${DRIVE_API_URL}/files?fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: ROOT_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis untuk Arsip Digital Pribadi',
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat folder di Google Drive (${createRes.status})`
    );
  }

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    name: newFolder.name,
    webViewLink: newFolder.webViewLink,
  };
}

/**
 * Finds the catalog index file ID inside the archive folder if it exists.
 */
async function findCatalogFileId(accessToken: string, folderId: string): Promise<string | null> {
  const query = encodeURIComponent(
    `'${folderId}' in parents and name = '${CATALOG_FILE_NAME}' and trashed = false`
  );

  const res = await fetch(`${DRIVE_API_URL}/files?q=${query}&fields=files(id,name)&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

/**
 * Reads existing catalog index from Google Drive, and reconciles with actual Drive files.
 */
export async function loadArchiveCatalog(
  accessToken: string,
  folderId: string
): Promise<ArchiveCatalog> {
  // 1. Fetch all physical files in folder
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and name != '${CATALOG_FILE_NAME}' and trashed = false`
  );

  const filesRes = await fetch(
    `${DRIVE_API_URL}/files?q=${query}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,description,properties)&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const driveFiles: any[] = filesRes.ok ? (await filesRes.json()).files || [] : [];

  // 2. Try loading _arsip_catalog.json
  let savedCatalog: ArchiveCatalog | null = null;
  const catalogFileId = await findCatalogFileId(accessToken, folderId);

  if (catalogFileId) {
    try {
      const catRes = await fetch(`${DRIVE_API_URL}/files/${catalogFileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (catRes.ok) {
        savedCatalog = await catRes.json();
      }
    } catch (e) {
      console.warn('Could not parse catalog file:', e);
    }
  }

  const existingDocsMap = new Map<string, ArchiveDocument>();
  if (savedCatalog?.documents) {
    for (const doc of savedCatalog.documents) {
      existingDocsMap.set(doc.driveFileId, doc);
    }
  }

  // 3. Merge drive files with catalog
  const mergedDocuments: ArchiveDocument[] = [];

  for (const file of driveFiles) {
    const existing = existingDocsMap.get(file.id);
    const customProps = file.properties || {};

    if (existing) {
      mergedDocuments.push({
        ...existing,
        fileName: file.name || existing.fileName,
        size: Number(file.size || existing.size || 0),
        mimeType: file.mimeType || existing.mimeType,
        webViewLink: file.webViewLink || existing.webViewLink,
        webContentLink: file.webContentLink || existing.webContentLink,
        thumbnailLink: file.thumbnailLink || existing.thumbnailLink,
        updatedAt: file.modifiedTime || existing.updatedAt,
      });
    } else {
      // Auto-reconstruct from drive metadata
      const cat = (customProps.category as ArchiveCategory) || 'lainnya';
      let tags: string[] = [];
      try {
        tags = customProps.tags ? JSON.parse(customProps.tags) : [];
      } catch {
        tags = customProps.tags ? [customProps.tags] : [];
      }

      mergedDocuments.push({
        id: file.id,
        driveFileId: file.id,
        fileName: file.name,
        title: customProps.title || file.name.replace(/\.[^/.]+$/, ''),
        category: cat,
        tags: tags,
        notes: file.description || customProps.notes || '',
        mimeType: file.mimeType,
        size: Number(file.size || 0),
        documentDate: customProps.documentDate || file.createdTime?.slice(0, 10),
        expiryDate: customProps.expiryDate || undefined,
        isStarred: customProps.isStarred === 'true',
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        thumbnailLink: file.thumbnailLink,
        createdAt: file.createdTime || new Date().toISOString(),
        updatedAt: file.modifiedTime || new Date().toISOString(),
      });
    }
  }

  const catalog: ArchiveCatalog = {
    version: 1,
    lastSync: new Date().toISOString(),
    documents: mergedDocuments,
  };

  return catalog;
}

/**
 * Saves the catalog index file to Google Drive.
 */
export async function saveArchiveCatalog(
  accessToken: string,
  folderId: string,
  catalog: ArchiveCatalog
): Promise<void> {
  const content = JSON.stringify(catalog, null, 2);
  const catalogFileId = await findCatalogFileId(accessToken, folderId);

  if (catalogFileId) {
    // Update existing
    await fetch(`${DRIVE_UPLOAD_URL}/files/${catalogFileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });
  } else {
    // Create new
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: CATALOG_FILE_NAME,
      mimeType: 'application/json',
      parents: [folderId],
      description: 'Katalog metadata arsip digital pribadi',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      closeDelimiter;

    await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });
  }
}

/**
 * Uploads a document file to Google Drive in the archive folder with metadata.
 */
export async function uploadDocumentToDrive(
  accessToken: string,
  folderId: string,
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
  onProgress?: UploadProgressCallback
): Promise<ArchiveDocument> {
  onProgress?.(10, 'Menyiapkan metadata...');

  const boundary = 'foo_bar_baz_' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const driveMetadata = {
    name: file.name,
    parents: [folderId],
    description: meta.notes || '',
    properties: {
      title: meta.title,
      category: meta.category,
      tags: JSON.stringify(meta.tags),
      notes: meta.notes || '',
      documentDate: meta.documentDate || '',
      expiryDate: meta.expiryDate || '',
      isStarred: meta.isStarred ? 'true' : 'false',
    },
  };

  onProgress?.(25, 'Membaca berkas...');
  const fileArrayBuffer = await file.arrayBuffer();

  onProgress?.(45, 'Mengunggah ke Google Drive...');

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(driveMetadata) +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const metadataBytes = new TextEncoder().encode(metadataPart);
  const closeBytes = new TextEncoder().encode(closeDelimiter);

  const combinedBody = new Uint8Array(
    metadataBytes.byteLength + fileArrayBuffer.byteLength + closeBytes.byteLength
  );
  combinedBody.set(metadataBytes, 0);
  combinedBody.set(new Uint8Array(fileArrayBuffer), metadataBytes.byteLength);
  combinedBody.set(closeBytes, metadataBytes.byteLength + fileArrayBuffer.byteLength);

  const uploadRes = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBody,
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mengunggah berkas ke Google Drive (${uploadRes.status})`
    );
  }

  onProgress?.(85, 'Memproses respon Google Drive...');
  const uploaded = await uploadRes.json();

  const newDoc: ArchiveDocument = {
    id: uploaded.id,
    driveFileId: uploaded.id,
    fileName: uploaded.name || file.name,
    title: meta.title || file.name.replace(/\.[^/.]+$/, ''),
    category: meta.category,
    tags: meta.tags,
    notes: meta.notes || '',
    mimeType: uploaded.mimeType || file.type || 'application/octet-stream',
    size: Number(uploaded.size || file.size || 0),
    documentDate: meta.documentDate || new Date().toISOString().slice(0, 10),
    expiryDate: meta.expiryDate,
    isStarred: !!meta.isStarred,
    webViewLink: uploaded.webViewLink,
    webContentLink: uploaded.webContentLink,
    thumbnailLink: uploaded.thumbnailLink,
    createdAt: uploaded.createdTime || new Date().toISOString(),
    updatedAt: uploaded.modifiedTime || new Date().toISOString(),
  };

  onProgress?.(100, 'Selesai!');
  return newDoc;
}

/**
 * Updates metadata of a document on Google Drive and returns updated object.
 */
export async function updateDocumentMetadata(
  accessToken: string,
  doc: ArchiveDocument,
  updates: Partial<ArchiveDocument>
): Promise<ArchiveDocument> {
  const merged = { ...doc, ...updates, updatedAt: new Date().toISOString() };

  const patchBody = {
    description: merged.notes || '',
    properties: {
      title: merged.title,
      category: merged.category,
      tags: JSON.stringify(merged.tags || []),
      notes: merged.notes || '',
      documentDate: merged.documentDate || '',
      expiryDate: merged.expiryDate || '',
      isStarred: merged.isStarred ? 'true' : 'false',
    },
  };

  const res = await fetch(`${DRIVE_API_URL}/files/${doc.driveFileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal memperbarui metadata dokumen di Google Drive');
  }

  return merged;
}

/**
 * Permanently deletes a file from Google Drive (with explicit confirmation needed).
 */
export async function deleteDocumentFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menghapus berkas dari Google Drive (${res.status})`);
  }
}

/**
 * Downloads a file blob securely with bearer token.
 */
export async function fetchFileBlob(
  accessToken: string,
  fileId: string
): Promise<{ blob: Blob; mimeType: string }> {
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh isi berkas (${res.status})`);
  }

  const mimeType = res.headers.get('content-type') || 'application/octet-stream';
  const blob = await res.blob();
  return { blob, mimeType };
}

/**
 * Downloads and triggers browser save dialog.
 */
export async function downloadFileToBrowser(
  accessToken: string,
  fileId: string,
  fileName: string
): Promise<void> {
  const { blob } = await fetchFileBlob(accessToken, fileId);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
