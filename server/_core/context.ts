import type { Request, Response } from "express";
import { sdk } from "./sdk";

export type SessionUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date | null;
  taskUid?: string;
  isCron?: boolean;
};

export type TrpcContext = {
  req: Request;
  res: Response;
  user?: SessionUser;
};

export async function createContext(opts: {
  req: Request;
  res: Response;
}): Promise<TrpcContext> {
  let user: SessionUser | null = null;
  try {
    user = (await sdk.authenticateRequest(opts.req)) as SessionUser | null;
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user: user ?? undefined,
  };
}
