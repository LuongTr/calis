import express from "express";
import cors from "cors";
import { env } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { onboardingRouter } from "./routes/onboarding.js";
import { recommendationsRouter } from "./routes/recommendations.js";
import { exercisesRouter } from "./routes/exercises.js";
import { workoutsRouter } from "./routes/workouts.js";
import { historyRouter } from "./routes/history.js";

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use(profileRouter);
app.use(onboardingRouter);
app.use(recommendationsRouter);
app.use("/exercises", exercisesRouter);
app.use("/workouts", workoutsRouter);
app.use(historyRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});
