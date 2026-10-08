import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useT } from "./i18n/useT";
import AppLayout from "./layouts/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Focus from "./pages/Focus";
import Direction from "./pages/Direction";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Time from "./pages/Time";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Notes from "./pages/Notes";
import Review from "./pages/Review";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function Protected({ bare = false }) {
  const { user, loading } = useAuth();
  const { t } = useT();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted">
        {t("common.loading")}
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return bare ? <Outlet /> : <AppLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Auth mode="login" />} />
      <Route path="register" element={<Auth mode="register" />} />

      <Route element={<Protected bare />}>
        <Route path="focus" element={<Focus />} />
      </Route>

      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="today" element={<Today />} />
        <Route path="direction" element={<Direction />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="goals" element={<Goals />} />
        <Route path="habits" element={<Habits />} />
        <Route path="time" element={<Time />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="stats" element={<Statistics />} />
        <Route path="projects" element={<Projects />} />
        <Route path="skills" element={<Skills />} />
        <Route path="notes" element={<Notes />} />
        <Route path="review" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
