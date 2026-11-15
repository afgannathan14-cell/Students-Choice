import { useRef, useState } from 'react';
import { Eye, FileText, Paperclip, X } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { Course, SubjectFile } from '../types/academic';
import {
  formatFileSize,
  MAX_FILES_PER_SUBJECT,
  MAX_SUBJECT_FILES,
  parseSubjectFile,
} from '../utils/fileStorage';
import { SubjectFileViewerModal } from './SubjectFileViewerModal';

interface SubjectFilesBarProps {
  courses: Course[];
  subjectFiles: SubjectFile[];
  t: Translations;
  compact?: boolean;
  onAddSubjectFiles: (files: SubjectFile[]) => void;
  onRemoveSubjectFile: (fileId: string) => void;
}

export function SubjectFilesBar({
  courses,
  subjectFiles,
  t,
  compact = false,
  onAddSubjectFiles,
  onRemoveSubjectFile,
}: SubjectFilesBarProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'GENERAL');
  const [topicInput, setTopicInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<SubjectFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveCourseId =
    selectedCourseId !== 'GENERAL' && courses.some((c) => c.id === selectedCourseId)
      ? selectedCourseId
      : 'GENERAL';

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    const remainingTotalSlots = MAX_SUBJECT_FILES - subjectFiles.length;
    if (remainingTotalSlots <= 0) {
      setUploadError(t.files.maxFilesReached);
      e.target.value = '';
      return;
    }

    const currentForSubject = subjectFiles.filter((f) => f.courseId === effectiveCourseId).length;
    const remainingSubjectSlots = MAX_FILES_PER_SUBJECT - currentForSubject;
    if (remainingSubjectSlots <= 0) {
      setUploadError(t.files.maxPerSubjectReached);
      e.target.value = '';
      return;
    }

    const allowedSlots = Math.min(remainingTotalSlots, remainingSubjectSlots);
    const chosenCourse = courses.find((c) => c.id === effectiveCourseId) || null;
    const parsed: SubjectFile[] = [];

    for (const file of Array.from(fileList).slice(0, allowedSlots)) {
      try {
        const item = await parseSubjectFile(file, chosenCourse, topicInput);
        parsed.push(item);
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        if (code === 'FILE_TOO_LARGE') {
          setUploadError(t.files.fileTooLarge);
        } else {
          setUploadError(t.files.unsupportedType);
        }
      }
    }

    if (fileList.length > allowedSlots) {
      setUploadError(
        remainingSubjectSlots < remainingTotalSlots
          ? t.files.maxPerSubjectReached
          : t.files.maxFilesReached
      );
    }

    if (parsed.length > 0) {
      onAddSubjectFiles(parsed);
      setTopicInput('');
    }
    e.target.value = '';
  };

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.markdown,.csv,.json,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,text/markdown,text/csv,image/png,image/jpeg,image/webp"
        onChange={(e) => void handleFilesSelected(e)}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {t.files.title}
            </h3>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tabular-nums">
              {subjectFiles.length > 0 ? t.files.activeSummary(subjectFiles.length) : t.files.supportedFormats}
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t.files.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={effectiveCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            aria-label={t.files.subjectSelectLabel}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 max-w-[170px]"
          >
            <option value="GENERAL">{t.files.allSubjects}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder={t.files.topicPlaceholder}
            aria-label={t.files.topicInputLabel}
            maxLength={120}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 w-44 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.files.attachBtn}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {uploadError}
        </p>
      )}

      {subjectFiles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {subjectFiles.map((file) => (
            <div
              key={file.id}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 max-w-full"
            >
              <FileText
                className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setPreviewFile(file)}
                className="text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:text-indigo-700 dark:hover:text-indigo-400 truncate max-w-[180px] text-left"
              >
                {file.name}
              </button>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0">
                {file.courseCode}
                {file.topic ? ` · ${file.topic}` : ''} · {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => setPreviewFile(file)}
                aria-label={`${t.files.openFile}: ${file.name}`}
                className="p-0.5 rounded text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveSubjectFile(file.id)}
                aria-label={`${t.files.removeFile}: ${file.name}`}
                className="p-0.5 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !compact && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{t.files.emptyHint}</p>
        )
      )}

      <SubjectFileViewerModal
        file={previewFile}
        t={t}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
