# コードベース構造

## ディレクトリ構成
```
twitter-rss/
├── src/                    # メインソースコード
│   ├── main.ts            # エントリーポイント
│   └── model/             # データモデル
│       └── collect-result.ts
├── data/                  # 設定・データファイル
│   └── searches.json     # Twitter検索クエリ設定
├── output/               # 実行時生成される出力（gitignore）
├── dist/                 # コンパイル済みファイル（gitignore）
├── .github/              # GitHub Actions設定
├── .vscode/              # VS Code設定
└── .serena/              # Serena設定
```

## 主要ファイル

### src/main.ts
- **エントリーポイント**: メイン実行関数
- **主要関数**:
  - `main()`: メイン処理
  - `generateRSS()`: RSS生成
  - `generateList()`: リスト生成
  - `getContent()`: コンテンツ取得
  - `isFullUser()`: ユーザー判定
  - `sanitizeFileName()`: ファイル名サニタイズ

### data/searches.json
検索クエリ設定ファイル（例）:
```json
{
  "一途ビッチちゃん": "一途ビッチちゃん from:iro_ironon filter:images exclude:retweets",
  "#赤松健の国会にっき": "#赤松健の国会にっき from:KenAkamatsu filter:images exclude:retweets"
}
```

## 設定ファイル

### TypeScript関連
- `tsconfig.json`: TypeScriptコンパイル設定
- `eslint.config.mjs`: ESLint設定（@book000/eslint-config使用）
- `.prettierrc.yml`: Prettier設定

### パッケージ管理
- `package.json`: 依存関係とスクリプト定義
- `yarn.lock`: Yarnロックファイル
- `.node-version`: Node.jsバージョン指定

### Docker関連
- `Dockerfile`: Alpine Chrome with Puppeteerベース
- `docker-compose.yml`: サービス定義
- `entrypoint.sh`: コンテナエントリーポイント
- `template.html`: HTML出力テンプレート

## 出力構造
```
output/
├── index.html            # RSS一覧ページ
├── <search-name>/
│   ├── rss.xml          # RSS フィード
│   └── timeline.json    # タイムライン生データ
```

## 依存関係パターン
- **コア**: @book000/twitterts, @book000/node-utils
- **XML処理**: fast-xml-parser
- **開発**: TypeScript, ESLint, Prettier
- **実行**: ts-node, ts-node-dev
- **ビルド**: yarn-run-all（run-p, run-s）