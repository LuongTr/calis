import assert from "node:assert/strict";

const API_BASE_URL = (process.env.API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");

function randomEmail(): string {
  return `phase-smoke-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

async function requestJson(path: string, init?: RequestInit): Promise<{ status: number; data: any }> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  return { status: response.status, data };
}

async function main(): Promise<void> {
  console.log(`Running phase contract smoke against ${API_BASE_URL}`);

  const health = await requestJson("/health");
  assert.equal(health.status, 200, "GET /health must return 200");

  const exercises = await requestJson("/exercises");
  assert.equal(exercises.status, 200, "GET /exercises must return 200");
  assert.equal(typeof exercises.data?.contentVersion, "string", "/exercises must include contentVersion");
  assert.ok(Array.isArray(exercises.data?.exercises), "/exercises must include exercises array");
  assert.ok(exercises.data.exercises.length > 0, "/exercises must not be empty");
  assert.equal(typeof exercises.data.exercises[0]?.id, "string", "exercise item must have id");
  assert.equal(typeof exercises.data.exercises[0]?.name, "string", "exercise item must have name");

  const workouts = await requestJson("/workouts");
  assert.equal(workouts.status, 200, "GET /workouts must return 200");
  assert.equal(typeof workouts.data?.contentVersion, "string", "/workouts must include contentVersion");
  assert.ok(Array.isArray(workouts.data?.workouts), "/workouts must include workouts array");
  assert.ok(workouts.data.workouts.length > 0, "/workouts must not be empty");

  const signupEmail = randomEmail();
  const signup = await requestJson("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: signupEmail,
      password: "123456",
      displayName: "Phase Smoke"
    })
  });
  assert.equal(signup.status, 200, "POST /auth/signup must return 200");
  assert.equal(typeof signup.data?.token, "string", "signup must return token");
  const token = signup.data.token as string;

  const meBefore = await requestJson("/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(meBefore.status, 200, "GET /me must return 200");
  assert.ok(meBefore.data?.user, "/me must include user");
  assert.equal(typeof meBefore.data.user?.preferredVariants, "object", "/me.user must include preferredVariants object");

  const patchedVariants = { pushup: "incline-pushup", "squat-pattern": "box-squat" };
  const patchMe = await requestJson("/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      preferredVariants: patchedVariants
    })
  });
  assert.equal(patchMe.status, 200, "PATCH /me must return 200");

  const meAfter = await requestJson("/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(meAfter.status, 200, "GET /me after patch must return 200");
  assert.deepEqual(
    meAfter.data.user?.preferredVariants,
    patchedVariants,
    "preferredVariants must persist after PATCH /me"
  );

  console.log("Phase contract smoke passed.");
}

main().catch((error) => {
  console.error("Phase contract smoke failed:", error);
  process.exitCode = 1;
});
