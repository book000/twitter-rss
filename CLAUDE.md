# CLAUDE.md

Claude Code がこのリポジトリで作業する際の方針とプロジェクト固有ルールを定義する。

## プロジェクト概要

Twitter (X.com) の検索結果から RSS フィードを生成するツール。`data/searches.json` に定義した検索クエリごとに RSS (XML) を生成し、GitHub Pages へ自動デプロイする。GitHub Actions が毎時 0 分に更新を実行する。スクレイピングには GUI Chromium (Xvfb) が必要。

## 開発コマンド

```bash
yarn install    # 依存関係のインストール
yarn dev        # 開発実行（ts-node-dev によるホットリロード）
yarn build      # ts-node で src/main.ts を直接実行（RSS 生成の本番実行に相当）
yarn compile    # tsc で dist/ へコンパイル
yarn start      # コンパイル済み dist/main.js を実行
yarn lint       # prettier / eslint / tsc を並列チェック（run-p）
yarn fix        # prettier / eslint の自動修正
```

- `yarn build` はコンパイルせず ts-node で直接実行する点に注意（ビルド＝RSS 生成の実行）。
- 実行には環境変数と GUI (Xvfb) が必要なため、ローカルでの動作確認は困難。型・Lint チェックを主な検証手段とする。

## アーキテクチャと主要ファイル

- `src/main.ts`: メイン処理。Twitter ログイン／Cookie キャッシュ、検索スクレイピング、RSS 生成、`output/` への書き出しまでを一括で行う。
- `src/model/collect-result.ts`: RSS の `Item` インターフェース定義。
- `data/searches.json`: 検索クエリ設定。キー = RSS ファイル名、値 = Twitter 高度検索クエリ（例: `... from:user filter:images exclude:retweets`）。`data/*` は `data/searches.json` を除き Git 管理外。
- `template.html`: 生成された RSS 一覧を表示する HTML テンプレート。
- `entrypoint.sh`: Docker 起動スクリプト。Xvfb + x11vnc を起動して `yarn build` を実行。
- `Dockerfile` / `docker-compose.yml`: `zenika/alpine-chrome:with-puppeteer-xvfb` ベース。VNC ポート 5910、タイムゾーン Asia/Tokyo。
- `.github/workflows/nodejs-ci.yml`: `book000/templates` の reusable CI（ビルド・Lint）を呼ぶ。
- `.github/workflows/update-rss.yml`: RSS 更新・GitHub Pages デプロイ（詳細は後述）。

## コーディング規約

- **会話・コメント**: 日本語。エラーメッセージは英語。
- **日本語と英数字の間**: 半角スペースを入れる。
- **フォーマット**: Prettier（`.prettierrc.yml`）。**セミコロンなし・シングルクォート**（`semi: false`, `singleQuote: true`）。手書きのコード例でもこの規約に従うこと。
- **Lint**: ESLint（`eslint.config.mjs` は `@book000/eslint-config` をそのまま再エクスポート）。
- **TypeScript**: 厳密モード（`tsconfig.json` の `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` 等が有効）。`skipLibCheck` での回避は禁止。
- **JSDoc**: 関数・インターフェースには日本語で JSDoc を記載・更新する。
- **禁止**: `any` の安易な使用、未処理の例外、認証情報・パスのハードコーディング。設定は環境変数か設定ファイルで管理する。
- ライブラリのバージョンは `package.json` を正とする（このファイルには個別バージョンを転記しない）。

## テスト

テストフレームワークは未導入。品質は型・Lint と CI で担保する。変更後は最低限、以下を確認する。

1. `yarn compile`（型エラーがないこと）
2. `yarn lint`（Prettier / ESLint / tsc が通ること）

## リポジトリ固有の注意点

### Cookie キャッシュ

- Twitter 認証 Cookie を `data/twitter-cookies.json` にキャッシュする。有効期限は `src/main.ts` の `COOKIE_EXPIRY_DAYS = 90`（**90 日**）。
- CI では毎実行時に `savedAt` を現在時刻へ更新するため、実質的な期限は「最後に CI が成功してから 90 日」となる（`update-rss.yml`）。キャッシュが無い場合は Secret `TWITTER_COOKIES_JSON` からブートストラップする。
- Cookie ファイルは Git にコミットしない（`data/*` が `.gitignore` 対象）。

### スクレイピング／ネットワーク

- `@the-convocation/twitter-scraper` でログイン・検索。`twitter-openapi-typescript` を併用。
- `cycletls` で TLS フィンガープリント（JA3）を制御。JA3 は Chrome 120 相当、UserAgent は Chrome 135 相当を `src/main.ts` にハードコード（変更時は両方の整合に注意）。
- プロキシは `PROXY_SERVER` 等の環境変数で指定（任意）。

### セキュリティ

- 認証情報・プロキシ設定はすべて環境変数（`.env` は `.gitignore` 対象）。ログに認証情報や個人情報を出力しない。
- RSS ファイル名は `sanitizeFileName()` でサニタイズ済み（パストラバーサル防止）。ファイル名生成ロジックを変更する際はこの防御を壊さないこと。

### 実行環境の制約

- **SSO 認証は非対応**。ユーザー名・パスワード（＋任意で 2FA）のみ。
- **Headless Chrome は不可**。GUI（Xvfb）が必須。
- コンテナ実行は `zenika/alpine-chrome` ベースイメージ前提。
- Node.js バージョンは `.node-version`（現在 24.18.0）を正とする。

### GitHub Actions（update-rss.yml）

- トリガー: `workflow_dispatch` / `**/*.ts` への push（main・master）/ 毎時 0 分の cron。
- `update-rss` ジョブは **self-hosted runner** で実行。apt 依存（`.github/apt-packages.txt`）を導入し、Cookie を復元、Xvfb 起動後に `yarn build` で RSS を生成、`output/` を Pages アーティファクトとしてアップロード。失敗時は Discord Webhook に通知。
- `deploy` ジョブが GitHub Pages へデプロイ（PR では実行しない）。
- メインブランチは `main` / `master` の両方に対応。

## Git・PR 運用

- **コミット**: [Conventional Commits](https://www.conventionalcommits.org/)。`<type>(<scope>): <description>`、description は日本語（例: `feat: RSS 生成機能を追加`）。
- **ブランチ**: [Conventional Branch](https://conventional-branch.github.io) 短縮形（`feat/...`, `fix/...`）。
- Renovate が作成した PR には追加コミットしない。Renovate は `book000/templates` のベース設定を使用。

## ドキュメント更新ルール

- 開発コマンドを変更したら `package.json` と本ファイルの「開発コマンド」を更新する。
- 環境変数・使用方法を変更したら `README.md` / `README.ja.md` を更新する。
- 検索クエリ仕様を変更したら `data/searches.json` の例と関連記述を更新する。
- Cookie 有効期限・スクレイピング設定など「リポジトリ固有の注意点」に書かれた事実を変更したら、本ファイルの該当箇所も更新する（記述と実装の乖離を残さない）。
