# optimistic-update-training

GitHubのコントリビューション（草）表示と、TanStack Queryの楽観的更新学習用の土台です。

## セットアップ

1. 環境変数を設定

`.env.example` を `.env.local` にコピーし、`GITHUB_TOKEN` に GitHub の Personal Access Token（最低 `read:user`）を設定します。

1. 開発サーバー起動

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開き、ユーザー名を入力すると草が表示されます。

## Getting Started

開発サーバーの詳細は Next.js ドキュメントを参照してください。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
