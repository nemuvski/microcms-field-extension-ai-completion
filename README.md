# microcms-field-extension-ai-completion

![](demo.gif)

## 必要なもの

- Node.js
    - バージョンは `.node-version` を参照
- Cloudflareのアカウント
- microCMSのアカウント、およびサービス
    - 必須ではないです

## 準備

1. インストール

```bash
npm ci
```

2. 変更項目の編集 **（必ず実施）**
    - `CHANGEME: (必須)` でリポジトリ内を検索して、書き換えてください。

3. Cloudflare Pagesにデプロイ

```bash
npm run deploy
```

## 構成

- `src/client/`
    - クライアントサイドで実行されるコード（エディタ機能）を格納
- `src/api/`
    - WebAPIのハンドラとWorkers AIにリクエストに関するコードを格納
    - モデルやパラメータ、プロンプトについては `text-generation/` にあるコードをご覧ください
- `src/shared/`
    - クライアントサイドとサーバーサイドで共有されるコードを格納
- `src/index.tsx`
    - ページ、WebAPIのルートの登録
    - CSPヘッダーの設定
