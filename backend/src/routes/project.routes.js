import { Router } from "express";
import * as c from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createProjectSchema), c.create);
router.get("/:id", c.get);
router.put("/:id", validate(updateProjectSchema), c.update);
router.delete("/:id", c.remove);

export default router;
