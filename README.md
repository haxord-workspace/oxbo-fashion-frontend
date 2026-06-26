# Ecommerce App — Boilerplate

React + Redux Toolkit + TypeScript + Tailwind CSS

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + TypeScript |
| State | Redux Toolkit + redux-persist |
| Routing | React Router v6 |
| HTTP | Axios with interceptors |
| Styling | Tailwind CSS v3 |
| Build | Vite |

## Folder Structure

```
src/
├── app/
│   ├── store.ts          # Redux store with persist config
│   └── hooks.ts          # Typed useAppDispatch / useAppSelector
├── features/
│   ├── auth/             # authSlice: login, register, logout
│   ├── cart/             # cartSlice: add, remove, quantity, coupon
│   ├── products/         # productsSlice: fetch, filter, paginate
│   ├── orders/           # ordersSlice: place, fetch, cancel
│   └── ui/               # uiSlice: toasts, cart drawer, mobile menu
├── components/
│   ├── layout/           # Navbar, Footer, MainLayout
│   └── common/           # ToastContainer, shared components
├── pages/                # One file per route
├── services/             # axiosInstance + API modules
├── types/                # All TypeScript interfaces
└── hooks/                # Custom hooks
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server
npm run dev
```

## State Slices

### Auth (`state.auth`)
- `user`, `token`, `isLoading`, `error`
- Actions: `login`, `register`, `logout`, `fetchCurrentUser`
- Persisted to localStorage via redux-persist

### Cart (`state.cart`)
- `items[]`, `couponCode`, `discountPercent`
- Selectors: `selectCartTotal`, `selectCartCount`, `selectShippingCharge`
- Persisted to localStorage

### Products (`state.products`)
- `items[]`, `selectedProduct`, `filters`, `totalCount`
- Actions: `fetchProducts`, `fetchProductById`, `setFilters`, `setPage`

### Orders (`state.orders`)
- `items[]`, `selectedOrder`
- Actions: `placeOrder`, `fetchOrders`, `fetchOrderById`

### UI (`state.ui`)
- `toasts[]`, `isCartOpen`, `isMobileMenuOpen`
- Use `showToast({ message, type })` from anywhere

## Adding a New Feature

1. Create `src/features/myFeature/myFeatureSlice.ts`
2. Add reducer to `src/app/store.ts`
3. Add API calls to `src/services/myFeatureApi.ts`
4. Use `useAppSelector` and `useAppDispatch` in components

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key (optional) |
