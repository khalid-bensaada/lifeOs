import { Router } from "express";
import * as c from "../controllers/time.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { createEntrySchema } from "../validators/time.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createEntrySchema), c.create);
router.delete("/:id", c.remove);

export default router;
