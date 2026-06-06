import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { TokenService } from "@/application/services/token-service";
import type { UserRole } from "@/domain";
import { container } from "@/infra/container/container";

export function authMiddleware(allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenService = container.TokenService;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = tokenService.verify(token);

      if (!allowedRoles.includes(payload.role)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.locals.user = payload;
      next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
