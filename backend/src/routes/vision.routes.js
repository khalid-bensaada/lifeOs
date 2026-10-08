import { Router } from "express";
import * as c from "../controllers/vision.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { saveVisionSchema } from "../validators/vision.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.get);
router.put("/", validate(saveVisionSchema), c.save);

export default router;
