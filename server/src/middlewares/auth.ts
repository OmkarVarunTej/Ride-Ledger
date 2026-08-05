import type { NextFunction, Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin, supabaseForUser } from "../config/supabase.js";
import { UnauthorizedError } from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export interface AuthedRequest extends Request {
  userId: string;
  accessToken: string;
  db: SupabaseClient;
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing bearer token");
  }
  const accessToken = header.slice("Bearer ".length);

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired session");
  }

  const authedReq = req as AuthedRequest;
  authedReq.userId = data.user.id;
  authedReq.accessToken = accessToken;
  authedReq.db = supabaseForUser(accessToken);
  next();
});
