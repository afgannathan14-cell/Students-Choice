import { Course, SubjectFile } from '../types/academic';

const DB_NAME = 'students-choice-db';
const DB_VERSION = 2;
const STORE_NAME = 'subjectFiles';
const BLOB_STORE_NAME = 'fileBlobs';
const FALLBACK_KEY = 'meridian.subjectFiles.meta.v1';

export const MAX_SUBJECT_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB per file
export const CLOUD_INLINE_SYNC_LIMIT_BYTES = 500 * 1024; // ~500 KB max for Firestore base64 sync
export const GEMINI_UPLOAD_MAX_BYTES = 50 * 1024 * 1024; // 50 MB max for Gemini Files API PDF indexing
export const MAX_SUBJECT_FILES = 40;
export const MAX_FILES_PER_SUBJECT = 6;

const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown', '.csv', '.json', '.ts', '.js', '.py', '.html', '.xml'];
const BINARY_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

function openFilesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
        db.createObjectStore(BLOB_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

export async function saveSubjectFileBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openFilesDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
      tx.objectStore(BLOB_STORE_NAME).put({ id, blob });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore blob write errors if storage quota is unavailable
  }
}

export async function loadSubjectFileBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openFilesDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE_NAME, 'readonly');
      const req = tx.objectStore(BLOB_STORE_NAME).get(id);
      req.onsuccess = () => {
        const record = req.result as { id: string; blob?: Blob } | undefined;
        resolve(record?.blob || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function loadSubjectFiles(): Promise<SubjectFile[]> {
  try {
    const db = await openFilesDb();
    return await new Promise<SubjectFile[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = Array.isArray(req.result) ? (req.result as SubjectFile[]) : [];
        items.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = window.localStorage.getItem(FALLBACK_KEY);
      return raw ? (JSON.parse(raw) as SubjectFile[]) : [];
    } catch {
      return [];
    }
  }
}

export async function saveSubjectFiles(files: SubjectFile[]): Promise<void> {
  try {
    const db = await openFilesDb();
    const keepIds = new Set(files.map((f) => f.id));
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, BLOB_STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      for (const file of files) {
        store.put(file);
      }

      const blobStore = tx.objectStore(BLOB_STORE_NAME);
      const keysReq = blobStore.getAllKeys();
      keysReq.onsuccess = () => {
        const existingKeys = Array.isArray(keysReq.result) ? keysReq.result : [];
        for (const key of existingKeys) {
          if (typeof key === 'string' && !keepIds.has(key)) {
            blobStore.delete(key);
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      const textOnly = files.map((f) => ({ ...f, base64Data: undefined }));
      window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(textOnly));
    } catch {
      // Ignore storage quota errors in fallback mode
    }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function isTextFile(file: File): boolean {
  if (file.type.startsWith('text/') || file.type === 'application/json') return true;
  const lower = file.name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function resolveMimeType(file: File): string {
  if (file.type === 'image/jpg') return 'image/jpeg';
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'text/markdown';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.json')) return 'application/json';
  return 'text/plain';
}

async function uploadToGeminiFilesApi(file: File, mimeType: string): Promise<string | undefined> {
  if (file.size <= CLOUD_INLINE_SYNC_LIMIT_BYTES || file.size > GEMINI_UPLOAD_MAX_BYTES) {
    return undefined;
  }
  try {
    const res = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        'X-File-Name': encodeURIComponent(file.name),
      },
      body: file,
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { fileUri?: string };
    return typeof data.fileUri === 'string' && data.fileUri ? data.fileUri : undefined;
  } catch {
    return undefined;
  }
}

export async function parseSubjectFile(
  file: File,
  course: Course | null,
  topic?: string
): Promise<SubjectFile> {
  if (file.size > MAX_SUBJECT_FILE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }

  const mimeType = resolveMimeType(file);
  const courseId = course?.id || 'GENERAL';
  const courseCode = course?.code || 'GENERAL';
  const cleanTopic = topic?.trim().slice(0, 160) || undefined;
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (isTextFile(file)) {
    const slice = file.size > 256 * 1024 ? file.slice(0, 256 * 1024) : file;
    const rawText = await slice.text();
    const trimmed = rawText.slice(0, 60000);
    await saveSubjectFileBlob(id, file);
    return {
      id,
      courseId,
      courseCode,
      ...(cleanTopic ? { topic: cleanTopic } : {}),
      name: file.name,
      mimeType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      textContent: trimmed,
    };
  }

  if (BINARY_MIME_TYPES.has(mimeType)) {
    await saveSubjectFileBlob(id, file);

    let base64Data: string | undefined;
    if (file.size <= CLOUD_INLINE_SYNC_LIMIT_BYTES) {
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = String(reader.result || '');
          const commaIdx = res.indexOf(',');
          resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
        };
        reader.onerror = () => reject(new Error('READ_FAILED'));
        reader.readAsDataURL(file);
      });
    }

    const geminiFileUri =
      file.size > CLOUD_INLINE_SYNC_LIMIT_BYTES && file.size <= GEMINI_UPLOAD_MAX_BYTES
        ? await uploadToGeminiFilesApi(file, mimeType)
        : undefined;

    return {
      id,
      courseId,
      courseCode,
      ...(cleanTopic ? { topic: cleanTopic } : {}),
      name: file.name,
      mimeType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      ...(base64Data ? { base64Data } : {}),
      ...(geminiFileUri ? { geminiFileUri } : {}),
    };
  }

  throw new Error('UNSUPPORTED_TYPE');
}

export function serializeSubjectFilesForApi(files: SubjectFile[], maxFiles = 12) {
  return files.slice(0, maxFiles).map((f) => ({
    name: f.name,
    courseCode: f.courseCode,
    topic: f.topic,
    mimeType: f.mimeType,
    size: f.size,
    textContent: f.textContent,
    base64Data: f.base64Data,
    geminiFileUri: f.geminiFileUri,
  }));
}
