import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword, signAccessToken, verifyPassword } from "../lib/auth.js";
import { toAuthUser } from "../lib/serializers.js";

const signSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6).max(128),
  displayName: z.string().trim().min(2).max(50).optional()
});

export const authRouter = Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    const parsed = signSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password, displayName } = parsed.data;
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(users)
      .values({ email, passwordHash, displayName: displayName ?? null })
      .returning();
    const user = inserted[0];
    const token = signAccessToken({ userId: user.id, email: user.email });

    res.status(201).json({ token, user: toAuthUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = signSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      res.status(401).json({ error: "Invalid login credentials" });
      return;
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid login credentials" });
      return;
    }

    const token = signAccessToken({ userId: user.id, email: user.email });
    res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    next(error);
  }
});
