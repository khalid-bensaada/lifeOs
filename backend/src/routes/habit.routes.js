import { Router } from "express";
import * as c from "../controllers/habit.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { createHabitSchema, logSchema } from "../validators/habit.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createHabitSchema), c.create);
router.delete("/:id", c.remove);
router.put("/:id/logs/:date", validate(logSchema), c.setLog);

export default router;
