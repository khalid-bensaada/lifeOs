import { Router } from "express";
import * as c from "../controllers/skill.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  createSkillSchema,
  titleSchema,
  doneSchema,
} from "../validators/skill.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createSkillSchema), c.create);
router.delete("/:id", c.remove);

router.post(
  "/:id/levels/:level/milestones",
  validate(titleSchema),
  c.addMilestone,
);
router.patch(
  "/:id/milestones/:milestoneId",
  validate(doneSchema),
  c.setMilestone,
);

router.post("/:id/practice", validate(titleSchema), c.addPractice);
router.patch("/:id/practice/:practiceId", validate(doneSchema), c.setPractice);

export default router;
