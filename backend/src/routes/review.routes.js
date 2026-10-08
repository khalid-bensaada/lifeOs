import { Router } from "express";
import * as c from "../controllers/review.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { saveReviewSchema } from "../validators/review.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.put("/:weekStart", validate(saveReviewSchema), c.save);

export default router;
