import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { toAuthUser } from "../lib/serializers.js";

const profilePatchSchema = z
  .object({
    displayName: z.string().min(1).max(120).nullable().optional(),
    level: z.enum(["beginner", "intermediate"]).optional(),
    trainingStyle: z.enum(["full_body", "upper_lower", "push_pull_legs"]).optional(),
    mobilityLevel: z.enum(["stiff", "normal", "flexible"]).optional(),
    experience: z.string().min(1).max(120).nullable().optional(),
    onboardingCompleted: z.boolean().optional(),
    pushUpLevel: z.number().int().min(0).max(10).nullable().optional(),
    pullUpLevel: z.number().int().min(0).max(10).nullable().optional(),
    squatLevel: z.number().int().min(0).max(10).nullable().optional(),
    lastWorkoutType: z.string().min(1).max(32).nullable().optional(),
    preferredVariants: z.record(z.string(), z.string()).optional()
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.auth!.userId)
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: toAuthUser(user) });
  } catch (error) {
    next(error);
  }
});

profileRouter.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const parsed = profilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const payload = parsed.data;
    const [updated] = await db
      .update(users)
      .set({
        displayName: payload.displayName,
        level: payload.level,
        trainingStyle: payload.trainingStyle,
        mobilityLevel: payload.mobilityLevel,
        experience: payload.experience,
        onboardingCompleted: payload.onboardingCompleted,
        pushUpLevel: payload.pushUpLevel,
        pullUpLevel: payload.pullUpLevel,
        squatLevel: payload.squatLevel,
        lastWorkoutType: payload.lastWorkoutType,
        preferredVariants: payload.preferredVariants,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.auth!.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: toAuthUser(updated) });
  } catch (error) {
    next(error);
  }
});
