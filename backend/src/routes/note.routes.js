import { Router } from "express";
import * as c from "../controllers/note.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  createNoteSchema,
  updateNoteSchema,
} from "../validators/note.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", c.list);
router.post("/", validate(createNoteSchema), c.create);
router.put("/:id", validate(updateNoteSchema), c.update);
router.delete("/:id", c.remove);

export default router;
