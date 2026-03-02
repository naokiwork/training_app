畏まりました。以下に、Cursor にそのまま渡して実装できる形で、
「WorkoutログをAPIなし（IndexedDB中心）＋ 課金は最小API（Stripe Webhook必須）」の設計と手順を 1本のMarkdown に統合してお渡しいたします。

> [!WARNING]
> Legacy spec. Current implementation policy is no API and no environment variables.
> Follow `lists_to_refer/no_api_no_env_full_migration_task_document.md` first.

このまま LOCAL_FIRST_MIN_API_PLAN.md として保存し、Cursor に共有くださいませ。

⸻


# Local-First Fitness App（WorkoutログAPI不要）+ Stripe最小API（運用耐性） 実装ドキュメント

本ドキュメントは、現状（Next.js App Router / Prisma+SQLite / Route Handler）を前提に、
- Workoutログを **APIなし**（ユーザー端末の IndexedDB に保存）
- ヒートマップ集計を **クライアントでローカル集計**
- サーバ側APIは **Stripe課金に必要最小限**（checkout/portal/webhook）
に極限まで削った「Local-First + Min API」構成を、Cursorで実装するための実行用手順書。

---

## 0. 方針（最小APIの結論）

### 残すAPI（必須）
- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/billing/webhook`

> Stripeサブスクを「本物として確定」するにはWebhookが必須。よってAPIゼロは不可。

### 削除できるAPI（本ドキュメントで削る）
- `/api/logs`（作成・一覧・更新・削除すべて不要）
- `/api/contributions`（不要）
- analytics/sync も不要（ローカル集計、ローカル保存で代替）

### ローカル保存（必須）
- Workoutログ一式：IndexedDB（主）
- UI状態：localStorage（補助）

---

## 1. 代償（Local-Firstの仕様として明記）
- 端末を変えるとデータ移行できない（初期）
- ブラウザデータ削除で消える（初期）
- 複数端末同期はしない（初期）

> 将来必要になったら Phase2 で “Sync API” を追加する（この段階では入れない）。

---

## 2. データモデル（IndexedDB）※Prismaと1:1対応で将来移行しやすくする

### stores（テーブル相当）
1) `sessions`
- `id: string`（uuid）
- `date: string`（YYYY-MM-DD）
- `notes?: string`
- `painFlag: boolean`
- `createdAt: number`（ms）
- `updatedAt: number`（ms）

2) `sessionExercises`
- `id: string`
- `sessionId: string`
- `exerciseId: string`
- `exerciseOrder: number`
- `createdAt: number`
- `updatedAt: number`

3) `sets`
- `id: string`
- `sessionExerciseId: string`
- `setOrder: number`
- `reps: number`
- `rpe?: number`
- `restSeconds?: number`
- `formQualityFlag: boolean`
- `createdAt: number`
- `updatedAt: number`

4) `exercises`（マスタキャッシュ）
- `id: string`
- `name: string`
- `category?: string`
- `updatedAt: number`

5) `meta`
- `key: string`
- `value: any`（最後に開いた日付、初期化フラグ等）

### indexes（必須）
- sessions: `date`
- sessionExercises: `sessionId`
- sets: `sessionExerciseId`

---

## 3. 更新戦略（壊れない最小ルール）
- すべてのレコードに `updatedAt` を持つ
- 保存は「セッション単位で upsert」してよい（丸ごと置換OK）
- 削除は最初は物理削除でOK（必要なら論理削除へ）

---

## 4. ヒートマップ（/api/contributions を廃止）
### ローカル集計の定義
- `sessions` を期間で取得
- `date` ごとに件数を集計
- Heatmapに渡す `{date, count}` を生成

---

## 5. Premium制御（ローカル中心の現実解）
### 注意
ローカルに全データがあるため「厳密に見せない」を技術的に保証できない（改ざん可能）。
月100円の低価格で API を極小にするなら「UI制限（善意前提）」を採用する。

### 推奨の機能制限例
- Free：直近30日表示のみ（過去はUIで非表示・ロック）
- Premium：全期間表示、分析解放

> 課金の真実はWebhookでDBに同期し、アプリはその状態を参照してUIを切り替える。

---

## 6. サーバ側（必須）: Stripe最小API + DB

### 6.1 必要な環境変数（.env）
```env
DATABASE_URL="file:./dev.db"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY_100JPY="price_..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"

6.2 Prisma（課金用の最小モデル）

prisma/schema.prisma に追加（WorkoutログはローカルなのでDB不要）

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  stripeCustomer StripeCustomer?
  subscription   Subscription?
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
  status               String   // trialing, active, past_due, canceled...
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

migrate:

npx prisma migrate dev -n add_billing_models
npx prisma generate


⸻

7. サーバ側（必須）: Billing実装（checkout/portal/webhook）

認証は最小化する。最初は requireUserId() を固定ユーザーで返す方式でもよい。
本番前に認証導入する場合は requireUserId() の中身だけ差し替える。

7.1 lib/prisma.ts

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

7.2 lib/auth.ts（暫定 dev user）

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

7.3 lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

7.4 lib/entitlements.ts

import { prisma } from "@/lib/prisma";

export async function isPremium(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return false;
  if (!new Set(["trialing", "active"]).has(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

7.5 POST /api/billing/checkout

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

7.6 POST /api/billing/portal

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

7.7 POST /api/billing/webhook（冪等・運用の要）

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

8. クライアント側（必須）: IndexedDB 実装（idb推奨）

8.1 依存追加

npm i idb

8.2 追加ファイル（Cursorで新規作成）
	•	lib/localdb/db.ts（IndexedDB定義）
	•	lib/localdb/repo.ts（CRUD）
	•	lib/localdb/heatmap.ts（集計）

※このドキュメントでは設計を固定する。実コードは別紙（次の作業）として貼って動く形で提供する。

⸻

9. ページ改修（API依存を削除）
	•	/log：repo.listSessions() でローカル一覧
	•	/log/new：repo.upsertSessionWithDetails() でローカル保存
	•	Heatmap：heatmap.build(days) でローカル集計

⸻

10. 実装順（最短）
	1.	Billing（DB + webhook）を通す（最初の価値：課金が成立）
	2.	IndexedDB基盤（db.ts/repo.ts）を作る
	3.	/log と /log/new をローカル保存へ置換
	4.	/api/contributions を削除し、Heatmapをローカル集計に置換
	5.	Premium UI制御（Free:30日, Premium:全期間）を適用

⸻

11. Phase2（将来）※今は実装しない
	•	端末移行：Sync API（push/pull/apply）
	•	本番ユーザー運用：本格Auth導入
	•	厳密なアクセス制御：ログをサーバ保存に移行（/api/logs復活）

⸻

12. 重要な設計決定（未決の場合ここを決める）
	•	1日=1セッション か / 同日複数セッション可 か
	•	1日1セッション：date をユニーク扱いにできる（実装が簡単）
	•	複数セッション：id + date（現在の想定通り）

本ドキュメントは “複数セッション可能” をデフォルトにしている（id主キー）。

---

必要であれば、続けて **“貼って動く実装コード一式”**（`lib/localdb/db.ts` / `repo.ts` / `heatmap.ts` と、`/log`・`/log/new` の差し替え）をそのままお渡しいたします。  
その際は、**現在の `app/log/page.tsx` と `app/log/new/page.tsx`** を貼っていただければ、UIを崩さず最小差分で当て込みます。