# Calis App — Backend Build Plan (Self-hosted)

> **Mục tiêu:** Tự build backend API thay thế Supabase, deploy lên Render.com

---

## ✅ Tech Stack

| Layer      | Công nghệ                   | Version   |
| ---------- | --------------------------- | --------- |
| Runtime    | Node.js + TypeScript        | 22+ / 5.x |
| Framework  | Express.js                  | 4.x       |
| Database   | PostgreSQL                  | 16.x      |
| ORM        | Drizzle ORM                 | 0.x       |
| Auth       | JWT (jsonwebtoken) + bcrypt | -         |
| Validation | Zod                         | 3.x       |
| Hosting    | Render.com (Free)           | -         |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── config.ts             # Env vars config
│   ├── db/
│   │   ├── index.ts          # DB connection
│   │   ├── schema.ts         # Drizzle schema
│   │   ├── migrate.ts        # Run migrations
│   │   └── seed.ts           # Seed data script
│   ├── routes/
│   │   ├── auth.ts           # POST /auth/signup, /auth/login
│   │   ├── profile.ts        # GET/PATCH /me
│   │   ├── exercises.ts      # GET /exercises, /exercises/:id
│   │   ├── workouts.ts       # GET /workouts, /workouts/:id
│   │   └── history.ts        # POST/GET /history
│   ├── middleware/
│   │   └── auth.ts           # JWT verification
│   └── types/
│       └── index.ts          # Shared types
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 📋 Step-by-Step Checklist

### Phase 1: Project Setup

- [ ] 1.1 Init Node.js project, install deps
- [ ] 1.2 Setup TypeScript config
- [ ] 1.3 Setup Drizzle ORM + PostgreSQL connection
- [ ] 1.4 Create .env.example with DATABASE_URL, JWT_SECRET

### Phase 2: Database Schema

- [ ] 2.1 Define `users` table schema (id, email, password_hash, level, etc.)
- [ ] 2.2 Define `exercises` table schema
- [ ] 2.3 Define `workout_templates` table schema
- [ ] 2.4 Define `workout_history` table schema
- [ ] 2.5 Run migration to create tables

### Phase 3: Seed Data

- [ ] 3.1 Create seed script for 20 exercises
- [ ] 3.2 Create seed script for 8 workout templates
- [ ] 3.3 Run seed script

### Phase 4: Auth API

- [ ] 4.1 POST /auth/signup — create user + return JWT
- [ ] 4.2 POST /auth/login — verify credentials + return JWT
- [ ] 4.3 JWT middleware for protected routes
- [ ] 4.4 GET /me — get current user profile
- [ ] 4.5 PATCH /me — update profile (onboarding data)

### Phase 5: Content API

- [ ] 5.1 GET /exercises — list all exercises
- [ ] 5.2 GET /exercises/:id — get single exercise
- [ ] 5.3 GET /workouts — list workout templates
- [ ] 5.4 GET /workouts/:id — get single template

### Phase 6: Workout History API

- [ ] 6.1 POST /history — save completed workout
- [ ] 6.2 GET /history — get user's workout history

### Phase 7: Update Mobile App

- [ ] 7.1 Create API client (`src/lib/api-client.ts`)
- [ ] 7.2 Update auth to call backend API
- [ ] 7.3 Update data fetching to call API
- [ ] 7.4 Update profile and history

### Phase 8: Deploy

- [ ] 8.1 Push to GitHub
- [ ] 8.2 Create Render.com account
- [ ] 8.3 Create PostgreSQL on Render
- [ ] 8.4 Deploy backend to Render
- [ ] 8.5 Update mobile .env with production API URL

---

## 📡 API Endpoints

### Auth

| Method | Endpoint     | Auth | Body                | Response        |
| ------ | ------------ | ---- | ------------------- | --------------- |
| POST   | /auth/signup | No   | { email, password } | { token, user } |
| POST   | /auth/login  | No   | { email, password } | { token, user } |

### Profile

| Method | Endpoint | Auth | Body                          | Response |
| ------ | -------- | ---- | ----------------------------- | -------- |
| GET    | /me      | Yes  | -                             | { user } |
| PATCH  | /me      | Yes  | { level, trainingStyle, ... } | { user } |

### Content (Public)

| Method | Endpoint       | Auth | Response          |
| ------ | -------------- | ---- | ----------------- |
| GET    | /exercises     | No   | Exercise[]        |
| GET    | /exercises/:id | No   | Exercise          |
| GET    | /workouts      | No   | WorkoutTemplate[] |
| GET    | /workouts/:id  | No   | WorkoutTemplate   |

### History

| Method | Endpoint | Auth | Body                                      | Response        |
| ------ | -------- | ---- | ----------------------------------------- | --------------- |
| POST   | /history | Yes  | { workoutId, totalSets, durationSeconds } | { id }          |
| GET    | /history | Yes  | -                                         | HistoryRecord[] |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "drizzle-orm": "^0.38.0",
    "postgres": "^3.4.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.24.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "drizzle-kit": "^0.30.0",
    "@types/express": "^5.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "tsx": "^4.19.0"
  }
}
```

---

## Hosting (Render.com Free Tier)

- **Web Service**: Dùng `tsx src/index.ts` để run
- **PostgreSQL**: Dùng Render PostgreSQL free (1GB storage)
- **Auto-deploy**: Kết nối GitHub → auto deploy khi push

### Chi phí: **$0/tháng**

---

## Progress Tracking

Cập nhật checklist khi hoàn thành từng bước. Mỗi phase = 1 commit.
