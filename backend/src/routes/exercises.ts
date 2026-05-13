import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { exercises } from "../db/schema.js";

export const exercisesRouter = Router();

exercisesRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(exercises).orderBy(asc(exercises.id));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

exercisesRouter.get("/:id", async (req, res, next) => {
  try {
    const row = await db.query.exercises.findFirst({
      where: eq(exercises.id, req.params.id)
    });
    if (!row) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }
    res.json(row);
  } catch (error) {
    next(error);
  }
});
