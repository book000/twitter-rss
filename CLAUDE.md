# Claude Code 作業方針

## 目的

このドキュメントは、Claude Code がこのプロジェクトで作業する際の方針とプロジェクト固有のルールを定義します。

## 判断記録のルール

すべての判断は、以下の形式で記録すること：

1. **判断内容の要約**: 何を決定したか
2. **検討した代替案**: どのような選択肢があったか
3. **採用しなかった案とその理由**: なぜその選択肢を選ばなかったか
4. **前提条件・仮定・不確実性**: 判断の基盤となる前提、仮定、不確実な要素
5. **他エージェントによるレビュー可否**: 他のエージェント（Codex CLI、Gemini CLI）によるレビューが必要か

前提・仮定・不確実性を明示し、仮定を事実のように扱わないこと。

## プロジェクト概要

- **目的**: Twitter (X.com) の検索結果に基づいて RSS フィードを生成するツール
- **主な機能**:
  - Twitter 検索クエリからリアルタイム更新の RSS フィードを生成
  - キーワードベースおよび高度なクエリ検索に対応
  - Docker コンテナによる簡素化されたデプロイメント対応
  - GitHub Pages への自動デプロイメント
  - 定期的な RSS 更新（1 時間ごと）

## 重要ルール

- **会話言語**: 日本語
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は日本語で記載
  - 例: `feat: RSS 生成機能を追加`
- **コード内コメント**: 日本語
- **エラーメッセージ**: 英語

## 環境のルール

- **ブランチ命名**: [Conventional Branch](https://conventional-branch.github.io) に従う
  - 形式: `<type>/<description>`
  - `<type>` は短縮形（feat, fix）を使用
  - 例: `feat/add-proxy-support`
- **GitHub リポジトリ調査**: テンポラリディレクトリに git clone して調査する
- **実行環境**: Node.js 24.13.0、Yarn 1.22.22
- **Renovate PR**: Renovate が作成した既存の PR に対して追加コミットや更新を行わない

## コード改修時のルール

- **日本語と英数字の間**: 半角スペースを挿入する
- **TypeScript 規約**:
  - `skipLibCheck` での回避は絶対にしない
  - 厳密モード（`strict: true`）を維持する
  - `noUnusedLocals`、`noUnusedParameters` を遵守する
- **docstring**: 関数・インターフェースに JSDoc を日本語で記載・更新する

## 相談ルール

他エージェントに相談することができる。以下の観点で使い分ける：

### Codex CLI (ask-codex)

- 実装コードに対するソースコードレビュー
- 関数設計、モジュール内部の実装方針などの局所的な技術判断
- アーキテクチャ、モジュール間契約、パフォーマンス／セキュリティといった全体影響の判断
- 実装の正当性確認、機械的ミスの検出、既存コードとの整合性確認

### Gemini CLI (ask-gemini)

- Twitter API の最新仕様や機能
- CycleTLS の最新仕様や機能
- Node.js / TypeScript の最新仕様や機能
- 外部一次情報の確認、最新仕様の調査、外部前提条件の検証

### 指摘への対応

他エージェントが指摘・異議を提示した場合、以下のいずれかを行う。黙殺・無言での不採用は禁止する。

- 指摘を受け入れ、判断を修正する
- 指摘を退け、その理由を明示する

以下は必ず実施する：

- 他エージェントの提案を鵜呑みにせず、その根拠や理由を理解する
- 自身の分析結果と他エージェントの意見が異なる場合は、双方の視点を比較検討する
- 最終的な判断は、両者の意見を総合的に評価した上で、自身で下す

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

## アーキテクチャと主要ファイル

### アーキテクチャサマリー

このプロジェクトは、以下のコンポーネントで構成される：

1. **src/main.ts**: メインアプリケーション（660 行）
   - Twitter スクレイピング
   - RSS フィード生成
   - GitHub Pages へのデプロイメント

2. **src/model/collect-result.ts**: RSS Item インターフェース定義

3. **data/searches.json**: 検索クエリ設定
   - キー: RSS ファイル名
   - 値: Twitter 高度な検索クエリ

4. **template.html**: RSS 出力用 HTML テンプレート

5. **entrypoint.sh**: Docker エントリーポイント
   - Xvfb + x11vnc 起動

6. **GitHub Actions**:
   - `nodejs-ci.yml`: CI ワークフロー（Reusable テンプレート使用）
   - `update-rss.yml`: RSS 自動更新・デプロイ

### 主要ディレクトリ

```
twitter-rss/
├── src/
│   ├── main.ts                 # メインアプリケーション
│   └── model/
│       └── collect-result.ts   # RSS Item インターフェース定義
├── data/
│   └── searches.json           # 検索クエリ設定
├── .github/
│   └── workflows/
│       ├── nodejs-ci.yml       # CI ワークフロー
│       └── update-rss.yml      # RSS 自動更新・デプロイ
├── .vscode/                    # VS Code 設定
├── Dockerfile                  # Docker イメージ定義
├── docker-compose.yml          # Docker Compose 設定
├── package.json                # プロジェクト構成
├── tsconfig.json               # TypeScript コンパイラ設定
├── eslint.config.mjs           # ESLint 設定
├── .prettierrc.yml             # Prettier 設定
├── template.html               # RSS 出力用 HTML テンプレート
└── entrypoint.sh               # Docker エントリーポイント
```

## 実装パターン

### 推奨パターン

#### Twitter スクレイピング

```typescript
// @the-convocation/twitter-scraper を使用
import { Scraper } from '@the-convocation/twitter-scraper';

const scraper = new Scraper();
await scraper.login(username, password);
const tweets = scraper.searchTweets(query, maxTweets);
```

#### RSS 生成

```typescript
// fast-xml-parser を使用
import { XMLBuilder } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
});
const xmlContent = builder.build(rssObject);
```

#### Cookie キャッシング

```typescript
// Cookie を保存して再利用（7 日間有効）
const cookiesPath = 'data/twitter-cookies.json';
if (fs.existsSync(cookiesPath)) {
  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
  await scraper.setCookies(cookies);
}
```

### 非推奨パターン

- **グローバル変数の乱用**: ローカル変数を使用する
- **エラーハンドリングの省略**: try-catch で適切にハンドリングする
- **ハードコーディング**: 環境変数や設定ファイルで管理する
- **型の any 使用**: 具体的な型を定義する

## テスト

### テスト方針

- **Lint チェック**: ESLint、Prettier、TypeScript の厳密モード
- **CI 検証**: GitHub Actions（`nodejs-ci.yml`）でビルド・Lint 実行
- **型安全性**: TypeScript の厳密モードで型エラーを検出

### 追加テスト条件

変更を加えた場合、以下を確認する：

1. TypeScript のコンパイルエラーがないこと（`yarn compile`）
2. Lint エラーがないこと（`yarn lint`）
3. ビルドが正常に完了すること（`yarn build`）
4. 既存の RSS 生成機能が正しく動作すること

## ドキュメント更新ルール

### 更新対象

以下のファイルを変更した場合は、関連ドキュメントを更新する：

- **README.md**: プロジェクト概要、使用方法、環境変数の説明
- **package.json**: 開発コマンドの変更時
- **data/searches.json**: 検索クエリ設定の変更時
- **Dockerfile**: Docker イメージの変更時
- **entrypoint.sh**: Docker エントリーポイントの変更時

### 更新タイミング

- 技術スタックの変更時
- 開発コマンドの変更時
- プロジェクト要件の変更時
- 品質チェックで問題検出時

## 作業チェックリスト

### 新規改修時

1. プロジェクトを理解する
2. 作業ブランチが適切であることを確認する
3. 最新のリモートブランチに基づいた新規ブランチであることを確認する
4. PR がクローズされた不要ブランチが削除済みであることを確認する
5. Yarn で依存関係をインストールする（`yarn install`）

### コミット・プッシュ前

1. Conventional Commits に従っていることを確認する
2. センシティブな情報が含まれていないことを確認する
3. Lint エラーがないことを確認する（`yarn lint`）
4. 動作確認を行う（`yarn build`）

### PR 作成前

1. PR 作成の依頼があることを確認する
2. センシティブな情報が含まれていないことを確認する
3. コンフリクトの恐れがないことを確認する

### PR 作成後

1. コンフリクトがないことを確認する
2. PR 本文が最新状態のみを網羅していることを確認する
3. `gh pr checks <PR ID> --watch` で CI を確認する
4. Copilot レビューに対応し、コメントに返信する
5. Codex のコードレビューを実施し、信頼度スコアが 50 以上の指摘対応を行う
6. PR 本文の崩れがないことを確認する

## リポジトリ固有

### Cookie キャッシング

- Twitter 認証クッキーをキャッシュ（7 日間有効）
- GitHub Actions で `data/twitter-cookies.json` をキャッシュ
- クッキー再利用で認証時間を短縮

### プロキシ・TLS フィンガープリント対応

- CycleTLS による TLS ハンドシェイク制御
- JA3 フィンガープリント設定（Chrome 120）
- UserAgent: Chrome 135（最新）

### セキュリティ

- ファイル名サニタイズ（パストラバーサル攻撃防止）
- env ファイルは `.gitignore`（`.env` 除外）
- `data/*` はリポジトリから除外（`searches.json` は除外）

### RSS 生成

- `fast-xml-parser` で XML を構築
- HTML テンプレート（`template.html`）で RSS ファイルリスト表示
- 出力: `output/` ディレクトリ

### 検索設定

`data/searches.json` の例：

```json
{
  "一途ビッチちゃん": "一途ビッチちゃん from:iro_ironon filter:images exclude:retweets",
  "#赤松健の国会にっき": "#赤松健の国会にっき from:KenAkamatsu filter:images exclude:retweets"
}
```

- キー: RSS ファイル名
- 値: Twitter 高度な検索クエリ（filter:images、exclude:retweets 対応）

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

- `TWITTER_USERNAME`, `TWITTER_PASSWORD`
- `TWITTER_EMAIL_ADDRESS` (オプション、2FA 時)
- `TWITTER_AUTH_CODE_SECRET` (2FA シークレット)

オプション：

- `PROXY_SERVER`, `PROXY_USERNAME`, `PROXY_PASSWORD` (プロキシ設定)
- `DISPLAY` (Xvfb ディスプレイ)
- `NODE_ENV` (開発/本番)

### 注意事項

- **SSO 認証**: 非サポート。ユーザー名・パスワード認証のみ対応
- **Headless Chrome**: 実装不可。GUI（Xvfb）が必須
- **コンテナ実行**: `zenika/alpine-chrome` ベースイメージが必須（Chrome + Xvfb 込み）
- **Renovate**: `book000/templates` ベース設定を使用
- **メインブランチ**: `main` と `master` 両対応（CI/CD）
- **並列処理**: npm-run-all で Lint チェック並列実行
