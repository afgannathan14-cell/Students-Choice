import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { getLanguagePromptName, LanguageCode, Translations } from '../i18n/translations';
import { ChatMessage, Course, StudentProfile, SubjectFile } from '../types/academic';
import { serializeSubjectFilesForApi } from '../utils/fileStorage';
import { buildAcademicContextSummary, calculateCourseStats } from '../utils/grades';
import { SubjectFilesBar } from './SubjectFilesBar';

interface AdvisorViewProps {
  profile: StudentProfile;
  courses: Course[];
  subjectFiles: SubjectFile[];
  messages: ChatMessage[];
  language: LanguageCode;
  t: Translations;
  onUpdateMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  pendingPrompt: string | null;
  onConsumePendingPrompt: () => void;
  onAddSubjectFiles: (files: SubjectFile[]) => void;
  onRemoveSubjectFile: (fileId: string) => void;
  onCommitMessages: (messages: ChatMessage[]) => void;
}

function FormattedResponse({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        const renderInline = (text: string) => {
          const parts = text.split(/(\*\*[^*]+\*\*)/g);
          return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={idx}>{part}</span>;
          });
        };

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2.5 pl-1">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5 select-none">•</span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)$/);
          if (match) {
            return (
              <div key={i} className="flex items-start gap-2.5 pl-1">
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 shrink-0">
                  {match[1]}
                </span>
                <span>{renderInline(match[2])}</span>
              </div>
            );
          }
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="font-display font-semibold text-zinc-900 dark:text-zinc-50 pt-1">
              {trimmed.slice(4)}
            </h4>
          );
        }

        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

export function AdvisorView({
  profile,
  courses,
  subjectFiles,
  messages,
  language,
  t,
  onUpdateMessages,
  pendingPrompt,
  onConsumePendingPrompt,
  onAddSubjectFiles,
  onRemoveSubjectFile,
  onCommitMessages,
}: AdvisorViewProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = useMemo(() => {
    const withStats = courses
      .map((c) => ({ course: c, stats: calculateCourseStats(c) }))
      .sort((a, b) => (a.stats.targetDelta ?? 0) - (b.stats.targetDelta ?? 0));

    const lowest = withStats[0];
    const second = withStats[1];
    const prompts: string[] = [];

    if (lowest && lowest.stats.currentPercentage !== null) {
      prompts.push(t.advisor.promptTargetMath(lowest.course.code, lowest.course.targetGrade));
      const weakestAssignment = [...lowest.course.assignments].sort(
        (a, b) => a.score / Math.max(1, a.maxScore) - b.score / Math.max(1, b.maxScore)
      )[0];
      if (weakestAssignment) {
        prompts.push(
          t.advisor.promptQuizMe(
            weakestAssignment.topic || weakestAssignment.title,
            lowest.course.code
          )
        );
      }
    }
    if (second) {
      prompts.push(
        t.advisor.promptSchedule(lowest?.course.code || 'Priority 1', second.course.code)
      );
    }
    if (subjectFiles.length > 0) {
      prompts.unshift(t.files.promptFromFiles);
    }
    if (prompts.length === 0) {
      prompts.push(t.advisor.promptDefault);
    }
    return prompts;
  }, [courses, subjectFiles.length, t]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const modelMsgId = `model-${Date.now()}`;
    const placeholderModelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages(() => [...nextHistory, placeholderModelMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const academicSummary = buildAcademicContextSummary(courses, profile.term, profile.targetGpa);
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          academicSummary,
          studentName: profile.name,
          language: getLanguagePromptName(language),
          subjectFiles: serializeSubjectFilesForApi(subjectFiles),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to reach advisor.' }));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming response unavailable.');

      const decoder = new TextDecoder();
      let buffer = '';

      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith('data:')) continue;
          const payloadStr = line.slice(5).trim();
          if (!payloadStr) continue;
          const payload = JSON.parse(payloadStr) as { text?: string; error?: string; done?: boolean };

          if (payload.error) {
            throw new Error(payload.error);
          }

          if (payload.text) {
            accumulatedText += payload.text;
            onUpdateMessages((prev) =>
              prev.map((m) =>
                m.id === modelMsgId ? { ...m, content: m.content + payload.text } : m
              )
            );
          }
        }
      }

      if (accumulatedText) {
        onCommitMessages([
          ...nextHistory,
          { ...placeholderModelMsg, content: accumulatedText },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to complete response.';
      setError(msg);
      onUpdateMessages((prev) => prev.filter((m) => m.id !== modelMsgId || m.content.length > 0));
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt && !isStreaming) {
      const prompt = pendingPrompt;
      onConsumePendingPrompt();
      void sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col h-[calc(100vh-11rem)] min-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div>
          <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {t.advisor.title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t.advisor.subtitlePrefix} ({courses.length} · {profile.targetGpa.toFixed(2)})
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onUpdateMessages(() => []);
              onCommitMessages([]);
              setError(null);
            }}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.advisor.newThread}</span>
          </button>
        )}
      </div>

      {/* Subject Materials Context Bar */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 shrink-0">
        <SubjectFilesBar
          courses={courses}
          subjectFiles={subjectFiles}
          t={t}
          compact
          onAddSubjectFiles={onAddSubjectFiles}
          onRemoveSubjectFile={onRemoveSubjectFile}
        />
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto pt-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {t.advisor.emptyTitle}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t.advisor.emptyDesc}
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t.advisor.suggestedPrompts}
              </p>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="w-full text-left px-4 py-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-xl px-4 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-200">
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">
                      {t.advisor.advisorLabel}
                    </p>
                    {msg.content ? (
                      <FormattedResponse content={msg.content} />
                    ) : (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{t.advisor.thinking}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mx-6 mb-3 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.advisor.inputPlaceholder}
            disabled={isStreaming}
            aria-label={t.advisor.title}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-40 transition-colors shrink-0"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
