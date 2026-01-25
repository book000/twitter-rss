# Gemini CLI 作業方針

## 目的

このドキュメントは、Gemini CLI がこのプロジェクトで作業する際のコンテキストと作業方針を定義します。

## 出力スタイル

- **言語**: 日本語
- **トーン**: 専門的かつ簡潔
- **形式**: Markdown（コードブロック、リスト、表を活用）

## 共通ルール

- **会話言語**: 日本語
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: RSS 生成機能を追加`
- **ブランチ命名**: [Conventional Branch](https://conventional-branch.github.io) に従う
  - 形式: `<type>/<description>`
  - `<type>` は短縮形（feat, fix）を使用
  - 例: `feat/add-proxy-support`
- **日本語と英数字の間**: 半角スペースを挿入する

## プロジェクト概要

- **目的**: Twitter (X.com) の検索結果に基づいて RSS フィードを生成するツール
- **主な機能**:
  - Twitter 検索クエリからリアルタイム更新の RSS フィードを生成
  - キーワードベースおよび高度なクエリ検索に対応
  - Docker コンテナによる簡素化されたデプロイメント対応
  - GitHub Pages への自動デプロイメント
  - 定期的な RSS 更新（1 時間ごと）

## 技術スタック

- **言語**: TypeScript 5.9.3
- **ランタイム**: Node.js 24.13.0
- **パッケージマネージャー**: Yarn 1.22.22
- **主要ライブラリ**:
  - @the-convocation/twitter-scraper 0.21.1 (Twitter スクレイピング)
  - twitter-openapi-typescript 0.0.55 (Twitter API 操作)
  - fast-xml-parser 5.3.3 (RSS XML 生成・解析)
  - cycletls 2.0.5 (プロキシ・TLS フィンガープリント対応)
  - @book000/node-utils 1.24.34 (ロギング・ユーティリティ)

## コーディング規約

- **フォーマッター**: Prettier 3.8.1（設定: `.prettierrc.yml`）
- **リンター**: ESLint 9.39.2（設定: `eslint.config.mjs`、@book000/eslint-config 1.12.40 を継承）
- **TypeScript**: 厳密モード（`strict: true`）、`noUnusedLocals`、`noUnusedParameters` 有効
- **コメント**: 日本語で記述
- **エラーメッセージ**: 英語で記述
- **skipLibCheck**: 使用禁止
- **docstring**: 関数・インターフェースに JSDoc を日本語で記載

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

## 注意事項

### セキュリティ / 機密情報

- **環境変数**: `.env` ファイルで管理し、Git にコミットしない
- **Twitter 認証情報**: 環境変数で管理（`TWITTER_USERNAME`、`TWITTER_PASSWORD`、`TWITTER_EMAIL_ADDRESS`、`TWITTER_AUTH_CODE_SECRET`）
- **プロキシ設定**: 環境変数で管理（`PROXY_SERVER`、`PROXY_USERNAME`、`PROXY_PASSWORD`）
- **ログ**: 個人情報や認証情報を出力しない
- **Cookie キャッシュ**: `data/twitter-cookies.json` は Git にコミットしない

### 既存ルールの優先

- プロジェクトの既存の ESLint・Prettier 設定を優先する
- TypeScript の厳密モードを維持する
- Renovate が作成した既存の PR に対して追加コミットや更新を行わない

### 既知の制約

- **SSO 認証**: 非サポート。ユーザー名・パスワード認証のみ対応
- **Headless Chrome**: 実装不可。GUI（Xvfb）が必須
- **コンテナ実行**: `zenika/alpine-chrome` ベースイメージが必須（Chrome + Xvfb 込み）
- **テストフレームワーク**: 導入されていない（Lint チェックで品質を担保）

## リポジトリ固有

### Cookie キャッシング

- Twitter 認証クッキーをキャッシュ（7 日間有効）
- GitHub Actions で `data/twitter-cookies.json` をキャッシュ
- クッキー再利用で認証時間を短縮

### プロキシ・TLS フィンガープリント対応

- CycleTLS による TLS ハンドシェイク制御
- JA3 フィンガープリント設定（Chrome 120）
- UserAgent: Chrome 135（最新）
- IP ブロック回避が可能

### 検索設定

`data/searches.json` にキー（RSS ファイル名）と値（Twitter 高度な検索クエリ）を定義：

```json
{
  "一途ビッチちゃん": "一途ビッチちゃん from:iro_ironon filter:images exclude:retweets",
  "#赤松健の国会にっき": "#赤松健の国会にっき from:KenAkamatsu filter:images exclude:retweets"
}
```

- `filter:images`: 画像付きツイートのみ
- `exclude:retweets`: リツイートを除外
- `from:username`: 特定ユーザーのツイートのみ

### RSS 生成

- `fast-xml-parser` で XML を構築
- HTML テンプレート（`template.html`）で RSS ファイルリスト表示
- 出力: `output/` ディレクトリ

### GitHub Actions ワークフロー

#### nodejs-ci.yml

- **トリガー**: push（main/master）、Pull Request
- **内容**: Reusable workflow テンプレート（`book000/templates` から参照）
- **実行内容**: ビルド・Lint チェック

#### update-rss.yml

- **トリガー**:
  - 手動実行（`workflow_dispatch`）
  - push（TypeScript ファイル変更時）
  - スケジュール（毎時 0 分）
- **ステップ**:
  1. リポジトリをチェックアウト
  2. Node.js セットアップ（`.node-version` から自動読み込み）
  3. Yarn キャッシュの復元・依存インストール
  4. Twitter クッキーキャッシュの復元
  5. Xvfb（仮想ディスプレイ）起動 → `yarn build` 実行 → 終了
  6. エラー時は Discord に通知
  7. 出力を GitHub Pages にアップロード・デプロイ

### Docker サポート

- **ベースイメージ**: `zenika/alpine-chrome:with-puppeteer-xvfb`
- **用途**: Chromium + Xvfb を含む完全な実行環境
- **ポート**: VNC (5910) でリモート表示可能
- **タイムゾーン**: Asia/Tokyo
- **起動時**: `entrypoint.sh` で Xvfb + x11vnc 起動

### 環境変数

必須：

- `TWITTER_USERNAME`: Twitter ユーザー名
- `TWITTER_PASSWORD`: Twitter パスワード
- `TWITTER_EMAIL_ADDRESS`: Twitter メールアドレス（オプション、2FA 時）
- `TWITTER_AUTH_CODE_SECRET`: 2FA シークレット（TOTP）

オプション：

- `PROXY_SERVER`: プロキシサーバー URL
- `PROXY_USERNAME`: プロキシユーザー名
- `PROXY_PASSWORD`: プロキシパスワード
- `DISPLAY`: Xvfb ディスプレイ番号（デフォルト: `:99`）
- `NODE_ENV`: 開発/本番環境（`development` / `production`）

### アーキテクチャ

```
twitter-rss/
├── src/
│   ├── main.ts                 # メインアプリケーション（660 行）
│   └── model/
│       └── collect-result.ts   # RSS Item インターフェース定義
├── data/
│   └── searches.json           # 検索クエリ設定
├── .github/
│   └── workflows/
│       ├── nodejs-ci.yml       # CI ワークフロー
│       └── update-rss.yml      # RSS 自動更新・デプロイ
├── Dockerfile                  # Docker イメージ定義
├── docker-compose.yml          # Docker Compose 設定
├── template.html               # RSS 出力用 HTML テンプレート
└── entrypoint.sh               # Docker エントリーポイント
```

### 外部依存関係の最新仕様確認が必要な項目

Gemini CLI に相談する際は、以下の項目について最新の仕様や変更点を確認してください：

- Twitter API の最新仕様や変更点（認証方法、レート制限、クエリ構文）
- CycleTLS の最新バージョンと機能（TLS フィンガープリント、JA3 設定）
- Node.js 24.x の最新仕様や非推奨機能
- TypeScript 5.9.x の最新機能や型システムの変更
- @the-convocation/twitter-scraper の最新バージョンと API 変更
- twitter-openapi-typescript の最新バージョンと機能
- GitHub Actions の最新仕様や制限（キャッシュサイズ、実行時間）
- Xvfb の最新バージョンと Chromium の互換性
