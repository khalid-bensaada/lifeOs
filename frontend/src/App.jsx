import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Time from "./pages/Time";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="goals" element={<Goals />} />
        <Route path="habits" element={<Habits />} />
        <Route path="time" element={<Time />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="stats" element={<Statistics />} />
        <Route path="projects" element={<Projects />} />
        <Route path="skills" element={<Skills />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
