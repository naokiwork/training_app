# API・環境変数完全廃止: 分析・実装タスクドキュメント

## 1. 目的
- デプロイ時ビルドエラーを再発させない。
- 実行コードから API 依存と環境変数依存を完全に排除する。
- ローカルファースト（IndexedDBのみ）で主要機能を安定動作させる。

## 2. 現状ギャップ（原因分析）

### 2.1 デプロイ設定が旧構成のまま
- `wrangler.toml` に Cloudflare/OpenNext + D1 + `DATABASE_URL` が残存。
  - `main = ".open-next/worker.js"`
  - `[[d1_databases]]`
  - `[vars] DATABASE_URL`
- 対象: `wrangler.toml`

### 2.2 スクリプトが旧運用を前提
- `package.json` に Cloudflare/OpenNext 前提の `preview/deploy/upload/cf-typegen` が残存。
- `db:seed` も Prisma 前提のまま残存。
- 対象: `package.json`

### 2.3 Prisma スキーマが env 前提
- `datasource db.url = env("DATABASE_URL")` が残存。
- 対象: `prisma/schema.prisma`

### 2.4 UI に死んだ導線が残存
- ログ画面に `/pricing` へのリンクが残存（現状ルートなし）。
- 対象: `app/log/LogPageClient.tsx`

### 2.5 CI が方針逸脱を検知できない
- `lint/build` はあるが、`/api` と `process.env` の禁止チェックがない。
- 対象: `.github/workflows/ci.yml`

## 3. 実装タスク（優先度順）

### Task 1: デプロイ設定の無害化（最優先）
- `wrangler.toml` を no-api/no-env 方針に合わせる。
  - Cloudflare/OpenNext を使わないならファイルを削除、または無効化コメントを記載。
  - `[[d1_databases]]` と `[vars]` を除去。
- 完了条件:
  - `wrangler.toml` に `DATABASE_URL` が存在しない。
  - D1/Worker エントリが no-api/no-env 方針と矛盾しない。

### Task 2: npm scripts の整理
- `package.json` から旧構成スクリプトを整理。
  - 削除/非推奨化対象: `preview`, `deploy`, `upload`, `cf-typegen`, `db:seed`
  - 必要最小限: `dev`, `build`, `start`, `lint`
- 完了条件:
  - `package.json` に環境変数/Cloudflare依存運用を前提としたコマンドがない。

### Task 3: Prisma 残骸の整理
- アプリが Prisma 不使用なら `prisma/` を運用対象外または削除。
- 少なくとも `prisma/schema.prisma` の env 依存を残さない。
- 完了条件:
  - 実行経路で Prisma が参照されない。
  - ドキュメント上も Prisma 必須と誤解しない。

### Task 4: UI 不整合修正
- `app/log/LogPageClient.tsx` の `/pricing` リンクを削除またはローカル文言へ置換。
- 完了条件:
  - 死んだ内部リンクがない（主要画面で 404 導線がない）。

### Task 5: CI ガード追加
- `.github/workflows/ci.yml` に禁止チェックを追加。
  - `fetch("/api/` の存在チェック
  - `process.env` の存在チェック（`*.ts/*.tsx`）
  - `app/api/**/route.ts` 存在チェック
- 完了条件:
  - 方針違反のコードが PR 時点で fail する。

### Task 6: 既存ドキュメント整合化
- `lists_to_refer` の API/env 前提記述に「旧仕様」注記、または no-api/no-env 版へ更新。
- 完了条件:
  - 開発者が旧仕様を現行仕様と誤認しない。

## 4. 検証タスク（必須）

### 4.1 静的チェック
- API 呼び出し検出:
  - `rg "fetch\\(\"/api/|fetch\\('/api/" --glob "*.{ts,tsx}"`
- 環境変数参照検出:
  - `rg 'process\.env' --glob '*.{ts,tsx}'`
- API ルート残存検出:
  - `rg 'export async function (GET|POST|PUT|PATCH|DELETE)' app/api --glob '**/route.ts'`

期待値:
- いずれもアプリ実装側は 0 件

### 4.2 ビルド検証
- `npm run lint`
- `npm run build`

期待値:
- lint: error 0
- build: 成功

### 4.3 画面動作確認
- `/`, `/log`, `/log/new`, `/exercises`, `/plans`
- 404導線がないこと（特に `/pricing`）

## 5. ロールバック方針
- 変更を以下の単位で分割コミットする。
  1. 設定整理（wrangler/package）
  2. UI整合修正
  3. CIガード
  4. ドキュメント
- 不具合時は単位ごとに戻せるようにする。
- IndexedDB データを壊す変更（キー変更・ストア削除）は別チケットに分離する。

## 6. 注意事項
- 目的は「機能追加」ではなく「依存削減」。
- 既存のローカルログ作成/編集/閲覧は維持する。
- 旧Cloudflare/OpenNext運用を復活させる場合は、別ブランチで再設計する。
