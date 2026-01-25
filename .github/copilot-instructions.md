# GitHub Copilot Instructions

## プロジェクト概要

- 目的: Twitter (X.com) の検索結果に基づいて RSS フィードを生成するツール
- 主な機能: Twitter 検索クエリからリアルタイム更新の RSS フィードを生成、キーワードベースおよび高度なクエリ検索に対応、Docker コンテナによるデプロイメント、GitHub Pages への自動デプロイ、定期的な RSS 更新（1 時間ごと）
- 対象ユーザー: 開発者、Twitter の特定検索結果を RSS で購読したいユーザー

## 共通ルール

- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。形式: `<type>(<scope>): <description>`。`<description>` は日本語で記載。例: `feat: RSS 生成機能を追加`
- ブランチ命名は Conventional Branch に従う。形式: `<type>/<description>`。`<type>` は短縮形（feat, fix）を使用。例: `feat/add-proxy-support`
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック

- 言語: TypeScript 5.9.3
- ランタイム: Node.js 24.13.0
- パッケージマネージャー: Yarn 1.22.22
- 主要ライブラリ:
  - @the-convocation/twitter-scraper 0.21.1 (Twitter スクレイピング)
  - twitter-openapi-typescript 0.0.55 (Twitter API 操作)
  - fast-xml-parser 5.3.3 (RSS XML 生成・解析)
  - cycletls 2.0.5 (プロキシ・TLS フィンガープリント対応)
  - @book000/node-utils 1.24.34 (ロギング・ユーティリティ)

## コーディング規約

- フォーマッター: Prettier 3.8.1（設定: `.prettierrc.yml`）
- リンター: ESLint 9.39.2（設定: `eslint.config.mjs`、@book000/eslint-config 1.12.40 を継承）
- TypeScript: 厳密モード（`strict: true`）、`noUnusedLocals`、`noUnusedParameters` 有効
- コメント: 日本語で記述
- エラーメッセージ: 英語で記述
- `skipLibCheck` での回避は絶対に禁止
- 関数・インターフェースには JSDoc を日本語で記載

## 開発コマンド

```bash
# 依存関係のインストール
yarn install

# 開発（ホットリロード対応）
yarn dev

# ビルド（TypeScript をコンパイルして実行）
yarn build

# コンパイルのみ（JavaScript にコンパイル）
yarn compile

# 実行（コンパイル済み JavaScript を実行）
yarn start

# Lint チェック（Prettier + ESLint + TypeScript の全チェック、並列実行）
yarn lint

# 自動修正（Prettier・ESLint の自動修正）
yarn fix
```

## テスト方針

- テストフレームワークは導入されていない（代わりに Lint チェックで品質を担保）
- CI/CD で GitHub Actions によりビルド・Lint チェックを実行
- 新機能追加時は、既存コードの型安全性を維持すること

## セキュリティ / 機密情報

- 環境変数は `.env` ファイルで管理し、Git にコミットしない（`.env` は `.gitignore` に含まれる）
- Twitter 認証情報（`TWITTER_USERNAME`、`TWITTER_PASSWORD`、`TWITTER_EMAIL_ADDRESS`、`TWITTER_AUTH_CODE_SECRET`）は環境変数で管理
- プロキシ設定（`PROXY_SERVER`、`PROXY_USERNAME`、`PROXY_PASSWORD`）も環境変数で管理
- ログに個人情報や認証情報を出力しない
- Cookie キャッシュ（`data/twitter-cookies.json`）は Git にコミットしない

## ドキュメント更新

以下のファイルを変更した場合は、関連ドキュメントを更新すること：

- `README.md`: プロジェクト概要、使用方法、環境変数の説明
- `package.json`: 開発コマンドの変更時
- `data/searches.json`: 検索クエリ設定の変更時

## リポジトリ固有

- **SSO 認証**: 非サポート。ユーザー名・パスワード認証のみ対応
- **Headless Chrome**: 実装不可。GUI（Xvfb）が必須
- **コンテナ実行**: `zenika/alpine-chrome` ベースイメージが必須（Chrome + Xvfb 込み）
- **Cookie 管理**: 7 日間キャッシュで API レート制限を軽減
- **Renovate**: `book000/templates` ベース設定を使用。Renovate が作成した既存の PR に対して追加コミットや更新を行わない
- **メインブランチ**: `main` と `master` 両対応（CI/CD）
- **プロキシ対応**: CycleTLS により IP ブロック回避可能
- **並列処理**: yarn-run-all で Lint チェック並列実行
- **検索設定**: `data/searches.json` にキー（RSS ファイル名）と値（Twitter 高度な検索クエリ）を定義
- **RSS 生成**: `output/` ディレクトリに出力、`template.html` で RSS ファイルリスト表示
- **GitHub Actions**: 定期実行（毎時 0 分）、手動実行、TypeScript ファイル変更時にトリガー
- **Cookie キャッシング**: GitHub Actions で `data/twitter-cookies.json` をキャッシュ（7 日間有効）
