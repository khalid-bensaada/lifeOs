import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sun,
  CalendarDays,
  Compass,
  Target,
  FolderKanban,
  CheckSquare,
  Repeat,
  Timer,
  GraduationCap,
  StickyNote,
  ClipboardCheck,
  BarChart3,
  Settings,
  Moon,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n/useT";

const NAV = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/today", key: "nav.today", icon: Sun },
  { to: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { to: "/direction", key: "nav.direction", icon: Compass },
  { to: "/goals", key: "nav.goals", icon: Target },
  { to: "/projects", key: "nav.projects", icon: FolderKanban },
  { to: "/tasks", key: "nav.tasks", icon: CheckSquare },
  { to: "/habits", key: "nav.habits", icon: Repeat },
  { to: "/time", key: "nav.time", icon: Timer },
  { to: "/skills", key: "nav.skills", icon: GraduationCap },
  { to: "/notes", key: "nav.notes", icon: StickyNote },
  { to: "/review", key: "nav.review", icon: ClipboardCheck },
  { to: "/stats", key: "nav.stats", icon: BarChart3 },
  { to: "/settings", key: "nav.settings", icon: Settings },
];

const PRIMARY_PATHS = ["/", "/today", "/tasks", "/habits"];
const PRIMARY = PRIMARY_PATHS.map((to) => NAV.find((n) => n.to === to));

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
    isActive
      ? "bg-accent/10 font-medium text-accent"
      : "text-muted hover:bg-line/50"
  }`;

const footerBtn =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-line/50";

const tabBase = "flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-xs";

function Banner({ message, onDismiss }) {
  const { t } = useT();
  return (
    <div
      role="alert"
      className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label={t("layout.dismiss")}
        className="text-muted hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

function MoreSheet({
  open,
  onClose,
  returnRef,
  user,
  isDark,
  onToggleTheme,
  onLogout,
}) {
  const { t } = useT();
  const sheetRef = useRef(null);
  const ThemeIcon = isDark ? Sun : Moon;

  useEffect(() => {
    if (!open) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      sheetRef.current.querySelectorAll("a[href], button:not([disabled])");
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      returnRef.current?.focus();
    };
  }, [open, onClose, returnRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        id="more-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t("layout.allSections")}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex min-w-0 items-center gap-2 text-sm font-medium hover:text-accent"
          >
            <User size={18} aria-hidden="true" />
            <span className="truncate">{user.name}</span>
          </NavLink>
          <button
            onClick={onClose}
            aria-label={t("layout.closeMenu")}
            className="rounded-lg border border-line p-2 text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label={t("layout.allSections")}
          className="grid grid-cols-3 gap-2"
        >
          {NAV.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center text-xs ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-muted"
                }`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-line pt-3">
          <button onClick={onToggleTheme} className={footerBtn}>
            <ThemeIcon size={18} aria-hidden="true" />
            {isDark ? t("layout.lightMode") : t("layout.darkMode")}
          </button>
          <button onClick={onLogout} className={footerBtn}>
            <LogOut size={18} aria-hidden="true" />
            {t("layout.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { t } = useT();
  const { user, logout } = useAuth();
  const { taskError, clearTaskError } = useApp();
  const {
    isDark,
    updateSettings,
    error: settingsError,
    clearError,
  } = useSettings();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => {
      if (e.matches) setMoreOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () =>
    updateSettings({ theme: isDark ? "light" : "dark" });
  const ThemeIcon = isDark ? Sun : Moon;
  const moreActive = !PRIMARY_PATHS.includes(pathname);

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-line bg-card p-4 md:flex">
        <p className="mb-1 px-3 text-lg font-semibold">LifeOS</p>
        <NavLink
          to="/profile"
          className="mb-5 block truncate px-3 text-xs text-muted hover:text-accent"
        >
          {user.name}
        </NavLink>
        <nav
          aria-label={t("layout.mainNav")}
          className="flex-1 space-y-0.5 overflow-y-auto"
        >
          {NAV.map(({ to, key, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={sideLink}>
              <Icon size={18} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <button onClick={toggleTheme} className={footerBtn}>
          <ThemeIcon size={18} aria-hidden="true" />
          {isDark ? t("layout.lightMode") : t("layout.darkMode")}
        </button>
        <button onClick={logout} className={footerBtn}>
          <LogOut size={18} aria-hidden="true" />
          {t("layout.logout")}
        </button>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 sm:p-8 md:pb-8">
        {taskError && <Banner message={taskError} onDismiss={clearTaskError} />}
        {settingsError && (
          <Banner message={settingsError} onDismiss={clearError} />
        )}
        <Outlet />
      </main>

      <nav
        aria-label={t("layout.quickNav")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {PRIMARY.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `${tabBase} ${isActive ? "text-accent" : "text-muted"}`
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span className="max-w-full truncate">{t(key)}</span>
          </NavLink>
        ))}
        <button
          ref={moreRef}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="more-sheet"
          className={`${tabBase} ${moreActive ? "text-accent" : "text-muted"}`}
        >
          <Menu size={20} aria-hidden="true" />
          <span className="max-w-full truncate">{t("layout.more")}</span>
        </button>
      </nav>

      <MoreSheet
        open={moreOpen}
        onClose={closeMore}
        returnRef={moreRef}
        user={user}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />
    </div>
  );
}
