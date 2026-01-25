# AI エージェント作業方針

## 目的

このドキュメントは、一般的な AI エージェントがこのプロジェクトで作業する際の共通方針を定義します。

## 基本方針

- **会話言語**: 日本語
- **コード内コメント**: 日本語
- **エラーメッセージ**: 英語
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: RSS 生成機能を追加`
- **ブランチ命名**: [Conventional Branch](https://conventional-branch.github.io) に従う
  - 形式: `<type>/<description>`
  - `<type>` は短縮形（feat, fix）を使用
  - 例: `feat/add-proxy-support`
- **日本語と英数字の間**: 半角スペースを挿入する

## 判断記録のルール

すべての判断は、以下の形式で記録すること：

1. **判断内容の要約**: 何を決定したか
2. **検討した代替案**: どのような選択肢があったか
3. **採用しなかった案とその理由**: なぜその選択肢を選ばなかったか
4. **前提条件・仮定・不確実性**: 判断の基盤となる前提、仮定、不確実な要素

前提・仮定・不確実性を明示し、仮定を事実のように扱わないこと。

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

## 開発手順（概要）

1. **プロジェクト理解**
   - README.md を読む
   - 主要ファイル（`src/main.ts`、`data/searches.json`）を確認する

2. **依存関係インストール**
   ```bash
   yarn install
   ```

3. **変更実装**
   - TypeScript の厳密モード（`strict: true`）を遵守する
   - `skipLibCheck` での回避は絶対にしない
   - 関数・インターフェースに JSDoc を日本語で記載する

4. **テストと Lint/Format 実行**
   ```bash
   # Lint チェック（Prettier + ESLint + TypeScript の全チェック）
   yarn lint

   # 自動修正
   yarn fix

   # ビルド
   yarn build
   ```

5. **コミット**
   - Conventional Commits に従う
   - センシティブな情報が含まれていないことを確認する

## コーディング規約

- **フォーマッター**: Prettier 3.8.1（設定: `.prettierrc.yml`）
- **リンター**: ESLint 9.39.2（設定: `eslint.config.mjs`、@book000/eslint-config 1.12.40 を継承）
- **TypeScript**: 厳密モード（`strict: true`）、`noUnusedLocals`、`noUnusedParameters` 有効
- **コメント**: 日本語で記述
- **エラーメッセージ**: 英語で記述

## セキュリティ / 機密情報

- **環境変数**: `.env` ファイルで管理し、Git にコミットしない
- **Twitter 認証情報**: 環境変数で管理（`TWITTER_USERNAME`、`TWITTER_PASSWORD`、`TWITTER_EMAIL_ADDRESS`、`TWITTER_AUTH_CODE_SECRET`）
- **プロキシ設定**: 環境変数で管理（`PROXY_SERVER`、`PROXY_USERNAME`、`PROXY_PASSWORD`）
- **ログ**: 個人情報や認証情報を出力しない
- **Cookie キャッシュ**: `data/twitter-cookies.json` は Git にコミットしない

## リポジトリ固有

### 技術的制約

- **SSO 認証**: 非サポート。ユーザー名・パスワード認証のみ対応
- **Headless Chrome**: 実装不可。GUI（Xvfb）が必須
- **コンテナ実行**: `zenika/alpine-chrome` ベースイメージが必須（Chrome + Xvfb 込み）

### Cookie キャッシング

- Twitter 認証クッキーをキャッシュ（7 日間有効）
- GitHub Actions で `data/twitter-cookies.json` をキャッシュ
- クッキー再利用で認証時間を短縮

### プロキシ・TLS フィンガープリント対応

- CycleTLS による TLS ハンドシェイク制御
- JA3 フィンガープリント設定（Chrome 120）
- UserAgent: Chrome 135（最新）

### 検索設定

`data/searches.json` にキー（RSS ファイル名）と値（Twitter 高度な検索クエリ）を定義：

```json
{
  "一途ビッチちゃん": "一途ビッチちゃん from:iro_ironon filter:images exclude:retweets",
  "#赤松健の国会にっき": "#赤松健の国会にっき from:KenAkamatsu filter:images exclude:retweets"
}
```

### RSS 生成

- `fast-xml-parser` で XML を構築
- HTML テンプレート（`template.html`）で RSS ファイルリスト表示
- 出力: `output/` ディレクトリ

### GitHub Actions

- **定期実行**: 毎時 0 分に RSS を自動更新
- **手動実行**: `workflow_dispatch` でトリガー可能
- **TypeScript ファイル変更時**: 自動で RSS を再生成

### 環境変数

必須：

- `TWITTER_USERNAME`, `TWITTER_PASSWORD`
- `TWITTER_EMAIL_ADDRESS` (オプション、2FA 時)
- `TWITTER_AUTH_CODE_SECRET` (2FA シークレット)

オプション：

- `PROXY_SERVER`, `PROXY_USERNAME`, `PROXY_PASSWORD` (プロキシ設定)
- `DISPLAY` (Xvfb ディスプレイ)
- `NODE_ENV` (開発/本番)

### 注意事項

- Renovate が作成した既存の PR に対して追加コミットや更新を行わない
- メインブランチは `main` と `master` 両対応（CI/CD）
- 並列処理は yarn-run-all（`run-p` / `run-s`）で Lint チェック並列実行
