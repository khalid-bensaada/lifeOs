import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Time from "./pages/Time";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Review from "./pages/Review";
import ComingSoon from "./pages/ComingSoon";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Auth mode="login" />} />
      <Route path="register" element={<Auth mode="register" />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="goals" element={<Goals />} />
        <Route path="habits" element={<Habits />} />
        <Route path="time" element={<Time />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="stats" element={<Statistics />} />
        <Route path="projects" element={<Projects />} />
        <Route path="skills" element={<Skills />} />
        <Route path="review" element={<Review />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
