# Twitter RSS プロジェクト概要

## プロジェクト目的
Twitter RSSは、Twitter検索結果からRSSフィードを生成するツールです。キーワードベースおよび高度なクエリ検索をサポートし、標準化されたフィード形式でリアルタイム更新を提供します。

## 主要機能
- Twitter検索からRSSフィードの生成
- キーワードベースおよび高度なクエリ検索サポート
- Docker設定による簡単デプロイ
- ローカル出力フォルダへの結果保存

## 技術スタック
- **メイン言語**: TypeScript
- **ランタイム**: Node.js (ESNext target)
- **Twitter連携**: @book000/twitterts (カスタムTwitterライブラリ)
- **XML処理**: fast-xml-parser
- **コンテナ**: Docker (Alpine Chrome with Puppeteer)
- **パッケージマネージャー**: Yarn

## 認証方式
- Twitter ユーザー名/パスワード認証
- SSOには対応しない（技術的制約）
- 環境変数での認証情報設定が必要

## 出力形式
- ローカルの `output` フォルダにHTMLインデックスとRSSファイルを生成
- ブラウザでローカル表示可能 (`open output/index.html`)