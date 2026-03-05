🤖 AI Hub - Frontend PlatformMột giao diện hiện đại cho hệ sinh thái AI, tối ưu hiệu năng và trải nghiệm người dùng.⚡ Điểm nổi bật (Core Features)Next.js 16 & React 19: Tận dụng tối đa Server Components và Form Actions mới nhất.Tailwind CSS 4: Engine CSS siêu nhanh với cấu hình tối giản.Internationalization (i18n): Hỗ trợ đa ngôn ngữ hoàn chỉnh qua Middleware.Real-time Ready: Tích hợp Socket.io cho thông báo và dữ liệu trực tiếp.SEO & Social Sharing: Tự động tạo Metadata, Sitemap và OG Image động.🛠️ Stack kỹ thuậtLĩnh vựcCông nghệ sử dụngFrontendNext.js 16, React 19, TypeScriptStylingTailwind 4, Framer Motion, GSAPQuản lý StateRedux Toolkit, Context APIFormsReact Hook Form + Zod ValidationAuthenticationNextAuth.js (Auth.js)API ClientAxios (tích hợp Interceptors cho Auth)📂 Sơ đồ cấu trúc (Folder Map)Bashaihub-front/
├── 🟢 app/               # Routes, Layouts & API (App Router)
│   └── [locale]/        # Đa ngôn ngữ (VI/EN/...)
├── 🔵 components/        # UI Reusable & Business Components
├── 🟡 hooks/             # Custom React Hooks logic
├── 🔴 services/          # Các hàm gọi API (Client/Server)
├── 🟣 store/             # Cấu hình Redux & Slices
├── ⚪ lib/               # Utility, Config (Auth, i18n, SEO)
└── ⚙️ scripts/           # Công cụ quản lý Cache & Deployment
🚀 Hướng dẫn cài đặt nhanh1. Chuẩn bịYêu cầu Node.js 18+ và trình quản lý gói (npm/pnpm/yarn).2. Khởi tạo dự ánBashgit clone https://github.com/Dungnek1/aihub-front.git
cd aihub-front
npm install
3. Biến môi trườngCopy nội dung sau vào file .env.local:Đoạn mãNEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
REVALIDATE_SECRET=your_revalidate_key
4. Chạy ứng dụngBashnpm run dev
# Mặc định tại: http://localhost:3000
🧹 Quản lý Cache (Maintenance)Dự án sử dụng ISR để đạt tốc độ tải trang gần như tức thì. Khi cần làm mới dữ liệu thủ công:Xóa bộ nhớ đệm Build:rm -rf .next (Linux/Mac) hoặc Remove-Item -Recurse .next (Windows).Làm mới dữ liệu từ xa (On-demand):Bash# Chạy script revalidate đã chuẩn bị sẵn
./scripts/revalidate-cache.sh all
🤝 Quy chuẩn phát triển (Workflow)Strict Type: Luôn khai báo Type/Interface cho mọi dữ liệu từ Backend.i18n First: Tuyệt đối không viết text tiếng Việt trực tiếp vào file .tsx. Sử dụng file JSON trong messages/.Clean Code: Tuân thủ cấu trúc services gọi API và hooks xử lý logic để giữ Component chỉ chứa UI.⭐ Nếu bạn thấy dự án này hữu ích, hãy tặng một Star trên GitHub nhé!
