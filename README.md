🚀 AI Hub FrontendAI Hub Frontend là giao diện người dùng hiện đại cho nền tảng hệ sinh thái AI, được xây dựng với hiệu suất cực cao, hỗ trợ đa ngôn ngữ (i18n), SEO tối ưu và thông báo thời gian thực.🛠 1. Tech Stack & EcosystemDự án sử dụng những công nghệ mới nhất nhằm đảm bảo tốc độ phản hồi và trải nghiệm người dùng mượt mà.LayerTechnologiesCore FrameworkNext.js 16 (App Router), React 19, TypeScriptUI & StylingTailwind CSS 4, Radix UI, Ant Design, Lucide IconsState ManagementRedux Toolkit (RTK), React ReduxForm & ValidationReact Hook Form, ZodAuthenticationNextAuth.js (Auth.js)Internationalizationnext-intl (Hỗ trợ đa ngôn ngữ /vi, /en)AnimationGSAP, Framer Motion, React SpringRealtimeSocket.io Client📂 2. Project StructureCấu trúc thư mục được tổ chức theo module hóa để dễ dàng mở rộng:Plaintextaihub-front/
├── 📁 app/               # Next.js App Router (Pages, Layouts, API Routes)
│   ├── 📁 [locale]/      # Đa ngôn ngữ (i18n routes)
│   └── 📁 api/           # Route Handlers (Proxy, OG Image, Revalidate)
├── 📁 components/        # UI Components (Atomic Design: Common, Layout, Features)
├── 📁 hooks/             # Custom React Hooks (useApi, useNotifications,...)
├── 📁 lib/               # Configurations (Auth, i18n, API Axios instance)
├── 📁 services/          # Client & Server API calling services
├── 📁 store/             # Redux Store & Slices management
├── 📁 public/            # Static assets (Images, Videos, Icons)
├── 📁 scripts/           # Tự động hóa (Revalidate cache, Deploy scripts)
└── 📁 docs/              # Tài liệu kỹ thuật chi tiết
🚀 3. Getting Started3.1. PrerequisitesNode.js: v18.x trở lên (Khuyến nghị bản LTS)Package Manager: npm, pnpm hoặc yarn3.2. InstallationBash# Clone the repository
git clone https://github.com/Dungnek1/aihub-front.git

# Go to project directory
cd aihub-front

# Install dependencies
npm install
3.3. Environment VariablesTạo file .env.local tại thư mục gốc và cấu hình các thông số sau:Đoạn mãNEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
REVALIDATE_SECRET=your-super-secret-key
3.4. DevelopmentBashnpm run dev
Mở http://localhost:3000 trên trình duyệt để xem kết quả.Note: Nếu cổng 3000 bị chiếm bởi Backend, hãy chạy: PORT=3001 npm run dev⚡ 4. Cache & RevalidationDự án áp dụng chiến lược Hybrid Rendering để tối ưu tốc độ:ISR (Incremental Static Regeneration): Tự động revalidate sau mỗi 60 giây.On-Demand Revalidation: Xóa cache ngay lập tức khi dữ liệu thay đổi thông qua Webhook/Scripts.Cách xóa cache thủ công khi phát triển:Windows: Remove-Item -Recurse -Force .next; npm run devLinux/Mac: rm -rf .next && npm run dev📝 5. Development GuidelinesĐể giữ cho codebase sạch sẽ và đồng nhất, vui lòng tuân thủ:TypeScript: Luôn định nghĩa Interface/Type cho Props và Data.i18n: Không viết hard-code text. Sử dụng useTranslations từ next-intl.Components: Chia nhỏ component nếu nó vượt quá 200 dòng code.Git Commit: Sử dụng Conventional Commits (ví dụ: feat: add login logic, fix: header responsive).🛠 6. TroubleshootingLỗi API (CORS/Network): Kiểm tra NEXT_PUBLIC_API_BASE_URL trong file .env.Lỗi 404 Route: Đảm bảo URL có tiền tố ngôn ngữ (VD: /vi/dashboard thay vì /dashboard).Hydration Error: Kiểm tra việc sử dụng các dữ liệu ngẫu nhiên hoặc thời gian trong lần render đầu tiên của SSR.
