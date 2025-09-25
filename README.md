# リアルタイム競争型クイズシステム

ゲーミフィケーション要素を取り入れた理解度確認ツール

## 🚀 クイックスタート

### 1. Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Realtime Databaseを有効化（テストモードで開始）
4. プロジェクト設定から構成情報を取得

### 2. 環境変数の設定

`.env.local`ファイルを編集して、Firebaseの設定情報を入力：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url_here
```

### 3. 開発サーバーの起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📝 使い方

### 講師として

1. トップページから「講師として始める」を選択
2. サンプルクイズファイル（`/public/sample-quiz.json`）をアップロード
3. 制限時間を設定してセッション作成
4. 生成された6桁のコードを参加者に共有
5. 参加者の進捗をリアルタイムでモニタリング
6. セッション終了後、結果分析画面で詳細を確認

### 参加者として

1. トップページから「参加者として参加」を選択
2. 講師から共有された6桁のコードを入力
3. 名前を入力して参加
4. クイズに回答（他の参加者の進捗も表示）
5. 終了後、結果とランキングを確認

## 🎮 主な機能

- **リアルタイム同期**: Firebase Realtime Databaseによる即座の更新
- **進捗可視化**: 全参加者の進行状況をリアルタイム表示
- **ゲーミフィケーション**: カウントダウン、ランキング、スコア表示
- **結果分析**: 問題ごとの正答率、回答分布、参加者ランキング
- **エクスポート機能**: CSV形式での結果ダウンロード

## 📊 クイズJSONフォーマット

```json
{
  "title": "クイズタイトル",
  "description": "クイズの説明",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "質問文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correct": 0
    },
    {
      "id": "q2",
      "type": "text",
      "question": "記述式の質問",
      "correct": "正解の文字列"
    }
  ]
}
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

```bash
vercel
```

## 🔧 技術スタック

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Hosting**: Vercel
- **Icons**: Lucide React

## 📄 ライセンス

MIT
