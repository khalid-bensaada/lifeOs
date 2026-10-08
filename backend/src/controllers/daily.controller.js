import * as service from "../services/daily.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseDate } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { reviews: await service.list(req.user.id) },
  });
});

export const save = asyncHandler(async (req, res) => {
  const review = await service.save(
    req.user.id,
    parseDate(req.params.date),
    req.body,
  );
  res.json({ success: true, data: { review } });
});
