import { Router } from "express";
import * as c from "../controllers/goal.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  createGoalSchema,
  updateGoalSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
} from "../validators/goal.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createGoalSchema), c.create);
router.get("/:id", c.get);
router.put("/:id", validate(updateGoalSchema), c.update);
router.delete("/:id", c.remove);

router.post("/:id/milestones", validate(createMilestoneSchema), c.addMilestone);
router.patch(
  "/:id/milestones/:milestoneId",
  validate(updateMilestoneSchema),
  c.updateMilestone,
);
router.delete("/:id/milestones/:milestoneId", c.removeMilestone);

export default router;
