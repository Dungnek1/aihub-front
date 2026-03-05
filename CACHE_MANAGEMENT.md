# Quản Lý Cache - AI Hub Frontend

## 📋 Tổng Quan

Frontend sử dụng nhiều lớp cache để tối ưu hiệu năng. Tuy nhiên, điều này có thể gây delay khi admin cập nhật bài viết.

## 🔍 Các Lớp Cache

### 1. **Next.js Page Cache (ISR - Incremental Static Regeneration)**
- **Thời gian**: 60 giây (đã cấu hình)
- **Ảnh hưởng**: Các trang sẽ được rebuild sau mỗi 60 giây
- **Vị trí**: 
  - `app/[locale]/page.tsx` (Homepage)
  - `app/[locale]/news/page.tsx` (News page)
  - `app/[locale]/landing/news/page.tsx` (Landing news)
  - `app/[locale]/blog/(with-layout)/page.tsx` (Blog page)

### 2. **CDN/Edge Cache**
- **Thời gian**: 60 giây + 120 giây stale-while-revalidate
- **Ảnh hưởng**: Cache ở CDN/proxy giữa server và user
- **Vị trí**: `next.config.ts` - Cache-Control headers

### 3. **Browser Cache**
- **Thời gian**: Tùy theo Cache-Control headers
- **Ảnh hưởng**: Cache trên trình duyệt người dùng

### 4. **Next.js Build Cache (.next folder)**
- **Thời gian**: Vô thời hạn cho đến khi rebuild
- **Ảnh hưởng**: Cache build artifacts

## ⏱️ Thời Gian Delay Hiện Tại

Sau khi admin cập nhật bài viết:
- **Tối thiểu**: 60 giây (ISR revalidate)
- **Tối đa**: 180 giây (60s cache + 120s stale-while-revalidate)

## 🚀 Cách Force Update Ngay Lập Tức

### Option 1: Xóa Cache Thủ Công (Development)
```powershell
cd ai-hub-fe
Remove-Item -Recurse -Force .next
npm run dev  # hoặc npm run build && npm start
```

### Option 2: Sử dụng On-Demand Revalidation (Recommended)

Tạo API route để admin có thể trigger revalidate:

#### Bước 1: Tạo API route
Tạo file `app/api/revalidate/route.ts`:

```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  
  // Kiểm tra secret key
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path } = body;

    // Revalidate các trang liên quan
    if (path === 'all') {
      revalidatePath('/', 'layout');
      revalidatePath('/[locale]', 'page');
      revalidatePath('/[locale]/news', 'page');
      revalidatePath('/[locale]/landing/news', 'page');
      revalidatePath('/[locale]/blog', 'page');
    } else {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, path });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
```

#### Bước 2: Thêm REVALIDATE_SECRET vào .env
```env
REVALIDATE_SECRET=your-super-secret-key-here
```

#### Bước 3: Gọi API từ Admin Dashboard
Sau khi admin cập nhật/tạo/xóa bài viết, gọi:

```typescript
// Trong admin dashboard
async function onBlogPostUpdate() {
  await fetch('https://aihubvietnam.com/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': process.env.REVALIDATE_SECRET,
    },
    body: JSON.stringify({ path: 'all' }),
  });
}
```

### Option 3: Giảm Thời Gian Revalidate (Không Khuyến Khích)

Nếu muốn update nhanh hơn, có thể giảm xuống:

```typescript
// Trong các page
export const revalidate = 30; // 30 giây
```

⚠️ **Lưu ý**: Giảm quá thấp sẽ tăng tải server và chi phí CDN.

## 🔧 Configuration Files

### `next.config.ts`
```typescript
{
  source: '/',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, s-maxage=60, stale-while-revalidate=120',
    },
  ]
}
```

### Pages với ISR
```typescript
// app/[locale]/page.tsx
export const revalidate = 60; // Revalidate mỗi 60 giây
```

## 📊 Monitoring Cache

### Kiểm tra Cache Headers
```bash
curl -I https://aihubvietnam.com
```

Xem header `Cache-Control`, `Age`, `X-Vercel-Cache` để debug.

## 🎯 Best Practices

1. **Sử dụng On-Demand Revalidation** cho nội dung quan trọng cần update ngay
2. **Giữ ISR revalidate ở 60-300 giây** cho nội dung thường xuyên
3. **Xóa .next cache** khi có thay đổi lớn về cấu hình
4. **Monitor CDN cache** để đảm bảo không bị cache quá lâu

## 🐛 Troubleshooting

### Bài viết không update sau 60 giây?
1. Kiểm tra xem có rebuild chưa: `npm run build`
2. Xóa cache browser: Ctrl+Shift+R (hard reload)
3. Kiểm tra CDN cache headers
4. Trigger manual revalidation

### Cache bị stuck?
```powershell
cd ai-hub-fe
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run build
npm start
```

## 📝 Change Log

- **2024-12-02**: Thêm `revalidate = 60` vào tất cả pages hiển thị blog
- **2024-12-02**: Giảm CDN cache từ 300s xuống 60s
- **2024-12-02**: Thêm hướng dẫn On-Demand Revalidation

