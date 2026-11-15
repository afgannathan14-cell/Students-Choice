import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, MessageSquare, X } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { SubjectFile } from '../types/academic';
import { formatFileSize, loadSubjectFileBlob } from '../utils/fileStorage';

interface SubjectFileViewerModalProps {
  file: SubjectFile | null;
  t: Translations;
  onClose: () => void;
  onAskAdvisorAbout?: (prompt: string) => void;
}

export function SubjectFileViewerModal({
  file,
  t,
  onClose,
  onAskAdvisorAbout,
}: SubjectFileViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const decodedBytes = useMemo(() => {
    if (!file?.base64Data) return null;
    try {
      const binaryStr = window.atob(file.base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }, [file?.base64Data]);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    let url: string | null = null;

    const resolveUrl = async () => {
      if (decodedBytes) {
        const blob = new Blob([decodedBytes], { type: file.mimeType || 'application/pdf' });
        url = URL.createObjectURL(blob);
      } else {
        const storedBlob = await loadSubjectFileBlob(file.id);
        if (cancelled) return;
        if (storedBlob) {
          url = URL.createObjectURL(storedBlob);
        } else if (typeof file.textContent === 'string') {
          const blob = new Blob([file.textContent], { type: file.mimeType || 'text/plain' });
          url = URL.createObjectURL(blob);
        }
      }
      if (!cancelled) {
        setBlobUrl(url);
      } else if (url) {
        URL.revokeObjectURL(url);
      }
    };

    void resolveUrl();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, decodedBytes]);

  if (!file) return null;

  const isPdf = file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.mimeType.startsWith('image/');
  const topicLabel = file.topic || file.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60">
      <div className="w-full max-w-4xl h-[86vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <FileText
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {file.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums truncate">
                {file.courseCode}
                {file.topic ? ` · ${file.topic}` : ''} · {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAskAdvisorAbout && (
              <button
                type="button"
                onClick={() => {
                  onAskAdvisorAbout(t.files.promptForSubjectFile(file.courseCode, topicLabel));
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors whitespace-nowrap"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.files.askAdvisorFile}</span>
              </button>
            )}

            {blobUrl && (
              <a
                href={blobUrl}
                download={file.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.files.downloadFile}</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-950 overflow-auto p-4">
          {isPdf && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.name}
              className="w-full h-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white"
            />
          ) : isImage && blobUrl ? (
            <div className="h-full flex items-center justify-center">
              <img
                src={blobUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg border border-zinc-200 dark:border-zinc-800"
              />
            </div>
          ) : typeof file.textContent === 'string' ? (
            <pre className="w-full h-full p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-auto leading-relaxed">
              {file.textContent}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
                {t.files.previewUnavailable}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
