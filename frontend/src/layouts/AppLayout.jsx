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
} from "lucide-react";

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

// العناصر التي تظهر في الشريط السفلي على الموبايل
const MOBILE = [NAV[0], NAV[5], NAV[3]];

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
    isActive
      ? "bg-accent/10 font-medium text-accent"
      : "text-muted hover:bg-line/50"
  }`;

export default function AppLayout() {
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
      {/* Sidebar: يظهر من حجم md وما فوق */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
        <p className="mb-6 px-3 text-lg font-semibold">LifeOS</p>
        <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={sideLink}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-line/50"
        >
          <ThemeIcon size={18} aria-hidden="true" />
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </aside>

      {/* المحتوى */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 sm:p-8 md:pb-8">
        <Outlet />
      </main>

      {/* الشريط السفلي: الموبايل فقط */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-card md:hidden"
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
      </nav>
    </div>
  );
}
