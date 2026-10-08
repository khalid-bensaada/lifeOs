import { Router } from "express";
import * as c from "../controllers/settings.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { updateSettingsSchema } from "../validators/settings.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.get);
router.put("/", validate(updateSettingsSchema), c.update);

export default router;
