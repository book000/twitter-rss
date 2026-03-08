# twitter-rss

[![Node CI](https://github.com/book000/twitter-rss/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/book000/twitter-rss/actions/workflows/nodejs-ci.yml)
[![Update RSS](https://github.com/book000/twitter-rss/actions/workflows/update-rss.yml/badge.svg)](https://github.com/book000/twitter-rss/actions/workflows/update-rss.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**twitter-rss** は、Twitter (X.com) の検索結果から RSS フィードを生成する TypeScript 製ツールです。Twitter の内部 API を使用して検索クエリにマッチした最新ツイートを取得し、標準的な RSS 2.0 XML フィードに変換します。生成されたフィードは任意の RSS リーダーで購読できます。

> [!NOTE]
> 英語版ドキュメントは [README.md](README.md) をご参照ください。

## 機能

- **Twitter 検索からの RSS 2.0 フィード生成** — Twitter の検索結果を、任意の RSS リーダーで読める標準的な RSS XML ファイルに変換します。
- **Twitter 高度な検索クエリ対応** — `from:`、`filter:images`、`exclude:retweets` などの Twitter 高度な検索演算子をすべてサポートします。
- **Cookie キャッシング** — 認証 Cookie を最大 30 日間キャッシュし、ログインの繰り返しを回避します。
- **ログインリトライ制御** — HTTP 503 は指数バックオフで、エラー 399 は固定 120 秒待機でログインを自動リトライします。
- **二段階認証 (TOTP) 対応** — TOTP シークレットキーを用いた 2FA をサポートします。
- **プロキシ・TLS フィンガープリント偽装** — [CycleTLS](https://github.com/Danny-Dasilva/CycleTLS) を使用して TLS フィンガープリント (JA3) を偽装し、HTTP プロキシ経由でリクエストをルーティングします。
- **広告フィルタリング** — プロモーションツイートを自動的に除外します。
- **XSS 対策** — RSS 出力に埋め込む前に、ユーザー生成コンテンツをすべて HTML エスケープします。
- **Docker 対応** — コンテナ化デプロイのための `Dockerfile` と `docker-compose.yml` を含みます。
- **GitHub Actions + GitHub Pages** — GitHub Pages を通じて毎時自動で RSS を生成・公開します。

## 動作要件

- **Node.js** 24.x
- **Yarn** 1.22.x
- **Xvfb**（実行時に必要。内部スクレイパーが仮想ディスプレイを要求するため）
- ユーザー名・パスワードでログインできる Twitter (X.com) アカウント

> [!WARNING]
> SSO（シングルサインオン）認証は**非対応**であり、今後もサポートする予定はありません（技術的制約のため）。ユーザー名とパスワードによる認証のみ使用可能です。

## クイックスタート

### 1. リポジトリをクローン

```bash
git clone https://github.com/book000/twitter-rss.git
cd twitter-rss
```

### 2. 依存関係のインストール

```bash
yarn install
```

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成します（このファイルは `.gitignore` で除外されています）：

```dotenv
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password

# オプション：ログイン時にメール認証が求められるアカウントで必要
TWITTER_EMAIL_ADDRESS=your_email@example.com

# オプション：2FA 用 TOTP シークレットキー（Base32 エンコード）
TWITTER_AUTH_CODE_SECRET=YOUR_TOTP_SECRET

# オプション：プロキシ設定
PROXY_SERVER=http://proxy.example.com:8080
PROXY_USERNAME=proxyuser
PROXY_PASSWORD=proxypass

# オプション：RSS フィードの言語タグ（デフォルト: ja）
RSS_LANGUAGE=en

# オプション：検索ワード JSON のパス（デフォルト: data/searches.json）
SEARCH_WORD_PATH=data/searches.json
```

### 4. 検索クエリの設定

`data/searches.json` を編集します。キーが RSS ファイル名（`.xml` なし）、値が Twitter の高度な検索クエリです：

```json
{
  "my-feed-name": "from:someuser filter:images exclude:retweets",
  "keyword-search": "some keyword -filter:retweets"
}
```

使用できる演算子は [Twitter 高度な検索](https://twitter.com/search-advanced) を参照してください。

### 5. 実行

Xvfb を起動してからビルド・実行します：

```bash
Xvfb :99 -ac -screen 0 600x1000x16 &
export DISPLAY=:99
yarn build
```

RSS XML ファイルは `output/` ディレクトリに保存されます。全フィードを一覧する `output/index.html` も生成されます。

## 環境変数

| 変数名 | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `TWITTER_USERNAME` | ✅ | — | Twitter アカウントのユーザー名 |
| `TWITTER_PASSWORD` | ✅ | — | Twitter アカウントのパスワード |
| `TWITTER_EMAIL_ADDRESS` | — | — | メールアドレス（ログイン時に Twitter がメール認証を求める場合に必要） |
| `TWITTER_AUTH_CODE_SECRET` | — | — | 二段階認証の TOTP シークレットキー |
| `PROXY_SERVER` | — | — | プロキシサーバー URL（`host:port`、`http://host:port`、`https://host:port` 形式） |
| `PROXY_USERNAME` | — | — | プロキシ認証のユーザー名 |
| `PROXY_PASSWORD` | — | — | プロキシ認証のパスワード |
| `RSS_LANGUAGE` | — | `ja` | RSS フィードに埋め込む言語タグ（例：`en`、`ja`） |
| `SEARCH_WORD_PATH` | — | `data/searches.json` | 検索クエリ設定ファイルのパス |
| `DISPLAY` | — | `:99` | Xvfb の X ディスプレイ番号 |

## 検索設定（`data/searches.json`）

検索設定ファイルは JSON オブジェクトで、以下の構造を持ちます：

- **キー**：出力ファイル名（`<ファイル名>.xml` として保存）。特殊文字・スペース・パス区切り文字は自動的に除去されます。
- **値**：Twitter の検索クエリ文字列（高度な検索演算子を含む）。

設定例：

```json
{
  "my-feed": "from:myaccount filter:images exclude:retweets",
  "breaking-news": "#breakingnews lang:en -filter:retweets"
}
```

主な Twitter 検索演算子：

| 演算子 | 例 | 説明 |
|---|---|---|
| `from:` | `from:username` | 特定ユーザーのツイート |
| `to:` | `to:username` | 特定ユーザーへの返信 |
| `filter:images` | `query filter:images` | 画像付きツイート |
| `filter:videos` | `query filter:videos` | 動画付きツイート |
| `exclude:retweets` | `query exclude:retweets` | リツイートを除外 |
| `lang:` | `query lang:ja` | 言語でフィルタリング |

## Docker

### Docker Compose を使う（推奨）

1. `data/` ディレクトリを作成し、`searches.json` を配置します（[検索設定](#検索設定datasearchesjson) を参照）：

   ```bash
   mkdir -p data
   # data/searches.json を作成する（検索設定セクションを参照）
   ```

2. 認証情報を記載した `.env` ファイルを作成します（[環境変数](#環境変数) 参照）。

3. コンテナを起動します：

   ```bash
   docker compose up
   ```

   コンテナは `./data` を `/data` にマウントし、内部で Xvfb と x11vnc を起動します。デバッグ用に VNC サーバーがポート `5910` で公開されます。

### Docker イメージを手動でビルドする

```bash
docker build -t twitter-rss .
docker run --env-file .env -v "$(pwd)/data:/data" twitter-rss
```

Docker イメージは [`zenika/alpine-chrome:with-puppeteer-xvfb`](https://github.com/Zenika/alpine-chrome) をベースにしており、Chromium と Xvfb が含まれています。

## GitHub Actions（RSS の自動生成）

リポジトリには 2 つの GitHub Actions ワークフローが含まれています。

### `nodejs-ci.yml` — 継続的インテグレーション

`main`/`master` へのプッシュおよびプルリクエスト時に実行されます。[再利用可能なワークフローテンプレート](https://github.com/book000/templates) を使用してビルドと Lint チェックを実施します。

### `update-rss.yml` — RSS 更新とデプロイ

| トリガー | 説明 |
|---|---|
| `schedule: '0 * * * *'` | 毎時 0 分に実行 |
| `workflow_dispatch` | GitHub UI から手動実行 |
| `main`/`master` への `push`（`.ts` ファイル変更時） | TypeScript ソース変更時に実行 |

**セットアップ手順：**

1. **リポジトリシークレットの設定**（GitHub Settings → Secrets and variables → Actions）：

   | シークレット | 必須 | 説明 |
   |---|---|---|
   | `TWITTER_USERNAME` | ✅ | Twitter ユーザー名 |
   | `TWITTER_PASSWORD` | ✅ | Twitter パスワード |
   | `TWITTER_EMAIL_ADDRESS` | — | ログイン確認用メールアドレス |
   | `TWITTER_AUTH_CODE_SECRET` | — | 2FA の TOTP シークレット |
   | `PROXY_SERVER` | — | プロキシサーバー URL |
   | `PROXY_USERNAME` | — | プロキシユーザー名 |
   | `PROXY_PASSWORD` | — | プロキシパスワード |
   | `TWITTER_COOKIES_JSON` | — | 既存の Cookie JSON（キャッシュのブートストラップ用） |
   | `DISCORD_WEBHOOK` | — | 失敗通知用 Discord Webhook URL |

2. **GitHub Pages の有効化**（Repository Settings → Pages → Source: GitHub Actions）。

3. ワークフローは**セルフホストランナー**で実行されます。ランナーには `.github/apt-packages.txt` に記載されたパッケージ（`chromium-browser`、`xvfb`、`xauth`、`fonts-noto-cjk`、`libnss3` など）がインストールされている必要があります。

**Cookie キャッシングについて：**

ワークフローは `actions/cache` を使用して `data/twitter-cookies.json` をキャッシュします（キャッシュキー：`twitter-cookies-v2-{repo}-{run_id}`）。キャッシュが存在しない場合、`TWITTER_COOKIES_JSON` シークレットからブートストラップします。Cookie の有効期間は **30 日**です。

手動ログイン後に `TWITTER_COOKIES_JSON` シークレットを更新するには：

```bash
gh secret set TWITTER_COOKIES_JSON --body "$(cat data/twitter-cookies.json)"
```

**失敗通知：**

ワークフローが失敗した場合、設定された Webhook URL に Discord の埋め込みメッセージを送信します。

## アーキテクチャ

```
twitter-rss/
├── src/
│   ├── main.ts                 # メインアプリケーションエントリポイント
│   └── model/
│       └── collect-result.ts   # RSS Item インターフェース定義
├── data/
│   └── searches.json           # 検索クエリ設定（キー：ファイル名、値：クエリ）
├── .github/
│   ├── apt-packages.txt        # セルフホストランナー用 apt 依存パッケージ
│   └── workflows/
│       ├── nodejs-ci.yml       # CI：ビルド・Lint チェック
│       └── update-rss.yml      # RSS 更新・GitHub Pages デプロイ
├── Dockerfile                  # Docker イメージ（zenika/alpine-chrome ベース）
├── docker-compose.yml          # ローカルコンテナ実行用 Docker Compose
├── entrypoint.sh               # Docker エントリポイント（Xvfb + x11vnc + yarn build）
├── template.html               # output/index.html 用 HTML テンプレート
├── tsconfig.json               # TypeScript コンパイラ設定
├── eslint.config.mjs           # ESLint 設定
└── .prettierrc.yml             # Prettier 設定
```

**データの流れ：**

1. `main.ts` が `data/searches.json` を読み込み、検索クエリを取得します。
2. キャッシュ済み Cookie または `@the-convocation/twitter-scraper`（CycleTLS による TLS フィンガープリント偽装付き）を使用して Twitter に認証します。
3. 各クエリについて、`twitter-openapi-typescript` 経由で Twitter 検索 API を呼び出します。
4. 結果を RSS 2.0 の `<item>` 要素にマッピングします（タイトル = JST タイムスタンプ、コンテンツ = ツイートテキスト + メディア画像）。
5. `fast-xml-parser` を使用して XML を `output/<ファイル名>.xml` に書き出します。
6. `template.html` をベースに、全フィードを一覧する `output/index.html` を生成します。

## 開発

```bash
# 依存関係のインストール
yarn install

# ホットリロード付きで実行（開発用）
yarn dev

# ビルドして実行（ts-node 経由）
yarn build

# TypeScript を dist/ にコンパイルのみ（実行しない）
yarn compile

# dist/ のコンパイル済み出力を実行
yarn start

# Lint チェック（Prettier + ESLint + TypeScript、並列実行）
yarn lint

# フォーマット・Lint の自動修正
yarn fix
```

**TypeScript 設定：**

- 厳密モード有効（`strict: true`）
- `noUnusedLocals` および `noUnusedParameters` を強制
- `skipLibCheck` による回避は明示的に禁止

## セキュリティ

- **SSO 非対応**：ユーザー名・パスワード認証のみサポートします。
- **認証情報管理**：すべてのシークレットは環境変数または `.env` ファイルで管理します。`.env` および `data/twitter-cookies.json` は絶対にコミットしないでください。
- **XSS 対策**：RSS 出力に埋め込む前に、ツイートテキストとメディア URL をすべて HTML エスケープします。
- **パストラバーサル対策**：`data/searches.json` のキーから生成される RSS ファイル名をサニタイズします（`..`、`/`、`\` およびその他の危険な文字を除去）。
- **Cookie の安全管理**：認証 Cookie は `data/twitter-cookies.json`（Git 除外済み）にのみ保存され、GitHub Actions のシークレット・キャッシュ経由で安全に管理されます。

## ライセンス

MIT License — Copyright (c) 2023 Tomachi。詳細は [LICENSE](LICENSE) を参照してください。
