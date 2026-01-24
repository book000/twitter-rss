# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
Generate RSS feeds from Twitter/X search results with keyword and advanced query support. Docker-ready for deployment.

### 技術スタック
- **言語**: TypeScript
- **フレームワーク**: Node.js, fast-xml-parser
- **パッケージマネージャー**: yarn
- **主要な依存関係**:
  - @the-convocation/twitter-scraper@0.21.1
  - cycletls@2.0.5
  - fast-xml-parser@5.3.3
  - twitter-openapi-typescript@0.0.55
  - @book000/node-utils@1.24.32

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

### 開発コマンド
```bash
# install
yarn install

# dev
ts-node-dev -r tsconfig-paths/register ./src/main.ts

# build
ts-node -r tsconfig-paths/register ./src/main.ts

# compile
tsc -p .

# lint
run-p -c lint:prettier lint:eslint lint:tsc

# fix
run-s fix:prettier fix:eslint

```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有
- **twitter_auth**: Username/password based (no SSO support)
- **configuration**: data/searches.json for target accounts
- **output**: RSS feeds in output/ directory
- **browser_interaction**: Uses default browser for login
- **docker_support**: Dockerfile ready but TBD documentation