import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, workoutHistory, workoutTemplates } from "../db/schema.js";
import { CONTENT_VERSION } from "../lib/content.js";
import { buildTodayRecommendations } from "../lib/recommendations.js";
import { requireAuth } from "../middleware/auth.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/recommendations/today", requireAuth, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.auth!.userId)
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const templates = await db.select().from(workoutTemplates);
    const recentHistory = await db
      .select({
        workoutType: workoutTemplates.type
      })
      .from(workoutHistory)
      .leftJoin(workoutTemplates, eq(workoutHistory.workoutId, workoutTemplates.id))
      .where(eq(workoutHistory.userId, req.auth!.userId))
      .orderBy(desc(workoutHistory.completedAt))
      .limit(2);

    const recommendations = buildTodayRecommendations({
      level: user.level as "beginner" | "intermediate",
      trainingStyle: user.trainingStyle as "full_body" | "upper_lower" | "push_pull_legs",
      lastWorkoutDate: user.lastWorkoutDate,
      recentWorkoutTypes: recentHistory
        .map((item) => item.workoutType)
        .filter((type): type is "full_body" | "upper" | "lower" | "push" | "pull" | "legs" | "mobility" => Boolean(type)),
      workouts: templates
    });

    console.log("recommendations.today", {
      userId: user.id,
      count: recommendations.length
    });

    res.json({ contentVersion: CONTENT_VERSION, recommendations });
  } catch (error) {
    next(error);
  }
});
