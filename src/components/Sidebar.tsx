import { useEffect, useState } from 'react';
import {
  BookOpen,
  Cloud,
  Compass,
  Globe,
  LayoutGrid,
  ListChecks,
  LogIn,
  LogOut,
  MessageSquare,
  Moon,
  Settings2,
  Sun,
  X,
} from 'lucide-react';
import { LANGUAGES, LanguageCode, Translations } from '../i18n/translations';
import { ActiveTab, StudentProfile } from '../types/academic';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  authUser: { uid: string; email: string | null } | null;
  isAuthBusy: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onEditProfile: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  t: Translations;
  pendingTaskCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  profile,
  authUser,
  isAuthBusy,
  onSignIn,
  onSignOut,
  onEditProfile,
  theme,
  onToggleTheme,
  language,
  onChangeLanguage,
  t,
  pendingTaskCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profile.avatarUrl]);

  const navItems: Array<{ id: ActiveTab; label: string; icon: typeof LayoutGrid }> = [
    { id: 'overview', label: t.nav.overview, icon: LayoutGrid },
    { id: 'courses', label: t.nav.courses, icon: BookOpen },
    { id: 'study-plan', label: t.nav.studyPlan, icon: ListChecks },
    { id: 'advisor', label: t.nav.advisor, icon: MessageSquare },
  ];

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 px-4 py-6">
      <div>
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-indigo-700 dark:text-indigo-400 shrink-0" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
              Students Choice
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label={t.header.closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'study-plan' && pendingTaskCount > 0 && (
                  <span className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                    {pendingTaskCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-5 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2 px-2">
          <label
            htmlFor="meridian-lang-select"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.nav.language}</span>
          </label>
          <select
            id="meridian-lang-select"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
            aria-label={t.nav.language}
            className="max-w-[132px] px-2 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.nav.appearance}</span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.nav.dark}</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.nav.light}</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 space-y-2">
          {authUser ? (
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{t.auth.syncedLabel}</span>
                </p>
                {authUser.email && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {authUser.email}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                disabled={isAuthBusy}
                title={t.auth.signOut}
                aria-label={t.auth.signOut}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="h-3 w-3" aria-hidden="true" />
                <span>{t.auth.signOut}</span>
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1.5">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {t.auth.localOnlyLabel}
              </p>
              <button
                type="button"
                onClick={onSignIn}
                disabled={isAuthBusy}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                <span>{isAuthBusy ? t.auth.signingIn : t.auth.signInGoogle}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onEditProfile}
            className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left"
            aria-label={t.modals.profileTitle}
            title={t.modals.profileTitle}
          >
            <div className="flex items-center gap-3 min-w-0">
              {!imgError && profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200 shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {profile.term} · {t.nav.targetLabel} {profile.targetGpa.toFixed(2)}
                </p>
              </div>
            </div>
            <Settings2 className="h-4 w-4 text-zinc-400 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
