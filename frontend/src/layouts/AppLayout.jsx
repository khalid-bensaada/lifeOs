import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Sun,
  CalendarDays,
  Target,
  FolderKanban,
  CheckSquare,
  Repeat,
  Timer,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Settings,
  Moon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/today", label: "Today", icon: Sun },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/habits", label: "Habits", icon: Repeat },
  { to: "/time", label: "Time Tracker", icon: Timer },
  { to: "/skills", label: "Skills", icon: GraduationCap },
  { to: "/review", label: "Weekly Review", icon: ClipboardCheck },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MOBILE = [NAV[0], NAV[5], NAV[3]];

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
    isActive
      ? "bg-accent/10 font-medium text-accent"
      : "text-muted hover:bg-line/50"
  }`;

const footerBtn =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-line/50";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { taskError, clearTaskError } = useApp();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const ThemeIcon = dark ? Sun : Moon;

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
        <p className="mb-1 px-3 text-lg font-semibold">LifeOS</p>
        <p className="mb-5 truncate px-3 text-xs text-muted">{user.name}</p>
        <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={sideLink}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setDark(!dark)} className={footerBtn}>
          <ThemeIcon size={18} aria-hidden="true" />
          {dark ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={logout} className={footerBtn}>
          <LogOut size={18} aria-hidden="true" />
          Log out
        </button>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 sm:p-8 md:pb-8">
        {taskError && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
          >
            <span>{taskError}</span>
            <button
              onClick={clearTaskError}
              aria-label="Dismiss"
              className="text-muted hover:text-ink"
            >
              ×
            </button>
          </div>
        )}
        <Outlet />
      </main>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-card md:hidden"
      >
        {MOBILE.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs ${isActive ? "text-accent" : "text-muted"}`
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setDark(!dark)}
          className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted"
        >
          <ThemeIcon size={20} aria-hidden="true" />
          Theme
        </button>
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted"
        >
          <LogOut size={20} aria-hidden="true" />
          Log out
        </button>
      </nav>
    </div>
  );
}
