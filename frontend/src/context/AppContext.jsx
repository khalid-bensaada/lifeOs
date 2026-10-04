import { createContext, useContext, useEffect, useState } from "react";
import {
  demoTasks,
  demoGoals,
  demoHabits,
  demoEntries,
  demoEvents,
  demoProjects,
  demoSkills,
} from "../data/demo";
import { toISO } from "../utils/dates";
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const DAILY_LIMIT = 5;

export const goalProgress = (g) => {
  const ms = g.milestones || [];
  return ms.length
    ? Math.round((100 * ms.filter((m) => m.done).length) / ms.length)
    : 0;
};

const uid = () => crypto.randomUUID();

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState(demoTasks);
  const [goals, setGoals] = useState(demoGoals);
  const [habits, setHabits] = useState(demoHabits);
  const [entries, setEntries] = useState(demoEntries);
  const [events, setEvents] = useState(demoEvents);
  const [projects, setProjects] = useState(demoProjects);
  const [skills, setSkills] = useState(demoSkills);
  const [active, setActive] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("activeTimer"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (active) localStorage.setItem("activeTimer", JSON.stringify(active));
    else localStorage.removeItem("activeTimer");
  }, [active]);

  const todayCount = tasks.filter((t) => t.today).length;

  const addTask = (t) =>
    setTasks((s) => [
      { id: uid(), status: "todo", today: false, project: "", ...t },
      ...s,
    ]);

  const updateTask = (id, patch) =>
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id) => setTasks((s) => s.filter((t) => t.id !== id));

  const toggleToday = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t.today && todayCount >= DAILY_LIMIT) return false;
    updateTask(id, { today: !t.today });
    return true;
  };

  // ---- Goals ----
  const addGoal = (g) =>
    setGoals((s) => [
      { id: uid(), status: "active", milestones: [], ...g },
      ...s,
    ]);

  const removeGoal = (id) => setGoals((s) => s.filter((g) => g.id !== id));

  const patchGoal = (id, fn) =>
    setGoals((s) => s.map((g) => (g.id === id ? fn(g) : g)));

  const addMilestone = (gid, title) =>
    patchGoal(gid, (g) => ({
      ...g,
      milestones: [...g.milestones, { id: uid(), title, done: false }],
    }));

  const toggleMilestone = (gid, mid) =>
    patchGoal(gid, (g) => ({
      ...g,
      milestones: g.milestones.map((m) =>
        m.id === mid ? { ...m, done: !m.done } : m,
      ),
    }));

  const addHabit = (h) =>
    setHabits((s) => [...s, { id: uid(), logs: [], ...h }]);

  const removeHabit = (id) => setHabits((s) => s.filter((h) => h.id !== id));

  const toggleHabitLog = (id, date) =>
    setHabits((s) =>
      s.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              logs: h.logs.includes(date)
                ? h.logs.filter((d) => d !== date)
                : [...h.logs, date],
            },
      ),
    );

  const startTimer = (t) => setActive({ ...t, startedAt: Date.now() });

  const stopTimer = () => {
    if (!active) return;
    const seconds = Math.max(
      1,
      Math.round((Date.now() - active.startedAt) / 1000),
    );
    setEntries((s) => [
      {
        id: uid(),
        category: active.category,
        title: active.title,
        project: active.project,
        date: toISO(new Date(active.startedAt)),
        seconds,
      },
      ...s,
    ]);
    setActive(null);
  };

  const removeEntry = (id) => setEntries((s) => s.filter((x) => x.id !== id));

  const addEvent = (e) => setEvents((s) => [...s, { id: uid(), ...e }]);

  const removeEvent = (id) => setEvents((s) => s.filter((x) => x.id !== id));

  const addProject = (p) =>
    setProjects((s) => [
      { id: uid(), status: "idea", tech: "", goalId: "", deadline: "", ...p },
      ...s,
    ]);

  const updateProject = (id, patch) =>
    setProjects((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const removeProject = (id) => {
    setProjects((s) => s.filter((p) => p.id !== id));
    setTasks((s) =>
      s.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
    );
  };
  const addSkill = (s) =>
    setSkills((x) => [
      {
        id: uid(),
        projects: [],
        levels: [0, 1, 2, 3].map(() => ({ milestones: [] })),
        ...s,
      },
      ...x,
    ]);

  const removeSkill = (id) => setSkills((x) => x.filter((k) => k.id !== id));

  const patchSkill = (id, fn) =>
    setSkills((x) => x.map((k) => (k.id === id ? fn(k) : k)));

  const addSkillMilestone = (id, li, title) =>
    patchSkill(id, (k) => ({
      ...k,
      levels: k.levels.map((l, i) =>
        i === li
          ? {
              ...l,
              milestones: [...l.milestones, { id: uid(), title, done: false }],
            }
          : l,
      ),
    }));

  const toggleSkillMilestone = (id, li, mid) =>
    patchSkill(id, (k) => ({
      ...k,
      levels: k.levels.map((l, i) =>
        i === li
          ? {
              ...l,
              milestones: l.milestones.map((m) =>
                m.id === mid ? { ...m, done: !m.done } : m,
              ),
            }
          : l,
      ),
    }));

  const addPractice = (id, title) =>
    patchSkill(id, (k) => ({
      ...k,
      projects: [...k.projects, { id: uid(), title, done: false }],
    }));

  const togglePractice = (id, pid) =>
    patchSkill(id, (k) => ({
      ...k,
      projects: k.projects.map((p) =>
        p.id === pid ? { ...p, done: !p.done } : p,
      ),
    }));

  return (
    <Ctx.Provider
      value={{
        tasks,
        goals,
        habits,
        entries,
        events,
        projects,
        skills,
        active,
        todayCount,
        addTask,
        updateTask,
        removeTask,
        toggleToday,
        addGoal,
        removeGoal,
        addMilestone,
        toggleMilestone,
        addHabit,
        removeHabit,
        toggleHabitLog,
        startTimer,
        stopTimer,
        removeEntry,
        addEvent,
        removeEvent,
        addProject,
        updateProject,
        removeProject,
        addSkill,
        removeSkill,
        addSkillMilestone,
        toggleSkillMilestone,
        addPractice,
        togglePractice,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
