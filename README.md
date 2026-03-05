This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cache Management

This project uses multiple layers of caching for optimal performance. When admin updates blog posts, there might be a delay before changes appear on the frontend.

### Quick Cache Clear

```powershell
# Windows PowerShell
cd ai-hub-fe
Remove-Item -Recurse -Force .next
npm run dev
```

```bash
# Linux/Mac
cd ai-hub-fe
rm -rf .next
npm run dev
```

### On-Demand Cache Revalidation

To force immediate cache refresh after admin updates:

```powershell
# Windows PowerShell
.\scripts\revalidate-cache.ps1 all
```

```bash
# Linux/Mac
./scripts/revalidate-cache.sh all
```

**Environment Variable Required:**
```env
REVALIDATE_SECRET=your-super-secret-key
```

### Cache Configuration

- **ISR Revalidate**: 60 seconds (pages auto-refresh every 60s)
- **CDN Cache**: 60 seconds + 120s stale-while-revalidate
- **Affected Pages**: Homepage, News, Blog, Landing pages

For detailed cache management documentation, see [CACHE_MANAGEMENT.md](./CACHE_MANAGEMENT.md).