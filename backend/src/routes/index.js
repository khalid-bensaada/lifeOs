import { Router } from "express";
import health from "./health.routes.js";
import auth from "./auth.routes.js";
import goals from "./goal.routes.js";
import tasks from "./task.routes.js";
import projects from "./project.routes.js";
import habits from "./habit.routes.js";
import time from "./time.routes.js";
import events from "./event.routes.js";

const router = Router();

router.use("/health", health);
router.use("/auth", auth);
router.use("/goals", goals);
router.use("/tasks", tasks);
router.use("/projects", projects);
router.use("/habits", habits);
router.use("/time", time);
router.use("/events", events);

export default router;
