import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { verifySupabaseToken, findOrCreateUser } from "../utils/supabase-jwt";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; email: string; name: string | null; role: string };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const dbUser = await findOrCreateUser(supabaseUser);
      req.userId = dbUser.id;
      req.user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role };
      return next();
    }
  } catch {}

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.userId = user.id;
  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  next();
}
