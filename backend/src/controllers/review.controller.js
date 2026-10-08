import * as service from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseWeekStart } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { reviews: await service.list(req.user.id) },
  });
});

export const save = asyncHandler(async (req, res) => {
  const review = await service.save(
    req.user.id,
    parseWeekStart(req.params.weekStart),
    req.body,
  );
  res.json({ success: true, data: { review } });
});
