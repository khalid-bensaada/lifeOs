import { Router } from "express";
import * as c from "../controllers/task.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createTaskSchema), c.create);
router.get("/:id", c.get);
router.put("/:id", validate(updateTaskSchema), c.update);
router.delete("/:id", c.remove);

export default router;
