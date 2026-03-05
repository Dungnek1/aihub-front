# 🎨 Loading UI Components

## ✅ Đã Cài Đặt

1. **react-spinners** - Bộ sưu tập spinner đẹp
2. **nprogress** - Progress bar cho page transitions

---

## 📦 Components

### 1. LoadingSpinner

Component spinner với nhiều variants:

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Clip loader (default)
<LoadingSpinner type="clip" size={40} message="Loading..." />

// Pulse loader
<LoadingSpinner type="pulse" size={40} />

// Scale loader
<LoadingSpinner type="scale" size={40} />

// Bar loader
<LoadingSpinner type="bar" size={40} />

// Beat loader
<LoadingSpinner type="beat" size={40} />

// Hash loader
<LoadingSpinner type="hash" size={40} />

// Ring loader
<LoadingSpinner type="ring" size={40} />

// Sync loader
<LoadingSpinner type="sync" size={40} />

// Custom (original design)
<LoadingSpinner type="custom" size={48} />
```

**Props:**
- `type`: "clip" | "pulse" | "scale" | "bar" | "beat" | "hash" | "ring" | "sync" | "custom"
- `size`: number (default: 40)
- `color`: string (default: "#06b6d4")
- `className`: string
- `message`: string (optional)

---

### 2. PageLoader

Progress bar cho page transitions (đã tích hợp vào client-layout):

```tsx
import { PageLoader } from "@/components/ui/PageLoader";

<PageLoader isLoading={isNavigating} />
```

**Features:**
- Top progress bar
- Spinner icon (optional)
- Cyan theme matching project
- Auto cleanup

---

### 3. SkeletonLoader

Skeleton loading với nhiều variants:

```tsx
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

// Card skeleton
<SkeletonLoader variant="card" />

// Text skeleton
<SkeletonLoader variant="text" />

// Avatar skeleton
<SkeletonLoader variant="avatar" />

// Image skeleton
<SkeletonLoader variant="image" className="h-64 w-full" />

// List skeleton (multiple items)
<SkeletonLoader variant="list" count={5} />
```

**Props:**
- `variant`: "card" | "text" | "avatar" | "image" | "list"
- `className`: string
- `count`: number (for multiple items)

---

### 4. LoadingOverlay (Updated)

Đã được cập nhật để sử dụng LoadingSpinner:

```tsx
import LoadingOverlay from "@/components/LoadingOverlay";

<LoadingOverlay message="Loading..." type="custom" />
```

**Props:**
- `message`: string (default: "Loading...")
- `type`: SpinnerType (default: "custom")

---

## 🎯 Use Cases

### 1. Button Loading State:

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<button disabled={isLoading}>
  {isLoading ? (
    <LoadingSpinner type="beat" size={16} />
  ) : (
    "Submit"
  )}
</button>
```

### 2. Card Loading:

```tsx
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

{isLoading ? (
  <SkeletonLoader variant="card" count={3} />
) : (
  <CardList cards={data} />
)}
```

### 3. Inline Loading:

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<div className="flex items-center gap-2">
  <LoadingSpinner type="clip" size={20} />
  <span>Processing...</span>
</div>
```

### 4. Full Page Loading:

```tsx
import LoadingOverlay from "@/components/LoadingOverlay";

{isLoading && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingOverlay message="Loading page..." type="hash" />
  </div>
)}
```

---

## 🎨 Spinner Types Preview

1. **Clip** - Classic spinner với clip effect
2. **Pulse** - Pulsing dots
3. **Scale** - Scaling bars
4. **Bar** - Horizontal bar
5. **Beat** - Beating dots
6. **Hash** - Hash symbol spinner
7. **Ring** - Ring spinner
8. **Sync** - Syncing dots
9. **Custom** - Original cyan gradient spinner

---

## 💡 Best Practices

1. **Use appropriate spinner size:**
   - Small (16-20px): Buttons, inline
   - Medium (40px): Cards, sections
   - Large (48-64px): Full page, overlays

2. **Match spinner to context:**
   - Fast actions: Beat, Sync
   - Data loading: Clip, Hash
   - Page transitions: Custom, Ring
   - Forms: Pulse, Bar

3. **Skeleton for content:**
   - Use SkeletonLoader for content placeholders
   - Better UX than spinners for lists/cards

4. **Progress bar:**
   - Use PageLoader for route transitions
   - Already integrated in client-layout

---

## 🔗 Resources

- [React Spinners](https://www.davidhu.io/react-spinners/)
- [NProgress](https://github.com/rstacruz/nprogress)

