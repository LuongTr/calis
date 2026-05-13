import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { toAuthUser } from "../lib/serializers.js";

const onboardingSchema = z.object({
  experience: z.enum(["completely_new", "some_experience", "experienced"]),
  pushUpLevel: z.number().int().min(1).max(4).optional(),
  pullUpLevel: z.number().int().min(1).max(4).optional(),
  squatLevel: z.number().int().min(1).max(4).optional(),
  mobilityLevel: z.enum(["stiff", "normal", "flexible"])
});

function deriveLevel(input: z.infer<typeof onboardingSchema>): "beginner" | "intermediate" {
  if (input.experience === "completely_new") {
    return "beginner";
  }

  const push = input.pushUpLevel ?? 1;
  const pull = input.pullUpLevel ?? 1;
  const squat = input.squatLevel ?? 1;
  const average = (push + pull + squat) / 3;

  return average >= 2.5 ? "intermediate" : "beginner";
}

export const onboardingRouter = Router();

onboardingRouter.post("/onboarding/submit", requireAuth, async (req, res, next) => {
  try {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const payload = parsed.data;
    const level = deriveLevel(payload);
    const trainingStyle = level === "beginner" ? "full_body" : "upper_lower";

    const [updated] = await db
      .update(users)
      .set({
        experience: payload.experience,
        pushUpLevel: level === "beginner" ? null : payload.pushUpLevel ?? null,
        pullUpLevel: level === "beginner" ? null : payload.pullUpLevel ?? null,
        squatLevel: level === "beginner" ? null : payload.squatLevel ?? null,
        mobilityLevel: payload.mobilityLevel,
        level,
        trainingStyle,
        onboardingCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.auth!.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log("onboarding.submit", {
      userId: updated.id,
      level: updated.level,
      trainingStyle: updated.trainingStyle
    });

    res.json({ user: toAuthUser(updated) });
  } catch (error) {
    next(error);
  }
});
