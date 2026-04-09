# 環境設定とセットアップ

## 必要な環境変数
```bash
# Twitter認証情報（必須）
export TWITTER_USERNAME=<your twitter account>
export TWITTER_PASSWORD=<your twitter password>

# Docker環境での追加設定
export NODE_ENV=production
export TZ=Asia/Tokyo
export DISPLAY=:99
export CHROMIUM_PATH=/usr/bin/chromium-browser
export API_PORT=80
export DEBUG_OUTPUT_RESPONSE=true
export SEARCH_WORD_PATH=/data/searches.json
export LOG_DIR=/data/logs/
export USER_DATA_DIRECTORY=/data/userdata/
export DEBUG_RESPONSE_DIRECTORY=/data/responses/
```

## セットアップ手順

### 1. 基本セットアップ
```bash
# リポジトリクローン
git clone git@github.com:book000/twitter-rss.git
cd twitter-rss

# 依存関係インストール
yarn install

# 環境変数設定
export TWITTER_USERNAME=<your-username>
export TWITTER_PASSWORD=<your-password>
```

### 2. 検索設定
```bash
# 検索クエリ編集
vim data/searches.json
```

### 3. 実行確認
```bash
# 開発モードで実行
yarn dev

# または本番ビルドで実行
yarn build
```

### 4. 出力確認
```bash
# 結果表示（macOS）
open output/index.html

# 結果表示（Linux）
xdg-open output/index.html
```

## Docker環境セットアップ

### 前提条件
- Docker, Docker Compose インストール済み
- Twitter認証情報準備

### 実行手順
```bash
# イメージビルド
docker build -t twitter-rss .

# サービス起動
docker-compose up

# バックグラウンド実行
docker-compose up -d
```

## 開発環境要件
- **Node.js**: `.node-version` で指定されたバージョン
- **Yarn**: package.json の packageManager で指定
- **Git**: バージョン管理
- **Docker**: コンテナ実行（オプション）

## 認証に関する注意事項
- **SSOは非対応**: 技術的制約により今後も対応予定なし
- **パスワード認証のみ**: ユーザー名/パスワードでのログインのみ
- **ブラウザ経由**: デフォルトブラウザでのTwitterログインを利用
- **セッション管理**: ユーザーデータディレクトリでセッション保持

## トラブルシューティング
- **認証エラー**: 環境変数の設定確認
- **依存関係エラー**: `yarn install` 再実行
- **ビルドエラー**: TypeScript設定確認
- **Docker問題**: ポート競合、権限確認