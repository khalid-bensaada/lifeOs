import { Router } from "express";
import * as c from "../controllers/daily.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { saveDailySchema } from "../validators/daily.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.put("/:date", validate(saveDailySchema), c.save);

export default router;
