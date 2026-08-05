import type { AuthedRequest } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ChainServiceTrackerService } from "../services/chainService.service.js";

export const getChainServiceTracker = asyncHandler<AuthedRequest>(async (req, res) => {
  const service = new ChainServiceTrackerService(req.db, req.userId);
  const data = await service.tracker();
  res.json({ data });
});
