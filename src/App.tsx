/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, Menu, Plus, X } from 'lucide-react';
import { AdvisorView } from './components/AdvisorView';
import { CoursesView } from './components/CoursesView';
import {
  AssignmentModal,
  CourseModal,
  ProfileModal,
  StudyGuideDrawer,
} from './components/Modals';
import { OverviewView } from './components/OverviewView';
import { Sidebar } from './components/Sidebar';
import { StudyPlanView } from './components/StudyPlanView';
import {
  INITIAL_COURSES,
  INITIAL_PROFILE,
  INITIAL_RECOMMENDATION_PLAN,
} from './data/initialData';
import { auth, signInWithGoogle, signOutUser } from './firebase';
import {
  getLanguagePromptName,
  LanguageCode,
  TRANSLATIONS,
} from './i18n/translations';
import {
  ActiveTab,
  Assignment,
  ChatMessage,
  Course,
  RecommendationPlan,
  SemesterFilter,
  StudentProfile,
  StudyGuide,
  StudyRecommendation,
  SubjectFile,
} from './types/academic';
import {
  loadSubjectFiles,
  saveSubjectFiles,
  serializeSubjectFilesForApi,
} from './utils/fileStorage';
import {
  deleteCourseFromCloud,
  deleteSubjectFileFromCloud,
  ensureCloudWorkspaceInitialized,
  saveAdvisorChatToCloud,
  saveCourseToCloud,
  saveStudyPlanToCloud,
  saveSubjectFileToCloud,
  saveUserProfileToCloud,
  subscribeToCloudWorkspace,
} from './utils/firestoreSync';
import { buildAcademicContextSummary, getCourseSemester } from './utils/grades';

const STORAGE_KEYS = {
  courses: 'meridian.courses.v2',
  profile: 'meridian.profile.v2',
  plan: 'meridian.plan.v2',
  chat: 'meridian.chat.v2',
  theme: 'meridian.theme.v1',
  language: 'meridian.lang.v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    readStorage<'light' | 'dark'>(STORAGE_KEYS.theme, 'light')
  );
  const [language, setLanguage] = useState<LanguageCode>(() =>
    readStorage<LanguageCode>(STORAGE_KEYS.language, 'en')
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<StudentProfile>(() =>
    readStorage<StudentProfile>(STORAGE_KEYS.profile, INITIAL_PROFILE)
  );
  const [courses, setCourses] = useState<Course[]>(() =>
    readStorage<Course[]>(STORAGE_KEYS.courses, INITIAL_COURSES)
  );
  const [plan, setPlan] = useState<RecommendationPlan>(() =>
    readStorage<RecommendationPlan>(STORAGE_KEYS.plan, INITIAL_RECOMMENDATION_PLAN)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    readStorage<ChatMessage[]>(STORAGE_KEYS.chat, [])
  );
  const [subjectFiles, setSubjectFiles] = useState<SubjectFile[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [selectedSemester, setSelectedSemester] = useState<SemesterFilter>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => courses[0]?.id || '');

  const latestStateRef = useRef({
    profile,
    courses,
    plan,
    chatMessages,
    subjectFiles,
    language,
    theme,
  });
  latestStateRef.current = {
    profile,
    courses,
    plan,
    chatMessages,
    subjectFiles,
    language,
    theme,
  };

  // Gemini generation states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [pendingAdvisorPrompt, setPendingAdvisorPrompt] = useState<string | null>(null);

  // Study guide drawer state
  const [guideTarget, setGuideTarget] = useState<{
    course: Course;
    assignment: Assignment;
  } | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  // Modals
  const [courseModal, setCourseModal] = useState<{ open: boolean; editing: Course | null }>({
    open: false,
    editing: null,
  });
  const [assignmentModal, setAssignmentModal] = useState<{
    open: boolean;
    courseId: string;
    editing: Assignment | null;
  }>({
    open: false,
    courseId: '',
    editing: null,
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const tabTitles: Record<ActiveTab, string> = {
    overview: t.nav.overview,
    courses: t.nav.courses,
    'study-plan': t.nav.studyPlan,
    advisor: t.nav.advisor,
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    let active = true;
    void loadSubjectFiles().then((loaded) => {
      if (active) {
        setSubjectFiles(loaded);
        setFilesLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!filesLoaded) return;
    void saveSubjectFiles(subjectFiles);
  }, [subjectFiles, filesLoaded]);

  useEffect(() => {
    if (!filesLoaded) return;
    let unsubscribeCloud: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeCloud) {
        unsubscribeCloud();
        unsubscribeCloud = null;
      }

      setAuthUser(user);
      setIsAuthReady(true);

      if (!user) return;

      setSyncError(null);
      try {
        await ensureCloudWorkspaceInitialized(user, latestStateRef.current);
        unsubscribeCloud = subscribeToCloudWorkspace(user.uid, {
          onProfileData: ({ profile: cloudProfile, language: cloudLang, theme: cloudTheme }) => {
            setProfile(cloudProfile);
            if (cloudLang) setLanguage(cloudLang);
            if (cloudTheme) setTheme(cloudTheme);
          },
          onCoursesData: (cloudCourses) => {
            setCourses(cloudCourses);
            setSelectedCourseId((prev) =>
              cloudCourses.some((c) => c.id === prev) ? prev : cloudCourses[0]?.id || ''
            );
          },
          onPlanData: (cloudPlan) => {
            setPlan(cloudPlan);
          },
          onChatData: (cloudMessages) => {
            setChatMessages(cloudMessages);
          },
          onSubjectFilesData: (cloudFiles) => {
            setSubjectFiles((localPrev) => {
              const localBinaryMap = new Map(
                localPrev
                  .filter((f) => Boolean(f.base64Data))
                  .map((f) => [f.id, f.base64Data])
              );
              return cloudFiles.map((cf) => ({
                ...cf,
                base64Data: cf.base64Data || localBinaryMap.get(cf.id),
              }));
            });
          },
          onSyncError: (msg) => {
            setSyncError(msg);
          },
        });
      } catch (err) {
        setSyncError(err instanceof Error ? err.message : 'Unable to sync account data.');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCloud) unsubscribeCloud();
    };
  }, [filesLoaded]);

  const handleSignIn = async () => {
    if (isAuthBusy) return;
    setIsAuthBusy(true);
    setSyncError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setSyncError(err instanceof Error ? err.message : 'Google Sign-In failed.');
      }
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (isAuthBusy) return;
    setIsAuthBusy(true);
    setSyncError(null);
    try {
      await signOutUser();
      setProfile(INITIAL_PROFILE);
      setCourses(INITIAL_COURSES);
      setPlan(INITIAL_RECOMMENDATION_PLAN);
      setChatMessages([]);
      setSubjectFiles([]);
      setSelectedCourseId(INITIAL_COURSES[0]?.id || '');
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sign-out failed.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleAddSubjectFiles = (newFiles: SubjectFile[]) => {
    setSubjectFiles((prev) => [...prev, ...newFiles]);
    if (authUser) {
      for (const file of newFiles) {
        void saveSubjectFileToCloud(authUser.uid, file).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to save file.');
        });
      }
    }
  };

  const handleRemoveSubjectFile = (fileId: string) => {
    setSubjectFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (authUser) {
      void deleteSubjectFileFromCloud(authUser.uid, fileId).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to remove file.');
      });
    }
  };

  const handleGenerateRecommendations = async () => {
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const academicSummary = buildAcademicContextSummary(courses, profile.term, profile.targetGpa);
      const response = await fetch('/api/advisor/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicSummary,
          studentName: profile.name,
          major: profile.major,
          language: getLanguagePromptName(language),
          subjectFiles: serializeSubjectFilesForApi(subjectFiles),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      const recs: StudyRecommendation[] = (data.recommendations || []).map(
        (item: Omit<StudyRecommendation, 'id' | 'completed'>, idx: number) => ({
          ...item,
          id: `gemini-rec-${Date.now()}-${idx}`,
          priority:
            item.priority === 'High' || item.priority === 'Medium' || item.priority === 'Maintain'
              ? item.priority
              : 'Medium',
          completed: false,
        })
      );

      const nextPlan: RecommendationPlan = {
        diagnosis: data.diagnosis,
        generatedAt: data.generatedAt || new Date().toISOString(),
        recommendations: recs,
      };
      setPlan(nextPlan);
      if (authUser) {
        void saveStudyPlanToCloud(authUser.uid, nextPlan).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to save study plan.');
        });
      }
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Unable to generate recommendations.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const fetchStudyGuide = async (course: Course, assignment: Assignment) => {
    setGuideTarget({ course, assignment });
    setStudyGuide(null);
    setGuideError(null);
    setGuideLoading(true);

    try {
      const pct = assignment.maxScore > 0 ? Math.round((assignment.score / assignment.maxScore) * 100) : 0;
      const topicLower = (assignment.topic || '').trim().toLowerCase();
      const matchingFiles = subjectFiles
        .filter((f) => f.courseId === course.id || f.courseId === 'GENERAL')
        .sort((a, b) => {
          const aScore =
            (a.courseId === course.id ? 2 : 0) +
            (topicLower && (a.topic || '').toLowerCase().includes(topicLower) ? 1 : 0);
          const bScore =
            (b.courseId === course.id ? 2 : 0) +
            (topicLower && (b.topic || '').toLowerCase().includes(topicLower) ? 1 : 0);
          return bScore - aScore;
        });
      const response = await fetch('/api/advisor/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: course.code,
          courseName: course.name,
          assignmentTitle: assignment.title,
          topic: assignment.topic,
          scorePercentage: pct,
          language: getLanguagePromptName(language),
          subjectFiles: serializeSubjectFilesForApi(matchingFiles, 8),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      setStudyGuide(data as StudyGuide);
    } catch (err) {
      setGuideError(err instanceof Error ? err.message : 'Unable to load concept review.');
    } finally {
      setGuideLoading(false);
    }
  };

  const handleSaveCourse = (
    data: Omit<Course, 'id' | 'assignments'>,
    existingId?: string
  ) => {
    const savedSemester = getCourseSemester({ semester: data.semester });
    if (selectedSemester !== 'ALL' && savedSemester !== selectedSemester) {
      setSelectedSemester(savedSemester);
    }

    if (existingId) {
      const existing = courses.find((c) => c.id === existingId);
      const updatedCourse: Course | null = existing ? { ...existing, ...data } : null;
      setCourses((prev) =>
        prev.map((c) => (c.id === existingId ? { ...c, ...data } : c))
      );
      if (authUser && updatedCourse) {
        void saveCourseToCloud(authUser.uid, updatedCourse).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to save course.');
        });
      }
    } else {
      const newCourse: Course = {
        ...data,
        id: `course-${Date.now()}`,
        assignments: [],
      };
      setCourses((prev) => [...prev, newCourse]);
      setSelectedCourseId(newCourse.id);
      if (authUser) {
        void saveCourseToCloud(authUser.uid, newCourse).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to save course.');
        });
      }
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const removedFileIds = subjectFiles
      .filter((f) => f.courseId === courseId)
      .map((f) => f.id);

    setCourses((prev) => {
      const next = prev.filter((c) => c.id !== courseId);
      if (selectedCourseId === courseId) {
        setSelectedCourseId(next[0]?.id || '');
      }
      return next;
    });
    if (removedFileIds.length > 0) {
      setSubjectFiles((prev) => prev.filter((f) => f.courseId !== courseId));
    }
    if (authUser) {
      void deleteCourseFromCloud(authUser.uid, courseId).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to delete course.');
      });
      for (const fileId of removedFileIds) {
        void deleteSubjectFileFromCloud(authUser.uid, fileId).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to delete subject file.');
        });
      }
    }
  };

  const handleSaveAssignment = (
    courseId: string,
    data: Omit<Assignment, 'id'>,
    existingId?: string
  ) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const updatedCourse: Course | null = targetCourse
      ? {
          ...targetCourse,
          assignments: existingId
            ? targetCourse.assignments.map((a) =>
                a.id === existingId ? { ...a, ...data } : a
              )
            : [...targetCourse.assignments, { ...data, id: `asgn-${Date.now()}` }],
        }
      : null;

    if (updatedCourse) {
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? updatedCourse : course))
      );
      setSelectedCourseId(courseId);
      if (authUser) {
        void saveCourseToCloud(authUser.uid, updatedCourse).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to save assignment.');
        });
      }
    }
  };

  const handleDeleteAssignment = (courseId: string, assignmentId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const updatedCourse: Course | null = targetCourse
      ? {
          ...targetCourse,
          assignments: targetCourse.assignments.filter((a) => a.id !== assignmentId),
        }
      : null;

    if (updatedCourse) {
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? updatedCourse : course))
      );
      if (authUser) {
        void saveCourseToCloud(authUser.uid, updatedCourse).catch((err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to delete assignment.');
        });
      }
    }
  };

  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    if (authUser) {
      void saveUserProfileToCloud(
        authUser.uid,
        authUser.email,
        updatedProfile,
        language,
        theme
      ).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to save profile.');
      });
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (authUser) {
      void saveUserProfileToCloud(
        authUser.uid,
        authUser.email,
        profile,
        language,
        nextTheme
      ).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to save theme.');
      });
    }
  };

  const handleChangeLanguage = (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    if (authUser) {
      void saveUserProfileToCloud(
        authUser.uid,
        authUser.email,
        profile,
        nextLang,
        theme
      ).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to save language.');
      });
    }
  };

  const handleResetSampleData = () => {
    const prevCourseIds = courses.map((c) => c.id);
    setProfile(INITIAL_PROFILE);
    setCourses(INITIAL_COURSES);
    setPlan(INITIAL_RECOMMENDATION_PLAN);
    setChatMessages([]);
    setSelectedCourseId(INITIAL_COURSES[0]?.id || '');

    if (authUser) {
      void Promise.all([
        saveUserProfileToCloud(authUser.uid, authUser.email, INITIAL_PROFILE, language, theme),
        ...prevCourseIds.map((id) => deleteCourseFromCloud(authUser.uid, id)),
        ...INITIAL_COURSES.map((c) => saveCourseToCloud(authUser.uid, c)),
        saveStudyPlanToCloud(authUser.uid, INITIAL_RECOMMENDATION_PLAN),
        saveAdvisorChatToCloud(authUser.uid, []),
      ]).catch((err) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to restore sample data.');
      });
    }
  };

  const handleClearAllCourses = () => {
    const prevCourseIds = courses.map((c) => c.id);
    setCourses([]);
    setSelectedCourseId('');
    if (authUser) {
      void Promise.all(prevCourseIds.map((id) => deleteCourseFromCloud(authUser.uid, id))).catch(
        (err) => {
          setSyncError(err instanceof Error ? err.message : 'Failed to clear courses.');
        }
      );
    }
  };

  const pendingTasks = plan.recommendations.filter((r) => !r.completed).length;
  const semesterScopedCourses =
    selectedSemester === 'ALL'
      ? courses
      : courses.filter((c) => getCourseSemester(c) === selectedSemester);
  const preferredCourseId =
    semesterScopedCourses.find((c) => c.id === selectedCourseId)?.id ||
    semesterScopedCourses[0]?.id ||
    selectedCourseId ||
    courses[0]?.id ||
    '';

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        authUser={authUser ? { uid: authUser.uid, email: authUser.email } : null}
        isAuthBusy={isAuthBusy}
        onSignIn={() => void handleSignIn()}
        onSignOut={() => void handleSignOut()}
        onEditProfile={() => setProfileModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        t={t}
        pendingTaskCount={pendingTasks}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Minimalist Contextual Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label={t.header.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline whitespace-nowrap">
                {profile.term}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
              <h1 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {tabTitles[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAuthReady && !authUser && (
              <button
                type="button"
                onClick={() => void handleSignIn()}
                disabled={isAuthBusy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>{isAuthBusy ? t.auth.signingIn : t.auth.signIn}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setAssignmentModal({
                  open: true,
                  courseId: preferredCourseId,
                  editing: null,
                })
              }
              disabled={courses.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.header.addGrade}</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {syncError && (
            <div
              role="alert"
              className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300"
            >
              <span>
                <strong className="font-semibold">{t.auth.syncErrorTitle}:</strong> {syncError}
              </span>
              <button
                type="button"
                onClick={() => setSyncError(null)}
                aria-label="Dismiss error"
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {activeTab === 'overview' && (
            <OverviewView
              profile={profile}
              courses={courses}
              selectedSemester={selectedSemester}
              plan={plan}
              isGeneratingPlan={isGeneratingPlan}
              planError={planError}
              t={t}
              onSelectSemester={setSelectedSemester}
              onRefreshPlan={() => void handleGenerateRecommendations()}
              onNavigate={setActiveTab}
              onSelectCourse={(id) => setSelectedCourseId(id)}
              onQuickAddGrade={() =>
                setAssignmentModal({
                  open: true,
                  courseId: preferredCourseId,
                  editing: null,
                })
              }
              onAddCourse={() => setCourseModal({ open: true, editing: null })}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesView
              courses={courses}
              subjectFiles={subjectFiles}
              selectedCourseId={selectedCourseId}
              selectedSemester={selectedSemester}
              t={t}
              onSelectSemester={setSelectedSemester}
              onSelectCourse={setSelectedCourseId}
              onAddCourse={() => setCourseModal({ open: true, editing: null })}
              onEditCourse={(c) => setCourseModal({ open: true, editing: c })}
              onDeleteCourse={handleDeleteCourse}
              onClearAllCourses={handleClearAllCourses}
              onAddAssignment={(courseId) =>
                setAssignmentModal({ open: true, courseId, editing: null })
              }
              onEditAssignment={(courseId, a) =>
                setAssignmentModal({ open: true, courseId, editing: a })
              }
              onDeleteAssignment={handleDeleteAssignment}
              onOpenStudyGuide={(course, assignment) => void fetchStudyGuide(course, assignment)}
              onAddSubjectFiles={handleAddSubjectFiles}
              onRemoveSubjectFile={handleRemoveSubjectFile}
              onAskAdvisorAbout={(prompt) => {
                setPendingAdvisorPrompt(prompt);
                setActiveTab('advisor');
              }}
            />
          )}

          {activeTab === 'study-plan' && (
            <StudyPlanView
              plan={plan}
              courses={courses}
              subjectFiles={subjectFiles}
              isGenerating={isGeneratingPlan}
              error={planError}
              t={t}
              onGeneratePlan={() => void handleGenerateRecommendations()}
              onToggleComplete={(recId) => {
                const nextPlan: RecommendationPlan = {
                  ...plan,
                  recommendations: plan.recommendations.map((r) =>
                    r.id === recId ? { ...r, completed: !r.completed } : r
                  ),
                };
                setPlan(nextPlan);
                if (authUser) {
                  void saveStudyPlanToCloud(authUser.uid, nextPlan).catch((err) => {
                    setSyncError(err instanceof Error ? err.message : 'Failed to save study plan.');
                  });
                }
              }}
              onDeleteRecommendation={(recId) => {
                const nextPlan: RecommendationPlan = {
                  ...plan,
                  recommendations: plan.recommendations.filter((r) => r.id !== recId),
                };
                setPlan(nextPlan);
                if (authUser) {
                  void saveStudyPlanToCloud(authUser.uid, nextPlan).catch((err) => {
                    setSyncError(err instanceof Error ? err.message : 'Failed to save study plan.');
                  });
                }
              }}
              onAddCustomTask={(task) => {
                const nextPlan: RecommendationPlan = {
                  ...plan,
                  recommendations: [
                    {
                      ...task,
                      id: `custom-${Date.now()}`,
                      completed: false,
                    },
                    ...plan.recommendations,
                  ],
                };
                setPlan(nextPlan);
                if (authUser) {
                  void saveStudyPlanToCloud(authUser.uid, nextPlan).catch((err) => {
                    setSyncError(err instanceof Error ? err.message : 'Failed to save study plan.');
                  });
                }
              }}
              onAskAdvisorAbout={(prompt) => {
                setPendingAdvisorPrompt(prompt);
                setActiveTab('advisor');
              }}
              onAddSubjectFiles={handleAddSubjectFiles}
              onRemoveSubjectFile={handleRemoveSubjectFile}
            />
          )}

          {activeTab === 'advisor' && (
            <AdvisorView
              profile={profile}
              courses={courses}
              subjectFiles={subjectFiles}
              messages={chatMessages}
              language={language}
              t={t}
              onUpdateMessages={setChatMessages}
              pendingPrompt={pendingAdvisorPrompt}
              onConsumePendingPrompt={() => setPendingAdvisorPrompt(null)}
              onAddSubjectFiles={handleAddSubjectFiles}
              onRemoveSubjectFile={handleRemoveSubjectFile}
              onCommitMessages={(finalMessages) => {
                if (authUser) {
                  void saveAdvisorChatToCloud(authUser.uid, finalMessages).catch((err) => {
                    setSyncError(err instanceof Error ? err.message : 'Failed to save chat history.');
                  });
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      {courseModal.open && (
        <CourseModal
          course={courseModal.editing}
          defaultSemester={selectedSemester === 'ALL' ? 1 : selectedSemester}
          t={t}
          onClose={() => setCourseModal({ open: false, editing: null })}
          onSave={handleSaveCourse}
        />
      )}

      {assignmentModal.open && (
        <AssignmentModal
          courses={courses}
          initialCourseId={assignmentModal.courseId}
          assignment={assignmentModal.editing}
          t={t}
          onClose={() => setAssignmentModal({ open: false, courseId: '', editing: null })}
          onSave={handleSaveAssignment}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          profile={profile}
          authUser={authUser ? { uid: authUser.uid, email: authUser.email } : null}
          isAuthBusy={isAuthBusy}
          t={t}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
          onSignIn={() => void handleSignIn()}
          onSignOut={() => void handleSignOut()}
          onResetSampleData={handleResetSampleData}
          onClearAllCourses={handleClearAllCourses}
        />
      )}

      {guideTarget && (
        <StudyGuideDrawer
          guide={studyGuide}
          loading={guideLoading}
          error={guideError}
          contextTitle={`${guideTarget.course.code}: ${guideTarget.assignment.title}`}
          t={t}
          onClose={() => setGuideTarget(null)}
          onRetry={() => void fetchStudyGuide(guideTarget.course, guideTarget.assignment)}
        />
      )}
    </div>
  );
}
