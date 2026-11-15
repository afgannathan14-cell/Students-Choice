import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { LanguageCode } from '../i18n/translations';
import {
  ChatMessage,
  Course,
  LetterGrade,
  RecommendationPlan,
  StudentProfile,
  SubjectFile,
} from '../types/academic';
import { getCourseSemester, getDefaultPassingScore } from './grades';

const VALID_GRADES = new Set<LetterGrade>(['A', 'AB', 'B', 'BC', 'C', 'D', 'E']);

export function sanitizeFirestoreId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned || `item-${Date.now()}`;
}

function buildProfilePayload(
  uid: string,
  email: string | null | undefined,
  profile: StudentProfile,
  language: LanguageCode,
  theme: 'light' | 'dark'
) {
  return {
    uid,
    ...(email ? { email: email.slice(0, 254) } : {}),
    name: (profile.name || 'Student').trim().slice(0, 120) || 'Student',
    major: (profile.major || '').trim().slice(0, 120),
    term: (profile.term || '').trim().slice(0, 80),
    targetGpa: Math.max(0, Math.min(4.0, Number(profile.targetGpa) || 0)),
    avatarUrl: (profile.avatarUrl || '').slice(0, 350000),
    language,
    theme,
    updatedAt: serverTimestamp(),
  };
}

function buildCoursePayload(uid: string, course: Course) {
  const passingGrade: LetterGrade =
    course.passingGrade && VALID_GRADES.has(course.passingGrade)
      ? course.passingGrade
      : 'C';
  const passingScore =
    typeof course.passingScore === 'number'
      ? Math.max(0, Math.min(100, course.passingScore))
      : getDefaultPassingScore(passingGrade);

  return {
    ownerId: uid,
    code: (course.code || 'COURSE').trim().slice(0, 32) || 'COURSE',
    name: (course.name || 'Untitled Course').trim().slice(0, 160) || 'Untitled Course',
    instructor: (course.instructor || '').trim().slice(0, 120),
    credits: Math.max(1, Math.min(12, Math.round(Number(course.credits) || 3))),
    targetGrade: Math.max(0, Math.min(100, Number(course.targetGrade) || 85)),
    passingGrade,
    passingScore,
    semester: getCourseSemester(course),
    assignments: Array.isArray(course.assignments) ? course.assignments.slice(0, 60) : [],
    updatedAt: serverTimestamp(),
  };
}

function buildStudyPlanPayload(uid: string, plan: RecommendationPlan) {
  return {
    ownerId: uid,
    diagnosis: (plan.diagnosis || '').slice(0, 3000),
    generatedAt: (plan.generatedAt || new Date().toISOString()).slice(0, 64),
    recommendations: Array.isArray(plan.recommendations)
      ? plan.recommendations.slice(0, 30)
      : [],
    updatedAt: serverTimestamp(),
  };
}

function buildAdvisorChatPayload(uid: string, messages: ChatMessage[]) {
  return {
    ownerId: uid,
    messages: Array.isArray(messages) ? messages.slice(-100) : [],
    updatedAt: serverTimestamp(),
  };
}

function buildSubjectFilePayload(uid: string, file: SubjectFile) {
  const payload: Record<string, unknown> = {
    ownerId: uid,
    courseId: (file.courseId || 'GENERAL').slice(0, 128),
    courseCode: (file.courseCode || 'GENERAL').slice(0, 32),
    name: (file.name || 'document').slice(0, 255),
    mimeType: (file.mimeType || 'text/plain').slice(0, 100),
    size: Math.max(0, Math.min(1073741824, Number(file.size) || 0)),
    uploadedAt: (file.uploadedAt || new Date().toISOString()).slice(0, 64),
    updatedAt: serverTimestamp(),
  };

  if (typeof file.topic === 'string' && file.topic.trim().length > 0) {
    payload.topic = file.topic.trim().slice(0, 160);
  }
  if (typeof file.textContent === 'string' && file.textContent.length > 0) {
    payload.textContent = file.textContent.slice(0, 120000);
  }
  if (typeof file.base64Data === 'string' && file.base64Data.length > 0 && file.base64Data.length <= 750000) {
    payload.base64Data = file.base64Data;
  }

  return payload;
}

export async function saveUserProfileToCloud(
  uid: string,
  email: string | null | undefined,
  profile: StudentProfile,
  language: LanguageCode,
  theme: 'light' | 'dark'
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), buildProfilePayload(uid, email, profile, language, theme));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCourseToCloud(uid: string, course: Course): Promise<void> {
  const safeId = sanitizeFirestoreId(course.id);
  const path = `users/${uid}/courses/${safeId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'courses', safeId), buildCoursePayload(uid, course));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCourseFromCloud(uid: string, courseId: string): Promise<void> {
  const safeId = sanitizeFirestoreId(courseId);
  const path = `users/${uid}/courses/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'courses', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStudyPlanToCloud(uid: string, plan: RecommendationPlan): Promise<void> {
  const path = `users/${uid}/studyPlan/current`;
  try {
    await setDoc(doc(db, 'users', uid, 'studyPlan', 'current'), buildStudyPlanPayload(uid, plan));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveAdvisorChatToCloud(uid: string, messages: ChatMessage[]): Promise<void> {
  const path = `users/${uid}/advisorChat/current`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'advisorChat', 'current'),
      buildAdvisorChatPayload(uid, messages)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSubjectFileToCloud(uid: string, file: SubjectFile): Promise<void> {
  const safeId = sanitizeFirestoreId(file.id);
  const path = `users/${uid}/subjectFiles/${safeId}`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'subjectFiles', safeId),
      buildSubjectFilePayload(uid, file)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSubjectFileFromCloud(uid: string, fileId: string): Promise<void> {
  const safeId = sanitizeFirestoreId(fileId);
  const path = `users/${uid}/subjectFiles/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'subjectFiles', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface LocalWorkspaceSnapshot {
  profile: StudentProfile;
  courses: Course[];
  plan: RecommendationPlan;
  chatMessages: ChatMessage[];
  subjectFiles: SubjectFile[];
  language: LanguageCode;
  theme: 'light' | 'dark';
}

export async function ensureCloudWorkspaceInitialized(
  user: User,
  localSnapshot: LocalWorkspaceSnapshot
): Promise<'migrated' | 'existing'> {
  const userDocPath = `users/${user.uid}`;
  let existingProfileSnap;
  try {
    existingProfileSnap = await getDoc(doc(db, 'users', user.uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  if (existingProfileSnap.exists()) {
    return 'existing';
  }

  const resolvedProfile: StudentProfile = {
    ...localSnapshot.profile,
    name:
      localSnapshot.profile.name === 'Alya Pratama' && user.displayName
        ? user.displayName
        : localSnapshot.profile.name,
    avatarUrl:
      user.photoURL && localSnapshot.profile.avatarUrl.startsWith('/src/')
        ? user.photoURL
        : localSnapshot.profile.avatarUrl || user.photoURL || '',
  };

  await saveUserProfileToCloud(
    user.uid,
    user.email,
    resolvedProfile,
    localSnapshot.language,
    localSnapshot.theme
  );

  await Promise.all([
    ...localSnapshot.courses.map((course) => saveCourseToCloud(user.uid, course)),
    saveStudyPlanToCloud(user.uid, localSnapshot.plan),
    saveAdvisorChatToCloud(user.uid, localSnapshot.chatMessages),
    ...localSnapshot.subjectFiles.map((file) => saveSubjectFileToCloud(user.uid, file)),
  ]);

  return 'migrated';
}

export interface CloudWorkspaceCallbacks {
  onProfileData: (data: {
    profile: StudentProfile;
    language?: LanguageCode;
    theme?: 'light' | 'dark';
  }) => void;
  onCoursesData: (courses: Course[]) => void;
  onPlanData: (plan: RecommendationPlan) => void;
  onChatData: (messages: ChatMessage[]) => void;
  onSubjectFilesData: (files: SubjectFile[]) => void;
  onSyncError: (message: string) => void;
}

export function subscribeToCloudWorkspace(
  uid: string,
  callbacks: CloudWorkspaceCallbacks
): () => void {
  const unsubscribers: Unsubscribe[] = [];

  const profilePath = `users/${uid}`;
  unsubscribers.push(
    onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        callbacks.onProfileData({
          profile: {
            name: typeof data.name === 'string' ? data.name : 'Student',
            major: typeof data.major === 'string' ? data.major : '',
            term: typeof data.term === 'string' ? data.term : '',
            targetGpa: typeof data.targetGpa === 'number' ? data.targetGpa : 3.7,
            avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          },
          language: data.language as LanguageCode | undefined,
          theme: data.theme as 'light' | 'dark' | undefined,
        });
      },
      (error) => {
        callbacks.onSyncError(error.message);
        handleFirestoreError(error, OperationType.GET, profilePath);
      }
    )
  );

  const coursesPath = `users/${uid}/courses`;
  const coursesQuery = query(collection(db, 'users', uid, 'courses'), where('ownerId', '==', uid));
  unsubscribers.push(
    onSnapshot(
      coursesQuery,
      (snapshot) => {
        const items: Course[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            code: String(data.code || ''),
            name: String(data.name || ''),
            instructor: String(data.instructor || ''),
            credits: Number(data.credits || 3),
            targetGrade: Number(data.targetGrade || 85),
            passingGrade: data.passingGrade as LetterGrade | undefined,
            passingScore:
              typeof data.passingScore === 'number' ? data.passingScore : undefined,
            semester: typeof data.semester === 'number' ? data.semester : 1,
            assignments: Array.isArray(data.assignments) ? data.assignments : [],
          };
        });
        items.sort((a, b) => getCourseSemester(a) - getCourseSemester(b) || a.code.localeCompare(b.code));
        callbacks.onCoursesData(items);
      },
      (error) => {
        callbacks.onSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, coursesPath);
      }
    )
  );

  const planPath = `users/${uid}/studyPlan/current`;
  unsubscribers.push(
    onSnapshot(
      doc(db, 'users', uid, 'studyPlan', 'current'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        callbacks.onPlanData({
          diagnosis: String(data.diagnosis || ''),
          generatedAt: String(data.generatedAt || new Date().toISOString()),
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        });
      },
      (error) => {
        callbacks.onSyncError(error.message);
        handleFirestoreError(error, OperationType.GET, planPath);
      }
    )
  );

  const chatPath = `users/${uid}/advisorChat/current`;
  unsubscribers.push(
    onSnapshot(
      doc(db, 'users', uid, 'advisorChat', 'current'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        callbacks.onChatData(Array.isArray(data.messages) ? data.messages : []);
      },
      (error) => {
        callbacks.onSyncError(error.message);
        handleFirestoreError(error, OperationType.GET, chatPath);
      }
    )
  );

  const filesPath = `users/${uid}/subjectFiles`;
  const filesQuery = query(
    collection(db, 'users', uid, 'subjectFiles'),
    where('ownerId', '==', uid)
  );
  unsubscribers.push(
    onSnapshot(
      filesQuery,
      (snapshot) => {
        const items: SubjectFile[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            courseId: String(data.courseId || 'GENERAL'),
            courseCode: String(data.courseCode || 'GENERAL'),
            topic: typeof data.topic === 'string' ? data.topic : undefined,
            name: String(data.name || ''),
            mimeType: String(data.mimeType || 'text/plain'),
            size: Number(data.size || 0),
            uploadedAt: String(data.uploadedAt || ''),
            textContent:
              typeof data.textContent === 'string' ? data.textContent : undefined,
            base64Data:
              typeof data.base64Data === 'string' ? data.base64Data : undefined,
          };
        });
        items.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
        callbacks.onSubjectFilesData(items);
      },
      (error) => {
        callbacks.onSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, filesPath);
      }
    )
  );

  return () => {
    for (const unsub of unsubscribers) {
      unsub();
    }
  };
}
