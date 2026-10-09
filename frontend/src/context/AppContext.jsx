import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toISO } from "../utils/dates";
import { elapsedMs } from "../utils/time";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import * as goalsApi from "../services/goals";
import * as tasksApi from "../services/tasks";
import * as projectsApi from "../services/projects";
import * as habitsApi from "../services/habits";
import * as timeApi from "../services/time";
import * as eventsApi from "../services/events";
import * as skillsApi from "../services/skills";
import * as reviewsApi from "../services/reviews";
import * as dailyApi from "../services/dailyReviews";
import { translate } from "../i18n";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const DAILY_LIMIT = 5;

export const goalProgress = (g) => {
  const ms = g.milestones || [];
  return ms.length
    ? Math.round((100 * ms.filter((m) => m.done).length) / ms.length)
    : 0;
};

export function AppProvider({ children }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const dailyLimit = settings.dailyTaskLimit;

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

  const [skills, setSkills] = useState([]);
  const [skillsStatus, setSkillsStatus] = useState("loading");

  const [reviews, setReviews] = useState([]);
  const [reviewsStatus, setReviewsStatus] = useState("loading");

  const [dailyReviews, setDailyReviews] = useState([]);
  const [dailyStatus, setDailyStatus] = useState("loading");

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
  const loadSkills = useCallback(
    makeLoader(skillsApi, setSkills, setSkillsStatus),
    [],
  );
  const loadReviews = useCallback(
    makeLoader(reviewsApi, setReviews, setReviewsStatus),
    [],
  );
  const loadDaily = useCallback(
    makeLoader(dailyApi, setDailyReviews, setDailyStatus),
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
      loadSkills();
      loadReviews();
      loadDaily();
    } else {
      setGoals([]);
      setTasks([]);
      setProjects([]);
      setHabits([]);
      setEntries([]);
      setEvents([]);
      setSkills([]);
      setReviews([]);
      setDailyReviews([]);
      setGoalsStatus("loading");
      setTasksStatus("loading");
      setProjectsStatus("loading");
      setHabitsStatus("loading");
      setEntriesStatus("loading");
      setEventsStatus("loading");
      setSkillsStatus("loading");
      setReviewsStatus("loading");
      setDailyStatus("loading");
    }
  }, [
    user?.id,
    loadGoals,
    loadTasks,
    loadProjects,
    loadHabits,
    loadEntries,
    loadEvents,
    loadSkills,
    loadReviews,
    loadDaily,
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
    if (!t.today && todayCount >= dailyLimit) {
      setTaskError(
        `Today is limited to ${dailyLimit} priorities. Remove one first.`,
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

  const startTimer = (t) => {
    const now = Date.now();
    setActive({ ...t, startedAt: now, accumulated: 0, resumedAt: now });
  };

  const pauseTimer = () =>
    setActive((a) => {
      if (!a || a.resumedAt === null) return a;
      return { ...a, accumulated: elapsedMs(a, Date.now()), resumedAt: null };
    });

  const resumeTimer = () =>
    setActive((a) => {
      if (!a || a.resumedAt !== null) return a;
      return { ...a, resumedAt: Date.now() };
    });

  const discardTimer = () => setActive(null);

  const stopTimer = (opts = {}) =>
    guard(async () => {
      if (!active) return false;
      const seconds = Math.min(
        604800,
        Math.max(1, Math.round(elapsedMs(active, Date.now()) / 1000)),
      );
      const saved = await timeApi.create({
        category: active.category,
        title: active.title,
        projectId: active.projectId,
        taskId: active.taskId,
        note: opts.note,
        date: toISO(new Date(active.startedAt)),
        seconds,
      });
      setEntries((s) => [saved, ...s]);
      setActive(null);
      if (opts.completeTask && active.taskId) {
        await updateTask(active.taskId, { status: "completed" });
      }
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

  const updateEvent = (id, patch) =>
    guard(async () => {
      const saved = await eventsApi.update(id, patch);
      setEvents((s) => s.map((x) => (x.id === id ? saved : x)));
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

  const replaceSkill = (k) =>
    setSkills((s) => s.map((x) => (x.id === k.id ? k : x)));

  const addSkill = (data) =>
    guard(async () => {
      const saved = await skillsApi.create(data);
      setSkills((s) => [saved, ...s]);
      return true;
    });

  const removeSkill = (id) =>
    guard(async () => {
      await skillsApi.remove(id);
      setSkills((s) => s.filter((k) => k.id !== id));
      return true;
    });

  const addSkillMilestone = (id, levelIndex, title) =>
    guard(async () => {
      replaceSkill(await skillsApi.addMilestone(id, levelIndex + 1, title));
      return true;
    });

  const toggleSkillMilestone = (id, levelIndex, mid) =>
    guard(async () => {
      const m = skills
        .find((k) => k.id === id)
        ?.levels[levelIndex]?.milestones.find((x) => x.id === mid);
      if (!m) return false;
      replaceSkill(await skillsApi.setMilestone(id, mid, !m.done));
      return true;
    });

  const addPractice = (id, title) =>
    guard(async () => {
      replaceSkill(await skillsApi.addPractice(id, title));
      return true;
    });

  const togglePractice = (id, pid) =>
    guard(async () => {
      const p = skills
        .find((k) => k.id === id)
        ?.projects.find((x) => x.id === pid);
      if (!p) return false;
      replaceSkill(await skillsApi.setPractice(id, pid, !p.done));
      return true;
    });

  const saveReview = (r) =>
    guard(async () => {
      const saved = await reviewsApi.save(r.weekStart, r);
      setReviews((s) =>
        [saved, ...s.filter((x) => x.weekStart !== saved.weekStart)].sort(
          (a, b) => b.weekStart.localeCompare(a.weekStart),
        ),
      );
      return true;
    });

  const saveDailyReview = (date, data) =>
    guard(async () => {
      const saved = await dailyApi.save(date, data);
      setDailyReviews((s) =>
        [saved, ...s.filter((x) => x.date !== saved.date)].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      );
      return true;
    });

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
        skillsStatus,
        loadSkills,
        reviews,
        reviewsStatus,
        loadReviews,
        dailyReviews,
        dailyStatus,
        loadDaily,
        active,
        todayCount,
        dailyLimit,
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
        pauseTimer,
        resumeTimer,
        stopTimer,
        discardTimer,
        removeEntry,
        addEvent,
        updateEvent,
        removeEvent,
        addSkill,
        removeSkill,
        addSkillMilestone,
        toggleSkillMilestone,
        addPractice,
        togglePractice,
        saveReview,
        saveDailyReview,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
