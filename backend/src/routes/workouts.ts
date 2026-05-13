import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { workoutTemplates } from "../db/schema.js";

export const workoutsRouter = Router();

workoutsRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(workoutTemplates).orderBy(asc(workoutTemplates.id));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

workoutsRouter.get("/:id", async (req, res, next) => {
  try {
    const row = await db.query.workoutTemplates.findFirst({
      where: eq(workoutTemplates.id, req.params.id)
    });
    if (!row) {
      res.status(404).json({ error: "Workout template not found" });
      return;
    }
    res.json(row);
  } catch (error) {
    next(error);
  }
});
