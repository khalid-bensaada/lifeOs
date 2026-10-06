import { Router } from "express";
import * as c from "../controllers/event.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { createEventSchema } from "../validators/event.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createEventSchema), c.create);
router.delete("/:id", c.remove);

export default router;
