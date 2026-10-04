import { daysAgo } from "../utils/dates";

export const demoTasks = [
  {
    id: "t1",
    title: "Finish JavaScript exercise",
    priority: "high",
    status: "completed",
    today: true,
    est: 45,
    projectId: "p2",
  },
  {
    id: "t2",
    title: "Study SQL for 45 minutes",
    priority: "high",
    status: "in_progress",
    today: true,
    est: 45,
    projectId: "p1",
  },
  {
    id: "t3",
    title: "Gym",
    priority: "medium",
    status: "todo",
    today: true,
    est: 60,
  },
  {
    id: "t4",
    title: "French lesson",
    priority: "medium",
    status: "todo",
    today: true,
    est: 30,
  },
  {
    id: "t5",
    title: "Build authentication",
    priority: "critical",
    status: "todo",
    today: false,
    est: 90,
    projectId: "p1",
    due: daysAgo(-3),
  },
  {
    id: "t6",
    title: "Model a simple room in Blender",
    priority: "low",
    status: "todo",
    today: false,
    est: 60,
    projectId: "p4",
    due: daysAgo(-5),
  },
];

export const demoGoals = [
  {
    id: "g1",
    title: "Become a strong Full Stack Developer",
    category: "Programming",
    deadline: "2027-06-30",
    status: "active",
    milestones: [
      { id: "m1", title: "Improve JavaScript", done: true },
      { id: "m2", title: "Learn React", done: false },
      { id: "m3", title: "Build APIs", done: false },
      { id: "m4", title: "Build portfolio", done: false },
    ],
  },
  {
    id: "g2",
    title: "Learn 3D",
    category: "3D",
    deadline: "2027-03-01",
    status: "active",
    milestones: [
      { id: "m5", title: "Blender interface and navigation", done: true },
      { id: "m6", title: "Modeling and materials", done: false },
      { id: "m7", title: "Lighting and rendering", done: false },
    ],
  },
  {
    id: "g3",
    title: "Improve fitness consistency",
    category: "Fitness",
    deadline: "2026-12-31",
    status: "active",
    milestones: [
      { id: "m8", title: "Three sessions per week for a month", done: false },
    ],
  },
];

const days = (...n) => n.map(daysAgo);

export const demoHabits = [
  {
    id: "h1",
    name: "Programming",
    category: "Programming",
    logs: days(0, 1, 2, 3, 5, 6, 8, 9),
  },
  { id: "h2", name: "Gym", category: "Fitness", logs: days(1, 3, 4, 7) },
  { id: "h3", name: "French", category: "Education", logs: days(0, 2, 3, 4) },
  {
    id: "h4",
    name: "Sleep on time",
    category: "Personal",
    logs: days(1, 2, 5),
  },
  { id: "h5", name: "3D practice", category: "3D", logs: days(2, 6) },
];

const e = (id, category, title, min, n) => ({
  id,
  category,
  title,
  project: "",
  date: daysAgo(n),
  seconds: min * 60,
});

export const demoEntries = [
  e("e1", "Programming", "JavaScript exercise", 135, 0),
  e("e2", "3D", "Blender room", 45, 0),
  e("e3", "Design", "Dashboard layout", 30, 0),
  e("e4", "French", "Lesson", 60, 0),
  e("e5", "Entertainment", "YouTube", 160, 0),
  e("e6", "Programming", "HosBank authentication", 180, 1),
  e("e7", "Gym", "Workout", 60, 1),
  e("e8", "Entertainment", "Games", 120, 1),
  e("e9", "Programming", "SQL practice", 150, 2),
  e("e10", "3D", "Modeling", 40, 3),
  e("e11", "Reading", "Book", 30, 3),
  e("e12", "Programming", "React course", 200, 5),
  e("e13", "Video Editing", "Short edit", 90, 8),
  e("e14", "Programming", "API project", 240, 10),
];

const ev = (id, title, start, end, n) => ({
  id,
  title,
  date: daysAgo(n),
  start,
  end,
});

export const demoEvents = [
  ev("v1", "Gym", "18:30", "19:30", 0),
  ev("v2", "Programming session", "20:30", "22:00", 0),
  ev("v3", "French lesson", "22:00", "22:30", -1),
  ev("v4", "Gym", "18:30", "19:30", -2),
  ev("v5", "Project review", "17:00", "18:00", -4),
  ev("v6", "Study session", "21:00", "21:30", -6),
];

export const demoProjects = [
  {
    id: "p1",
    title: "HosBank",
    status: "in_progress",
    tech: "Laravel, MySQL",
    goalId: "g1",
    deadline: "2026-12-15",
  },
  {
    id: "p2",
    title: "LifeOS",
    status: "in_progress",
    tech: "React, Node.js",
    goalId: "g1",
    deadline: "2027-01-31",
  },
  {
    id: "p3",
    title: "Portfolio",
    status: "planning",
    tech: "React, Tailwind",
    goalId: "g1",
    deadline: "2027-03-01",
  },
  {
    id: "p4",
    title: "3D Product Project",
    status: "idea",
    tech: "Blender",
    goalId: "g2",
    deadline: "",
  },
  {
    id: "p5",
    title: "Laravel API",
    status: "completed",
    tech: "Laravel",
    goalId: "g1",
    deadline: "",
  },
];

const lvl = (p, done, titles) => ({
  milestones: titles.map((t, i) => ({
    id: `${p}-${i}`,
    title: t,
    done: i < done,
  })),
});

const path = (p, items) =>
  items.map(([title, done], i) => ({ id: `${p}-p${i}`, title, done }));

export const demoSkills = [
  {
    id: "s1",
    name: "JavaScript",
    category: "Programming",
    levels: [
      lvl("js1", 3, ["Variables and types", "Functions", "Arrays and objects"]),
      lvl("js2", 2, ["DOM manipulation", "Async and promises", "Modules"]),
      lvl("js3", 0, ["Error handling", "Testing basics", "Design patterns"]),
      lvl("js4", 0, ["Performance", "Build tools", "Open source contribution"]),
    ],
    projects: path("js", [
      ["Build a calculator", true],
      ["Build a todo app", false],
      ["Build a weather app", false],
    ]),
  },
  {
    id: "s2",
    name: "React",
    category: "Programming",
    levels: [
      lvl("re1", 3, ["JSX and components", "Props and state", "Events"]),
      lvl("re2", 1, ["Hooks", "Context", "Routing"]),
      lvl("re3", 0, ["Performance", "Testing", "State libraries"]),
      lvl("re4", 0, ["Server rendering", "Architecture", "Portfolio app"]),
    ],
    projects: path("re", [
      ["Build a counter and a form", true],
      ["Build a task manager", true],
      ["Build LifeOS", false],
    ]),
  },
  {
    id: "s3",
    name: "SQL",
    category: "Programming",
    levels: [
      lvl("sq1", 3, ["SELECT and filters", "Joins", "Aggregations"]),
      lvl("sq2", 0, ["Subqueries", "Indexes", "Transactions"]),
      lvl("sq3", 0, [
        "Query optimization",
        "Views and procedures",
        "Schema design",
      ]),
      lvl("sq4", 0, [
        "Advanced modeling",
        "Migrations",
        "Real project database",
      ]),
    ],
    projects: path("sq", [
      ["Design a library database", true],
      ["Write 20 practice queries", false],
      ["Design the HosBank schema", false],
    ]),
  },
  {
    id: "s4",
    name: "Blender",
    category: "3D",
    levels: [
      lvl("bl1", 3, ["Interface", "Navigation", "Basic objects"]),
      lvl("bl2", 1, ["Modeling", "Modifiers", "Materials"]),
      lvl("bl3", 0, ["Lighting", "Rendering", "Animation"]),
      lvl("bl4", 0, [
        "Advanced modeling",
        "Product visualization",
        "Portfolio project",
      ]),
    ],
    projects: path("bl", [
      ["Create a simple room", true],
      ["Create a product model", false],
      ["Create a realistic material", false],
      ["Create a product animation", false],
      ["Create a complete commercial", false],
    ]),
  },
];
