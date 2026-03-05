# Utils - Utility Functions 🛠️

Thư mục này chứa tất cả các utility functions được sử dụng trong dự án.

## 📁 Cấu trúc

```
utils/
├── index.ts           # Export tất cả utilities
├── common.utils.ts    # Common utilities (cn, etc.)
├── auth.utils.ts      # Authentication utilities
└── password.utils.ts  # Password reset utilities
```

## 📚 Modules

### 1. **Common Utils** (`common.utils.ts`)

#### `cn(...inputs)`
Merge Tailwind CSS classes với clsx và tailwind-merge.

**Usage:**
```typescript
import { cn } from '@/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  "another-class"
)} />
```

---

### 2. **Auth Utils** (`auth.utils.ts`)

#### `logoutUser(redirectTo?)`
Đăng xuất user với backend API call.

**Usage:**
```typescript
import { logoutUser } from '@/utils/auth.utils';

await logoutUser('/auth/signin');
```

#### `silentLogout()`
Đăng xuất không redirect - dùng cho API error handling.

**Usage:**
```typescript
import { silentLogout } from '@/utils/auth.utils';

const success = await silentLogout();
```

#### `isUserLoggedIn()`
Kiểm tra user có đang đăng nhập không.

**Usage:**
```typescript
import { isUserLoggedIn } from '@/utils/auth.utils';

const isLoggedIn = await isUserLoggedIn();
if (!isLoggedIn) {
  // Redirect to login
}
```

#### `getCurrentUser()`
Lấy thông tin user hiện tại.

**Usage:**
```typescript
import { getCurrentUser } from '@/utils/auth.utils';

const user = await getCurrentUser();
console.log(user?.name);
```

#### `hasSessionError()`
Kiểm tra session có lỗi không (ví dụ: refresh token expired).

**Usage:**
```typescript
import { hasSessionError } from '@/utils/auth.utils';

const hasError = await hasSessionError();
if (hasError) {
  // Handle session error
}
```

---

### 3. **Password Utils** (`password.utils.ts`)

#### `sendForgotPasswordRequest(email)`
Gửi request forgot password.

**Usage:**
```typescript
import { sendForgotPasswordRequest } from '@/utils/password.utils';

try {
  const { userId } = await sendForgotPasswordRequest('user@example.com');
  console.log('Reset email sent to userId:', userId);
} catch (error) {
  console.error('Failed to send reset email');
}
```

#### `verifyEmailOTP(userId, code)`
Verify OTP code từ email.

**Usage:**
```typescript
import { verifyEmailOTP } from '@/utils/password.utils';

try {
  const { token } = await verifyEmailOTP(userId, '123456');
  // Use token to reset password
} catch (error) {
  console.error('Invalid OTP code');
}
```

#### `resendVerificationEmail(userId)`
Gửi lại verification email.

**Usage:**
```typescript
import { resendVerificationEmail } from '@/utils/password.utils';

try {
  await resendVerificationEmail(userId);
  console.log('Verification email resent');
} catch (error) {
  console.error('Failed to resend email');
}
```

---

## 🎯 Import Paths

### Import từ index (Recommended)
```typescript
import { cn, logoutUser, isUserLoggedIn } from '@/utils';
```

### Import riêng lẻ
```typescript
import { cn } from '@/utils/common.utils';
import { logoutUser } from '@/utils/auth.utils';
import { sendForgotPasswordRequest } from '@/utils/password.utils';
```

---

## 📝 Best Practices

1. **Sử dụng path alias `@/utils`**
   ```typescript
   // ✅ Good
   import { cn } from '@/utils';
   
   // ❌ Bad
   import { cn } from '../../../utils/common.utils';
   ```

2. **Import only what you need**
   ```typescript
   // ✅ Good
   import { cn } from '@/utils';
   
   // ❌ Bad (if you only need cn)
   import * as utils from '@/utils';
   ```

3. **Handle errors properly**
   ```typescript
   try {
     await logoutUser();
   } catch (error) {
     console.error('Logout failed:', error);
   }
   ```

---

## 🔧 Adding New Utils

Khi thêm utility mới:

1. Tạo file hoặc thêm vào file tương ứng
2. Export function trong file đó
3. Export lại trong `index.ts`

**Example:**
```typescript
// utils/date.utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN');
}

// utils/index.ts
export * from './date.utils';
```

---

✨ **Happy coding!** 🚀

