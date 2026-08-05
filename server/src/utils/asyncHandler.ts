import type { NextFunction, Request, Response } from "express";

type Handler<Req extends Request> = (req: Req, res: Response, next: NextFunction) => Promise<unknown>;

/** Wraps an async route handler so rejected promises reach the error middleware. */
export function asyncHandler<Req extends Request = Request>(handler: Handler<Req>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req as Req, res, next).catch(next);
  };
}
