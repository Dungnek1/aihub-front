🚀 **AI Hub Frontend**

Frontend của nền tảng AI Hub, được xây dựng bằng **Next.js (App Router)** kết hợp với **React**, **Tailwind CSS** và nhiều thư viện hiện đại nhằm tạo trải nghiệm nhanh, tối ưu SEO và hỗ trợ realtime.

---

## 📚 Table of Contents

1. Tech Stack  
2. Project Structure  
3. Run Project Locally  
4. Cache & Revalidation  
5. Development Guidelines  
6. Troubleshooting  
7. License  

---

## 🧰 1. Tech Stack

### Framework

- **Next.js** (App Router, SSR / ISR, API Routes)
- **React**

### UI & Styling

- **Tailwind CSS**
- `tailwindcss-animate`
- `tw-animate-css`

### Component Libraries

- **Radix UI**  
  (Dialog, Dropdown, Tabs, Tooltip, Select, Navigation Menu…)
- **Ant Design**  
  (sử dụng một số component)

### State Management & Forms

- **Redux Toolkit**
- **React Redux**
- **React Hook Form**
- **Zod**

### Authentication & Internationalization

- **NextAuth.js**
- **next-intl**

### Realtime & Animation

- **Socket.IO**
- **GSAP**
- **Framer Motion**
- **React Spring**

### Security & SEO

- **DOMPurify** (`isomorphic-dompurify`)
- Dynamic OG Image (`@vercel/og`)
- `sitemap.xml`
- `robots.txt`
- Metadata helpers

---

## 🗂 2. Project Structure

```text
aihub-front/
│
├── app/                  # Next.js App Router (pages & route segments)
│   ├── [locale]/         # i18n routes (vi, en, ...)
│   ├── api/              # Next.js API routes
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── provider.tsx
│
├── components/           # UI components (blog, ai-tools, landing page...)
├── hooks/                # Custom React hooks
├── lib/                  # Auth config, i18n config, helpers
├── services/             # API services (client & server)
├── store/                # Redux store & slices
├── public/               # Static assets
├── styles/               # Global & custom CSS
├── docs/                 # Technical docs
├── scripts/              # Scripts (revalidate cache, deploy...)
│
├── next.config.ts
├── middleware.ts
├── i18n.ts
└── package.json
```

---

## ▶️ 3. Run Project Locally

### 3.1. Prerequisites

Cần cài đặt:

- Node.js v18+
- npm / pnpm / yarn

### 3.2. Clone Repository

```bash
git clone https://github.com/Dungnek1/aihub-front.git
cd aihub-front
```

### 3.3. Install Dependencies

```bash
npm install
# hoặc
pnpm install
# hoặc
yarn install
```

### ⚙️ 3.4. Environment Variables

Tạo file: `.env.local`

Ví dụ:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

REVALIDATE_SECRET=your-super-secret-key
```

Có thể thêm các biến khác nếu backend yêu cầu (socket URL, API key...).

### 🚀 3.5. Start Development Server

```bash
npm run dev
```

Project sẽ chạy tại:

- `http://localhost:3000`

Nếu backend dùng port 3000, đổi port frontend:

```bash
PORT=3001 npm run dev
```

---

## ⚡ 4. Cache & Revalidation

Dự án sử dụng **multi-layer caching** để tăng hiệu năng.

| Layer                  | Time  |
|------------------------|-------|
| ISR Revalidate         | 60s   |
| CDN Cache              | 60s   |
| Stale While Revalidate | +120s |

Áp dụng cho:

- Homepage
- Blog
- News
- Landing pages

### 4.1. Clear `.next` Cache

**Windows (PowerShell):**

```powershell
cd aihub-front
Remove-Item -Recurse -Force .next
npm run dev
```

**Linux / Mac:**

```bash
cd aihub-front
rm -rf .next
npm run dev
```

### 4.2. On-Demand Revalidation

Sau khi admin cập nhật nội dung, có thể **force refresh cache**.

**Windows:**

```powershell
.\scripts\revalidate-cache.ps1 all
```

**Linux / Mac:**

```bash
./scripts/revalidate-cache.sh all
```

Yêu cầu:

```env
REVALIDATE_SECRET=your-super-secret-key
```

Chi tiết xem thêm trong: `docs/CACHE_MANAGEMENT.md`.

---

## 📏 5. Development Guidelines

Một số quy ước trong project:

### Code Style

- Sử dụng **TypeScript 100%**
- Theo **ESLint + Prettier**

### Khi thêm feature mới

Ưu tiên:

- Gọi API qua: `services/client/*.client.ts`

Tách rõ layers:

| Layer       | Responsibility    |
|------------|-------------------|
| Components | UI                |
| Hooks      | Business logic    |
| Services   | API communication |

### Internationalization

Project hỗ trợ đa ngôn ngữ, với routes dạng:

- `/vi/...`
- `/en/...`

Text nên được quản lý bằng **`next-intl`**.

---

## 🛠 6. Troubleshooting

### ❌ Không gọi được API

- Kiểm tra biến môi trường `NEXT_PUBLIC_API_BASE_URL` phải đúng với API Gateway backend.

### ❌ 404 với route đa ngôn ngữ

- Đảm bảo truy cập:
  - `/vi/...`
  - `/en/...`

Thay vì root không có locale.

### ❌ Cache chưa update

- Có thể:
  - Chạy script revalidate
  - Hoặc xoá `.next`:

```bash
rm -rf .next
```

---

## 📄 License

Project phục vụ cho **AI Hub Platform**.
