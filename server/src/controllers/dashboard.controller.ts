import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DashboardService } from "../services/dashboard.service.js";

export const getDashboardSummary = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new DashboardService(req.db, req.userId);
  const data = await service.summary();
  res.json({ data });
});
