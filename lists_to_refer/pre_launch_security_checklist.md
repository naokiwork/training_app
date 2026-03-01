# Pre-Launch Security Checklist

Target Stack:
- Next.js (App Router) + React + TypeScript
- Route Handlers (app/api/*)
- Prisma + SQLite
- No authentication (current state)
- Workout data + free-text notes

---

# 🔴 REQUIRED (Must Complete Before Launch)

## 1. Secrets & Environment Variables

- [ ] No secrets in repository (.env excluded from git)
- [ ] No secrets in NEXT_PUBLIC_ variables
- [ ] Production secrets managed via hosting provider dashboard

### Server-side Usage Example
```ts
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}
```

---

## 2. Input Validation (All Route Handlers)

- [ ] Validate body/query/params using Zod
- [ ] Enforce string length limits
- [ ] Enforce numeric bounds
- [ ] Limit array sizes

### Example
```ts
import { z } from "zod";

const CreateLogSchema = z.object({
  sessionId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  reps: z.number().int().min(0).max(500),
  rpe: z.number().min(0).max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateLogSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  // Safe DB usage here
}
```

---

## 3. Error Leakage Prevention

- [ ] Do not return stack traces
- [ ] Do not expose Prisma error details
- [ ] Standardize 500 responses

```ts
try {
  // DB operation
} catch (e) {
  console.error("API error", e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
```

---

## 4. Rate Limiting (Write APIs)

- [ ] Rate limit POST/PUT/DELETE routes
- [ ] Return 429 on abuse

```ts
const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const cur = hits.get(ip);

  if (!cur || now - cur.ts > windowMs) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }

  if (cur.count >= limit) return false;
  cur.count++;
  return true;
}
```

---

## 5. XSS Protection (Notes Field)

- [ ] Never use dangerouslySetInnerHTML
- [ ] Render notes as plain text
- [ ] Enforce max length

---

## 6. Security Headers

- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] HSTS (after HTTPS confirmed)

### next.config.js Example
```js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

# 🟡 RECOMMENDED (Strongly Advised)

## 7. Dependency Security

- [ ] Enable Dependabot
- [ ] Run npm audit in CI
- [ ] Lockfile committed

---

## 8. Database Strategy

- [ ] Automated daily backup
- [ ] Migration plan to Postgres
- [ ] Test restore procedure

---

## 9. Monitoring & Logging

- [ ] Add Sentry or equivalent
- [ ] Log write operations
- [ ] Alert on spike of 429/500 errors

---

## 10. Authentication Roadmap

- [ ] Decide on provider (Apple / Google / Auth.js)
- [ ] Add userId column to all data models
- [ ] Enforce per-user ownership in all queries

Example Prisma future-proofing:
```prisma
model WorkoutSession {
  id        String   @id @default(uuid())
  userId    String
  createdAt DateTime @default(now())
  notes     String?
}
```

---

# 🟢 OPTIONAL (Security Maturity Improvements)

- [ ] DAST scanning (OWASP ZAP)
- [ ] External penetration testing
- [ ] Generate SBOM

---

# Deployment Phases

## Phase 0 – Immediate
- Input validation
- Error hiding
- Security headers
- Rate limiting

## Phase 1 – Pre-Launch Finalization
- Monitoring
- CI dependency checks
- Backup automation

## Phase 2 – Post-Launch Upgrade
- Add authentication
- Add user ownership enforcement
- Migrate DB to managed service

---

# Minimum Safe Release Standard

The application is considered safe for initial release when:

- All API routes validate input
- No secrets are exposed
- No stack traces leak
- Rate limiting is active
- Security headers are configured
- Backups exist

---

End of Document

