import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, workoutHistory, workoutTemplates } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";

const historyPostSchema = z.object({
  workoutId: z.string().min(1).max(120),
  completedAt: z.string().datetime().optional(),
  totalSets: z.number().int().min(0).max(1000),
  durationSeconds: z.number().int().min(0).max(86400),
  exercisesCompleted: z.array(z.unknown()).optional()
});

export const historyRouter = Router();

historyRouter.get("/history", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(workoutHistory)
      .where(eq(workoutHistory.userId, req.auth!.userId))
      .orderBy(desc(workoutHistory.completedAt));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

historyRouter.post("/history", requireAuth, async (req, res, next) => {
  try {
    const parsed = historyPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const payload = parsed.data;
    const workoutTemplate = await db.query.workoutTemplates.findFirst({
      where: eq(workoutTemplates.id, payload.workoutId)
    });

    const [created] = await db
      .insert(workoutHistory)
      .values({
        userId: req.auth!.userId,
        workoutId: payload.workoutId,
        completedAt: payload.completedAt ? new Date(payload.completedAt) : undefined,
        totalSets: payload.totalSets,
        durationSeconds: payload.durationSeconds,
        exercisesCompleted: payload.exercisesCompleted ?? []
      })
      .returning();

    await db
      .update(users)
      .set({
        lastWorkoutDate: new Date(),
        lastWorkoutType: workoutTemplate?.type ?? null,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.auth!.userId));

    console.log("history.completed", {
      userId: req.auth!.userId,
      workoutId: payload.workoutId,
      workoutType: workoutTemplate?.type ?? null,
      totalSets: payload.totalSets
    });

    res.status(201).json({ id: created.id });
  } catch (error) {
    next(error);
  }
});
