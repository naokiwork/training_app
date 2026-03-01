# API実装が必要な項目だけの手順書（Current Codebase）

このドキュメントは、**API実装が必要な作業だけ**をステップ順でまとめた実行用手順書です。  
UIのみの見た目調整は対象外です。

---

## 0. 対象範囲

- 対象
  - `app/api/**/route.ts`
  - `lib/auth.ts`, `lib/guards.ts`, `lib/rate-limit.ts`, `lib/entitlements.ts`, `lib/monitor.ts`, `lib/schemas.ts`, `lib/stripe.ts`, `lib/env.ts`
  - `prisma/schema.prisma` と migration
- 対象外
  - API呼び出し元UIのレイアウト調整のみ
  - 色/余白/文言だけの変更

---

## 1. 事前準備（API前提）

### 1.1 環境変数を確定
- 目的: APIが起動時/実行時に失敗しない状態を作る
- 変更ファイル:
  - `.env`
- 手順:
  1. `DATABASE_URL` を設定
  2. Stripe利用時は下記を設定
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_ID_MONTHLY_100JPY`
     - `NEXT_PUBLIC_APP_URL`（公開URL）
- DoD:
  - 必須変数が欠けている場合に意図したエラーで止まる

### 1.2 DBスキーマを同期
- 目的: APIで使用するテーブル/カラムを揃える
- 変更ファイル:
  - `prisma/schema.prisma`
  - `prisma/migrations/*`
- 手順:
  1. `npx prisma migrate dev -n <name>`
  2. `npx prisma generate`
- DoD:
  - migration適用後に `@prisma/client` 生成が成功する

---

## 2. 認証API

### 2.1 register/login/logout/me を実装
- 変更ファイル:
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/me/route.ts`
  - `lib/auth.ts`
- 手順:
  1. register: email/password検証後にユーザー作成
  2. login: パスワード検証後にセッション発行、HTTPOnly Cookie設定
  3. logout: セッション無効化
  4. me: Cookieからユーザー取得
  5. 期限切れセッションの削除処理を `lib/auth.ts` に入れる
- DoD:
  - 認証成功時のみ user情報が返る
  - 不正ログインは `401`

---

## 3. 共通API基盤（Validation/Error/Guard/RateLimit）

### 3.1 入力検証を共通化（Zod）
- 変更ファイル:
  - `lib/schemas.ts`
  - 対象API各route
- 手順:
  1. payload schemaを `lib/schemas.ts` へ定義
  2. route側は `safeParse` で検証
  3. 失敗時は `400` と固定メッセージ
- DoD:
  - 不正payloadが全対象APIで `400`

### 3.2 エラーステータスを統一
- 対象:
  - `400` validation
  - `401` unauthorized
  - `403` ownership violation
  - `429` rate limit
  - `500` generic
- DoD:
  - 生の内部エラー（stack/SQL詳細）をレスポンスへ出さない

### 3.3 所有者ガード導入
- 変更ファイル:
  - `lib/guards.ts`
  - `app/api/logs/[id]/route.ts`
  - `app/api/sync/apply/route.ts`（適用先データ境界）
- 手順:
  1. `assertOwnsSession(userId, sessionId)` を作成
  2. update/delete前に必ず呼ぶ
- DoD:
  - 他ユーザーのセッション更新/削除は `403`

### 3.4 Rate Limitをwrite APIへ適用
- 変更ファイル:
  - `lib/rate-limit.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/logs/route.ts`（POST）
  - `app/api/logs/[id]/route.ts`（PATCH/DELETE）
  - `app/api/sync/push/route.ts`
  - `app/api/sync/apply/route.ts`
- DoD:
  - 閾値超過時に `429` JSON を返す

---

## 4. Workout系API

### 4.1 logs create/list/update/delete
- 変更ファイル:
  - `app/api/logs/route.ts`
  - `app/api/logs/[id]/route.ts`
- 手順:
  1. create: 認証 + schema検証 + nested create
  2. list: `userId` で必ずスコープ、必要なら free/premium の期間制限
  3. update/delete: owner guard必須
- DoD:
  - CRUDが本人データのみで成立する

### 4.2 contributions/progression/analytics
- 変更ファイル:
  - `app/api/contributions/route.ts`
  - `app/api/progression/route.ts`
  - `app/api/analytics/volume/route.ts`
- 手順:
  1. 全APIで `userId` スコープ
  2. query param（days/ids）を検証
  3. free/premium制御がある場合はここで適用
- DoD:
  - 未認証は `401`
  - 不正パラメータは `400`

### 4.3 exercises API（read-only）
- 変更ファイル:
  - `app/api/exercises/route.ts`
- 手順:
  1. 検索文字列の扱い（trim/length制限）
  2. 返却フィールドを必要最小限に制限
- DoD:
  - 空検索/部分一致検索が安定して返る

---

## 5. Sync API

### 5.1 push/pull/apply
- 変更ファイル:
  - `app/api/sync/push/route.ts`
  - `app/api/sync/pull/route.ts`
  - `app/api/sync/apply/route.ts`
- 手順:
  1. push: 現在データをスナップショット化
  2. pull: 最新スナップショットのメタを返却
  3. apply: payload検証後、本人データのみ置換
- DoD:
  - 認証なしは `401`
  - 不正payloadは `400`

### 5.2 version/checksum
- 変更ファイル:
  - `prisma/schema.prisma`（`CloudSyncSnapshot`）
  - `app/api/sync/push/route.ts`
  - `app/api/sync/pull/route.ts`
  - `app/api/sync/apply/route.ts`
- 手順:
  1. push時に `version` と `checksum` を保存
  2. pull時に `version/checksum` を返す
  3. apply時にchecksum検証、NGは `409`
- DoD:
  - 改ざん/不整合payloadを適用しない

---

## 6. Billing API（Stripe）

### 6.1 Stripe初期化と環境チェック
- 変更ファイル:
  - `lib/stripe.ts`
  - `lib/env.ts`
- 手順:
  1. Stripe clientは遅延初期化
  2. billing API呼び出し時に必須env確認
- DoD:
  - env不足時に原因が分かるエラーで停止

### 6.2 checkout/portal/webhook
- 変更ファイル:
  - `app/api/billing/checkout/route.ts`
  - `app/api/billing/portal/route.ts`
  - `app/api/billing/webhook/route.ts`
  - `prisma/schema.prisma`（`StripeEvent`, `Subscription`, `StripeCustomer`）
- 手順:
  1. checkout: customer作成/再利用 + subscription checkout session作成
  2. portal: customer portal URL作成
  3. webhook: 署名検証
  4. webhook: event idempotency（`StripeEvent.id` 重複防止）
  5. subscription状態を `Subscription` へ反映
- DoD:
  - webhookの重複受信でも二重適用しない

---

## 7. Entitlement API制御

### 7.1 premium判定ロジック
- 変更ファイル:
  - `lib/entitlements.ts`
- 手順:
  1. `trialing/active` + 期限で premium 判定
  2. API側で利用できる形で関数化
- DoD:
  - 判定結果がlogs/contributions等で再利用可能

### 7.2 free/premium制限をAPIへ適用
- 変更ファイル:
  - `app/api/logs/route.ts`
  - `app/api/contributions/route.ts`
- DoD:
  - freeユーザーの制限がAPIレスポンスに反映される

---

## 8. Observability/Security（API観点）

### 8.1 構造化ログ
- 変更ファイル:
  - `lib/monitor.ts`
  - 各API route
- 手順:
  1. 成功/失敗ログをJSON形式で統一
  2. 個人情報や機密値はログへ出さない
- DoD:
  - 障害時に route 単位で追跡できる

### 8.2 セキュリティヘッダ
- 変更ファイル:
  - `next.config.ts`
- DoD:
  - 少なくとも以下が付与される
    - `X-Content-Type-Options`
    - `Referrer-Policy`
    - `Permissions-Policy`
    - `Strict-Transport-Security`（本番HTTPS時）

---

## 9. API実装の完了確認（Runbook）

### 9.1 基本チェック
1. `npm run lint`
2. `npm run build`
3. `npm audit --audit-level=high`

### 9.2 認証
1. `POST /api/auth/register` -> `201`
2. `POST /api/auth/login` -> `200`
3. `GET /api/auth/me` -> `200`
4. `POST /api/auth/logout` -> `200`

### 9.3 logs CRUD
1. `POST /api/logs` -> `201`
2. `GET /api/logs` -> `200`
3. `PATCH /api/logs/:id` -> `200`
4. `DELETE /api/logs/:id` -> `200`

### 9.4 analytics/sync/billing
1. `GET /api/contributions` -> `200`（未認証 `401`）
2. `GET /api/analytics/volume?days=30` -> `200`
3. `POST /api/sync/push` -> `200`
4. `GET /api/sync/pull` -> `200`
5. `POST /api/sync/apply` -> `200`
6. Stripe webhook（署名付き）でsubscription同期確認

### 9.5 異常系
1. 不正入力 -> `400`
2. 未認証アクセス -> `401`
3. 他人データ更新/削除 -> `403`
4. レート超過 -> `429`
5. 内部エラー -> `500`（詳細漏えいなし）

---

## 10. 実行順（最短）

1. 事前準備（env + migration）
2. 認証API
3. 共通API基盤（validation/error/guard/rate-limit）
4. Workout API
5. Sync API
6. Billing API
7. Entitlement適用
8. Observability/Security
9. Runbookで通し確認
