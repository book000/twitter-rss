# 推奨コマンド一覧

## 基本開発コマンド

### 開発・実行
```bash
# 開発モード（ts-node-dev）
yarn dev

# 本番ビルド（TypeScript実行）
yarn build

# コンパイル済みファイル実行
yarn start

# TypeScriptコンパイル
yarn compile
```

### 品質管理
```bash
# 全品質チェック（prettier + eslint + tsc）
yarn lint

# 個別チェック
yarn lint:prettier    # Prettier形式チェック
yarn lint:eslint      # ESLint
yarn lint:tsc         # TypeScript型チェック

# 自動修正
yarn fix              # prettier + eslint自動修正
yarn fix:prettier     # Prettier自動修正
yarn fix:eslint       # ESLint自動修正
```

### 依存関係管理
```bash
# 依存関係インストール
yarn install

# パッケージ追加
yarn add <package-name>
yarn add -D <package-name>  # devDependencies

# 依存関係更新
yarn upgrade
```

## Docker関連
```bash
# イメージビルド
docker build -t twitter-rss .

# コンテナ実行
docker-compose up
```

## 設定・データ管理
```bash
# 検索設定編集
vim data/searches.json

# 出力結果確認
open output/index.html     # macOS
xdg-open output/index.html # Linux
```

## Git関連
```bash
git status
git add .
git commit -m "message"
git push
```

## システム関連（Linux環境）
```bash
ls -la              # ファイル一覧表示
cd <directory>      # ディレクトリ移動
grep -r "pattern"   # ファイル内検索
find . -name "*.ts" # ファイル検索
```