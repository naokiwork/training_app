以下に、Cursor にそのまま渡して実装できる前提で、必要作業とコード一式を 1本の Markdown に統合してお渡しいたします。
このまま BILLING_AND_GATING_IMPLEMENTATION.md などとして保存し、Cursor に共有してくださいませ。

⸻


# Fitness App: 初月無料 → 2ヶ月目から月100円（Stripe）+ ユーザー分離 + Premiumゲート（運用耐性）実装手順書

本ドキュメントは、現状（認証なし / Prisma+SQLite / Next.js Route Handler）から、
- Stripeサブスク（初月無料=30日トライアル、2ヶ月目から月100円）
- Webhookでの課金状態同期（冪等）
- DBベースの Entitlement（premium判定）
- Workoutデータのユーザー分離（userId付与）
- APIの所有者チェック
- 無料ユーザーの閲覧制限（直近30日）
までを「貼って動く」形で一気に導入するための実装ガイド。

---

## 0. 前提
- Next.js（App Router）
- Prisma + SQLite
- 既存モデル：Exercise / WorkoutSession / WorkoutExercise / WorkoutSet
- 既存API：GET /api/exercises, POST /api/logs, GET /api/contributions
- 認証：未実装（login/signupなし）

> 認証は未実装のため、暫定として `requireUserId()` が開発用固定ユーザーを upsert します。
> 後で NextAuth / Clerk 等に移行する際は `requireUserId()` の実装だけ差し替えれば他は温存できます。

---

## 1. 追加する環境変数（.env）
```env
# Prisma
DATABASE_URL="file:./dev.db"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY_100JPY="price_..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"


⸻

2. ファイル配置（追加/更新の一覧）

追加（new）
	•	lib/prisma.ts
	•	lib/auth.ts
	•	lib/stripe.ts
	•	lib/entitlements.ts
	•	lib/guards.ts
	•	app/api/billing/checkout/route.ts
	•	app/api/billing/portal/route.ts
	•	app/api/billing/webhook/route.ts
	•	app/pricing/page.tsx
	•	app/account/billing/page.tsx

更新（modify）
	•	prisma/schema.prisma
	•	app/api/logs/route.ts
	•	app/api/contributions/route.ts
	•	（任意）app/plans/page.tsx（premiumゲート）

⸻

3. Prisma schema 拡張（課金基盤 + ユーザー + 冪等Webhook）

3-1) 課金系モデル追加（User / StripeCustomer / Subscription / StripeEvent）

prisma/schema.prisma に以下を追記：

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  stripeCustomer StripeCustomer?
  subscription   Subscription?

  workoutSessions  WorkoutSession[]
  workoutExercises WorkoutExercise[]
  workoutSets      WorkoutSet[]
}

model StripeCustomer {
  id               String @id @default(cuid())
  userId           String @unique
  stripeCustomerId String @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  status               String
  currentPeriodEnd     DateTime?
  trialEnd             DateTime?
  cancelAtPeriodEnd    Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model StripeEvent {
  id          String   @id
  type        String
  created     Int
  processedAt DateTime @default(now())
}


⸻

4. Workoutデータのユーザー分離（userId追加）

無料/有料ゲート以前に、実運用で必須：データをユーザー単位で分離。

4-1) Workout系モデルに userId を追加（NOT NULL）

既存モデルを以下のように修正（Exerciseはマスタなので userId 不要）：

model WorkoutSession {
  id        String   @id @default(cuid())
  userId    String
  date      String
  notes     String?
  painFlag  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises WorkoutExercise[]

  @@index([date])
  @@index([userId, date])
}

model WorkoutExercise {
  id            String @id @default(cuid())
  userId        String
  sessionId     String
  exerciseId    String
  exerciseOrder Int

  user     User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  session  WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exercise Exercise       @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  sets     WorkoutSet[]

  @@index([sessionId])
  @@index([exerciseId])
  @@index([userId, sessionId])
}

model WorkoutSet {
  id                String   @id @default(cuid())
  userId            String
  workoutExerciseId String
  setOrder          Int
  reps              Int
  rpe               Float?
  restSeconds       Int?
  formQualityFlag   Boolean  @default(false)
  createdAt         DateTime @default(now())

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workoutExercise WorkoutExercise @relation(fields: [workoutExerciseId], references: [id], onDelete: Cascade)

  @@index([workoutExerciseId])
  @@index([userId, workoutExerciseId])
}

既存データがすでに入っていて migrate が失敗する場合：
一度 userId String?（nullable）で migrate → 既存行へ dev userId を UPDATE → userId String に戻して migrate
が安全です（必要なら手順追加します）。

⸻

5. Prisma migrate 実行

npx prisma migrate dev -n add_billing_models_and_user_scope
npx prisma generate


⸻

6. 共通ライブラリ（lib/*）

6-1) Prisma クライアント

lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

6-2) 認証（暫定 dev user）

lib/auth.ts

import { prisma } from "@/lib/prisma";

export async function requireUserId(): Promise<string> {
  const email = "dev@example.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true },
  });
  return user.id;
}

6-3) Stripe 初期化

lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

6-4) Entitlement（premium判定）

lib/entitlements.ts

import { prisma } from "@/lib/prisma";

export async function getSubscription(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function isPremium(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;

  const okStatus = new Set(["trialing", "active"]);
  if (!okStatus.has(sub.status)) return false;

  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

6-5) 所有者チェック

lib/guards.ts

import { prisma } from "@/lib/prisma";

export async function assertOwnsSession(userId: string, sessionId: string) {
  const s = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!s) throw new Error("FORBIDDEN_SESSION");
}

export async function assertOwnsWorkoutExercise(userId: string, workoutExerciseId: string) {
  const we = await prisma.workoutExercise.findFirst({
    where: { id: workoutExerciseId, userId },
    select: { id: true },
  });
  if (!we) throw new Error("FORBIDDEN_WORKOUT_EXERCISE");
}


⸻

7. Stripe 課金フロー（Checkout + Portal + Webhook）

7-1) Checkout Session 作成 API（サブスク + 30日トライアル）

app/api/billing/checkout/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

export async function POST() {
  const userId = await requireUserId();

  const existing = await prisma.stripeCustomer.findUnique({ where: { userId } });

  const customerId =
    existing?.stripeCustomerId ??
    (await (async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        metadata: { userId },
      });
      await prisma.stripeCustomer.create({
        data: { userId, stripeCustomerId: customer.id },
      });
      return customer.id;
    })());

  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_100JPY!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30,
      metadata: { userId },
    },
    success_url: `${appUrl}/account/billing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}

7-2) Customer Portal（解約/支払い方法変更をStripeに委譲）

app/api/billing/portal/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

export async function POST() {
  const userId = await requireUserId();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const sc = await prisma.stripeCustomer.findUnique({ where: { userId } });
  if (!sc) return NextResponse.json({ error: "No stripe customer" }, { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: sc.stripeCustomerId,
    return_url: `${appUrl}/account/billing`,
  });

  return NextResponse.json({ url: portal.url });
}

7-3) Webhook（署名検証 + DB同期 + 冪等）

app/api/billing/webhook/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.userId as string | undefined) ?? undefined;
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const sc = await prisma.stripeCustomer.findUnique({ where: { stripeCustomerId: customerId } });
    resolvedUserId = sc?.userId;
  }

  if (!resolvedUserId) return;

  const priceId = sub.items.data[0]?.price?.id ?? null;

  await prisma.subscription.upsert({
    where: { userId: resolvedUserId },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId ?? undefined,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      userId: resolvedUserId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId ?? undefined,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const already = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (already) return NextResponse.json({ received: true });

  await prisma.stripeEvent.create({
    data: { id: event.id, type: event.type, created: event.created },
  });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(sub);
        break;
      }
      default:
        break;
    }
  } catch {
    // 落とさない（Stripeは再送するため）
  }

  return NextResponse.json({ received: true });
}


⸻

8. 無料/有料ゲートの仕様（本ドキュメント採用の境界）
	•	無料：記録作成OK / 閲覧は直近30日まで
	•	Premium：閲覧無制限

⸻

9. /api/logs をユーザー分離 + 閲覧制限対応へ

app/api/logs/route.ts（置き換え）

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";

export const runtime = "nodejs";

type CreateLogBody = {
  date: string;
  notes?: string;
  painFlag?: boolean;
  exercises: Array<{
    exerciseId: string;
    exerciseOrder: number;
    sets: Array<{
      setOrder: number;
      reps: number;
      rpe?: number;
      restSeconds?: number;
      formQualityFlag?: boolean;
    }>;
  }>;
};

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = (await req.json()) as CreateLogBody;

  if (!body?.date || !Array.isArray(body.exercises)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const created = await prisma.workoutSession.create({
    data: {
      userId,
      date: body.date,
      notes: body.notes ?? null,
      painFlag: !!body.painFlag,
      exercises: {
        create: body.exercises.map((e) => ({
          userId,
          exerciseId: e.exerciseId,
          exerciseOrder: e.exerciseOrder,
          sets: {
            create: e.sets.map((s) => ({
              userId,
              setOrder: s.setOrder,
              reps: s.reps,
              rpe: s.rpe ?? null,
              restSeconds: s.restSeconds ?? null,
              formQualityFlag: !!s.formQualityFlag,
            })),
          },
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, sessionId: created.id });
}

export async function GET(req: Request) {
  const userId = await requireUserId();
  const premium = await isPremium(userId);

  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  const minDate = premium ? null : daysAgoIso(30);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      ...(date ? { date } : {}),
      ...(minDate ? { date: { gte: minDate } } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        orderBy: { exerciseOrder: "asc" },
        include: {
          exercise: true,
          sets: { orderBy: { setOrder: "asc" } },
        },
      },
    },
  });

  return NextResponse.json({ premium, minDate, sessions });
}


⸻

10. /api/contributions をユーザー分離 + 無料は直近30日制限へ

app/api/contributions/route.ts（置き換え）

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";

export const runtime = "nodejs";

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export async function GET(req: Request) {
  const userId = await requireUserId();
  const premium = await isPremium(userId);

  const url = new URL(req.url);
  const daysParam = Number(url.searchParams.get("days") ?? "");
  const days = Number.isFinite(daysParam) ? Math.max(1, Math.min(daysParam, 365)) : 365;

  const effectiveDays = premium ? days : Math.min(days, 30);

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (effectiveDays - 1));

  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, date: { gte: startIso, lte: endIso } },
    select: { date: true },
  });

  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + 1);

  const contributions: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < effectiveDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toIsoDate(d);
    contributions.push({ date: iso, count: map.get(iso) ?? 0 });
  }

  return NextResponse.json({
    premium,
    days: effectiveDays,
    start: startIso,
    end: endIso,
    contributions,
  });
}


⸻

11. 画面（Pricing / Billing）

11-1) /pricing

app/pricing/page.tsx

"use client";

export default function PricingPage() {
  const start = async () => {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Premium</h1>
      <p>初月無料。2ヶ月目から月100円。</p>
      <button onClick={start}>初月無料で始める</button>
    </main>
  );
}

11-2) /account/billing

app/account/billing/page.tsx

"use client";

export default function BillingPage() {
  const openPortal = async () => {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Billing</h1>
      <button onClick={openPortal}>支払い管理 / 解約を開く</button>
    </main>
  );
}


⸻

12. （任意）/plans を premium 限定

app/plans/page.tsx（例）

import { requireUserId } from "@/lib/auth";
import { isPremium } from "@/lib/entitlements";

export default async function PlansPage() {
  const userId = await requireUserId();
  const premium = await isPremium(userId);

  if (!premium) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Plans</h1>
        <p>この機能は Premium でご利用いただけます。</p>
        <a href="/pricing">プランを見る</a>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Plans</h1>
      <p>Premium 機能</p>
    </main>
  );
}


⸻

13. ローカルでWebhookを通す（テスト）
	•	Stripeをテストモードで設定
	•	Stripe CLIで webhook をローカルに転送
	•	受け取った whsec_... を STRIPE_WEBHOOK_SECRET に設定
	•	Checkoutを実行 → Webhook → DBのSubscriptionが trialing / active になることを確認

⸻

14. Cursor での実装手順（チェックリスト）
	1.	.env を追加（Stripeキー/PriceID）
	2.	schema.prisma を更新（課金モデル追加 + workout userId追加）
	3.	migrate 実行
	4.	lib/* を追加
	5.	app/api/billing/* を追加
	6.	app/api/logs と app/api/contributions を置換
	7.	/pricing と /account/billing を追加
	8.	動作確認（/pricing → Checkout → webhook → subscription反映 → /api/logs・/api/contributions の premium/minDate 動作）

⸻

15. 次にやるべき（本番化の最後の壁）
	•	本物の認証導入（NextAuth/Clerk等）→ requireUserId() を差し替え
	•	既存UI（/log, /log/new）の payload 形状に合わせて API body を微調整
	•	無料ユーザーが 30日以前を見ようとした際の UX（/pricing誘導）をフロントに追加

---

必要でしたら、次は「**あなたの現状の `app/log/page.tsx` と `app/log/new/page.tsx` に最小差分で当て込む版**」も、同じく **Cursor でそのまま適用できるパッチ形式**でお作りいたします。  
該当2ファイルの中身を貼っていただければ、UIを崩さずに整合まで一気に仕上げます。