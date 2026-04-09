# コードスタイルと規約

## ESLint設定
- `@book000/eslint-config` を使用
- standard設定ベース
- import, n, promise プラグイン有効

## Prettier設定
```yaml
semi: false          # セミコロンなし
singleQuote: true    # シングルクォート使用
```

## TypeScript設定
- **target**: ESNext
- **strict**: true（厳密モード）
- **noImplicitAny**: true
- **noUnusedLocals**: true
- **noUnusedParameters**: true
- **noImplicitReturns**: true
- **noFallthroughCasesInSwitch**: true

## パス設定
```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]  # srcディレクトリへのエイリアス
}
```

## 命名規則
- **ファイル名**: kebab-case（例: `collect-result.ts`）
- **変数・関数**: camelCase
- **型・インターフェース**: PascalCase
- **定数**: UPPER_SNAKE_CASE

## コード構造
- **main.ts**: エントリーポイント
- **model/**: データモデル定義
- 関数は適切に分離（generateRSS, generateList等）

## 出力設定
- **outDir**: ./dist
- **sourceMap**: true
- **declaration**: true（型定義ファイル生成）
- **removeComments**: true

## 品質要件
- すべてのlintルールに従う
- TypeScript厳密型チェック通過必須
- Prettier形式統一必須
- 未使用変数・パラメータ禁止