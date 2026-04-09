# タスク完了時のチェックリスト

## 必須実行コマンド
タスク完了時は以下を**必ず**実行してください：

### 1. 品質チェック（必須）
```bash
# 全品質チェック実行
yarn lint

# 個別チェック（問題がある場合）
yarn lint:prettier  # コードフォーマット
yarn lint:eslint    # コード品質
yarn lint:tsc       # TypeScript型チェック
```

### 2. 自動修正（推奨）
```bash
# 自動修正可能な問題を修正
yarn fix

# または個別実行
yarn fix:prettier
yarn fix:eslint
```

### 3. ビルド確認
```bash
# TypeScriptコンパイル確認
yarn compile

# または実際のビルド実行
yarn build
```

## チェック項目

### ✅ コード品質
- [ ] ESLintエラーなし
- [ ] Prettierフォーマット適用
- [ ] TypeScript型エラーなし
- [ ] 未使用変数・import削除

### ✅ 機能確認
- [ ] メイン機能の動作確認
- [ ] エラーハンドリング適切
- [ ] 設定ファイル整合性確認

### ✅ 設定ファイル
- [ ] `data/searches.json` 形式正しい
- [ ] 環境変数設定確認
- [ ] Docker設定（必要な場合）

### ✅ 出力確認
- [ ] `output`フォルダ生成確認
- [ ] RSS/HTML出力正常
- [ ] ブラウザ表示確認

## トラブルシューティング

### Lintエラーが解決しない場合
1. `yarn fix` で自動修正試行
2. 手動でESLintルール確認
3. TypeScript型定義見直し

### ビルドエラーの場合
1. `yarn compile:test` で型チェック
2. import/export文確認
3. 依存関係インストール確認

## 完了前の最終確認
```bash
# 最終チェックフロー
yarn lint && yarn compile && echo "✅ 品質チェック完了"
```

品質チェックが通過したら、コミット・プッシュを実行してください。