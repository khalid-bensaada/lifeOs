import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { demoSkills, demoReviews } from "../data/demo";
import { toISO } from "../utils/dates";
import { useAuth } from "./AuthContext";
import * as goalsApi from "../services/goals";
import * as tasksApi from "../services/tasks";
import * as projectsApi from "../services/projects";
import * as habitsApi from "../services/habits";
import * as timeApi from "../services/time";
import * as eventsApi from "../services/events";

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
  const { user } = useAuth();

  const [skills, setSkills] = useState(demoSkills);
  const [reviews, setReviews] = useState(demoReviews);

  const [goals, setGoals] = useState([]);
  const [goalsStatus, setGoalsStatus] = useState("loading");

  const [tasks, setTasks] = useState([]);
  const [tasksStatus, setTasksStatus] = useState("loading");

  const [projects, setProjects] = useState([]);
  const [projectsStatus, setProjectsStatus] = useState("loading");

  const [habits, setHabits] = useState([]);
  const [habitsStatus, setHabitsStatus] = useState("loading");

  const [entries, setEntries] = useState([]);
  const [entriesStatus, setEntriesStatus] = useState("loading");

  const [events, setEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState("loading");

  const [taskError, setTaskError] = useState("");

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

  const makeLoader = (api, setData, setStatus) => async () => {
    setStatus("loading");
    try {
      setData(await api.list());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const loadGoals = useCallback(
    makeLoader(goalsApi, setGoals, setGoalsStatus),
    [],
  );
  const loadTasks = useCallback(
    makeLoader(tasksApi, setTasks, setTasksStatus),
    [],
  );
  const loadProjects = useCallback(
    makeLoader(projectsApi, setProjects, setProjectsStatus),
    [],
  );
  const loadHabits = useCallback(
    makeLoader(habitsApi, setHabits, setHabitsStatus),
    [],
  );
  const loadEntries = useCallback(
    makeLoader(timeApi, setEntries, setEntriesStatus),
    [],
  );
  const loadEvents = useCallback(
    makeLoader(eventsApi, setEvents, setEventsStatus),
    [],
  );

  useEffect(() => {
    if (user) {
      loadGoals();
      loadTasks();
      loadProjects();
      loadHabits();
      loadEntries();
      loadEvents();
    } else {
      setGoals([]);
      setTasks([]);
      setProjects([]);
      setHabits([]);
      setEntries([]);
      setEvents([]);
      setGoalsStatus("loading");
      setTasksStatus("loading");
      setProjectsStatus("loading");
      setHabitsStatus("loading");
      setEntriesStatus("loading");
      setEventsStatus("loading");
    }
  }, [
    user?.id,
    loadGoals,
    loadTasks,
    loadProjects,
    loadHabits,
    loadEntries,
    loadEvents,
  ]);

  const todayCount = tasks.filter((t) => t.today).length;

  const guard = async (fn) => {
    setTaskError("");
    try {
      return await fn();
    } catch (err) {
      setTaskError(err.message);
      return false;
    }
  };

  const clearTaskError = () => setTaskError("");

  const addTask = (t) =>
    guard(async () => {
      const saved = await tasksApi.create(t);
      setTasks((s) => [saved, ...s]);
      return true;
    });

  const updateTask = (id, patch) =>
    guard(async () => {
      const prev = tasks.find((t) => t.id === id);
      setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      try {
        const saved = await tasksApi.update(id, patch);
        setTasks((s) => s.map((t) => (t.id === id ? saved : t)));
        return true;
      } catch (err) {
        setTasks((s) => s.map((t) => (t.id === id ? prev : t)));
        throw err;
      }
    });

  const removeTask = (id) =>
    guard(async () => {
      await tasksApi.remove(id);
      setTasks((s) => s.filter((t) => t.id !== id));
      return true;
    });

  const toggleToday = async (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return false;
    if (!t.today && todayCount >= DAILY_LIMIT) {
      setTaskError(
        `Today is limited to ${DAILY_LIMIT} priorities. Remove one first.`,
      );
      return false;
    }
    return updateTask(id, { today: !t.today });
  };

  const addProject = (p) =>
    guard(async () => {
      const saved = await projectsApi.create(p);
      setProjects((s) => [saved, ...s]);
      return true;
    });

  const updateProject = (id, patch) =>
    guard(async () => {
      const prev = projects.find((p) => p.id === id);
      setProjects((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      try {
        const saved = await projectsApi.update(id, patch);
        setProjects((s) => s.map((p) => (p.id === id ? saved : p)));
        return true;
      } catch (err) {
        setProjects((s) => s.map((p) => (p.id === id ? prev : p)));
        throw err;
      }
    });

  const removeProject = (id) =>
    guard(async () => {
      await projectsApi.remove(id);
      setProjects((s) => s.filter((p) => p.id !== id));
      setTasks((s) =>
        s.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
      );
      setEntries((s) =>
        s.map((x) => (x.projectId === id ? { ...x, projectId: null } : x)),
      );
      return true;
    });

  const addHabit = (h) =>
    guard(async () => {
      const saved = await habitsApi.create(h);
      setHabits((s) => [...s, saved]);
      return true;
    });

  const removeHabit = (id) =>
    guard(async () => {
      await habitsApi.remove(id);
      setHabits((s) => s.filter((h) => h.id !== id));
      return true;
    });

  const applyLog = (id, date, done) =>
    setHabits((s) =>
      s.map((h) => {
        if (h.id !== id) return h;
        const without = h.logs.filter((d) => d !== date);
        return { ...h, logs: done ? [...without, date] : without };
      }),
    );

  const toggleHabitLog = (id, date) =>
    guard(async () => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return false;
      const done = !habit.logs.includes(date);
      applyLog(id, date, done);
      try {
        await habitsApi.setLog(id, date, done);
        return true;
      } catch (err) {
        applyLog(id, date, !done);
        throw err;
      }
    });

  const startTimer = (t) => setActive({ ...t, startedAt: Date.now() });

  const stopTimer = () =>
    guard(async () => {
      if (!active) return false;
      const seconds = Math.min(
        604800,
        Math.max(1, Math.round((Date.now() - active.startedAt) / 1000)),
      );
      const saved = await timeApi.create({
        category: active.category,
        title: active.title,
        projectId: active.projectId,
        date: toISO(new Date(active.startedAt)),
        seconds,
      });
      setEntries((s) => [saved, ...s]);
      setActive(null);
      return true;
    });

  const removeEntry = (id) =>
    guard(async () => {
      await timeApi.remove(id);
      setEntries((s) => s.filter((x) => x.id !== id));
      return true;
    });

  const addEvent = (e) =>
    guard(async () => {
      const saved = await eventsApi.create(e);
      setEvents((s) => [...s, saved]);
      return true;
    });

  const removeEvent = (id) =>
    guard(async () => {
      await eventsApi.remove(id);
      setEvents((s) => s.filter((x) => x.id !== id));
      return true;
    });

  const replaceGoal = (g) =>
    setGoals((s) => s.map((x) => (x.id === g.id ? g : x)));

  const addGoal = async (data) => {
    const g = await goalsApi.create(data);
    setGoals((s) => [g, ...s]);
  };

  const removeGoal = async (id) => {
    await goalsApi.remove(id);
    setGoals((s) => s.filter((g) => g.id !== id));
    setProjects((s) =>
      s.map((p) => (p.goalId === id ? { ...p, goalId: null } : p)),
    );
  };

  const addMilestone = async (gid, title) =>
    replaceGoal(await goalsApi.addMilestone(gid, title));

  const toggleMilestone = async (gid, mid) => {
    const m = goals
      .find((g) => g.id === gid)
      ?.milestones.find((x) => x.id === mid);
    if (!m) return;
    replaceGoal(await goalsApi.updateMilestone(gid, mid, { done: !m.done }));
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

  const saveReview = (r) =>
    setReviews((s) =>
      [
        { id: uid(), ...r },
        ...s.filter((x) => x.weekStart !== r.weekStart),
      ].sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    );

  return (
    <Ctx.Provider
      value={{
        tasks,
        tasksStatus,
        loadTasks,
        taskError,
        clearTaskError,
        goals,
        goalsStatus,
        loadGoals,
        projects,
        projectsStatus,
        loadProjects,
        habits,
        habitsStatus,
        loadHabits,
        entries,
        entriesStatus,
        loadEntries,
        events,
        eventsStatus,
        loadEvents,
        skills,
        reviews,
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
        addProject,
        updateProject,
        removeProject,
        addHabit,
        removeHabit,
        toggleHabitLog,
        startTimer,
        stopTimer,
        removeEntry,
        addEvent,
        removeEvent,
        addSkill,
        removeSkill,
        addSkillMilestone,
        toggleSkillMilestone,
        addPractice,
        togglePractice,
        saveReview,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
