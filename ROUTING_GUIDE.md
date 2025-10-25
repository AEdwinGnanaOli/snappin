# React Router 7 Implementation Guide

## Overview

Snappin now uses **React Router v7.9.4** with modern best practices including centralized route configuration, lazy loading, and the `useRoutes` hook.

## Architecture

### File Structure

```
src/
├── routes/
│   └── index.tsx              # Centralized route configuration
├── constants/
│   └── routes.ts              # Route path constants
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   └── chat/
│       └── Chat.tsx
├── components/
│   └── common/
│       └── ProtectedRoute.tsx  # Authentication guard
└── App.tsx                     # Root component with router setup
```

## Key Features

### ✅ 1. Centralized Route Configuration

**File**: [src/routes/index.tsx](src/routes/index.tsx)

All routes are defined in a single configuration file using React Router's `RouteObject` type:

```typescript
export const routes: RouteObject[] = [
  ...publicRoutes,      // Login, Signup
  ...protectedRoutes,   // Chat (requires auth)
  ...fallbackRoutes,    // 404 redirect
];
```

**Benefits**:
- Single source of truth for all routes
- Easy to add/remove routes
- Type-safe route definitions
- Clear route organization

### ✅ 2. Route Constants

**File**: [src/constants/routes.ts](src/constants/routes.ts)

Centralized route paths prevent typos and make refactoring easier:

```typescript
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  HOME: '/',
  // ... more routes
} as const;
```

**Usage**:
```typescript
// Instead of hardcoded strings
navigate('/login');

// Use constants
navigate(ROUTES.AUTH.LOGIN);
```

### ✅ 3. useRoutes Hook

**File**: [src/App.tsx](src/App.tsx)

React Router 7's recommended pattern for rendering routes:

```typescript
function AppRoutes(): React.ReactElement | null {
  const element = useRoutes(routes);
  return element;
}
```

**Benefits**:
- More flexible than `<Routes>` component
- Better TypeScript support
- Cleaner component tree
- Easier testing

### ✅ 4. Lazy Loading

**File**: [src/routes/index.tsx](src/routes/index.tsx)

Components are lazy-loaded for better performance:

```typescript
const Login = React.lazy(() => import('../pages/auth/Login'));
const Signup = React.lazy(() => import('../pages/auth/Signup'));
const Chat = React.lazy(() => import('../pages/chat/Chat'));
```

**Benefits**:
- Smaller initial bundle size
- Faster first page load
- Better code splitting
- Improved performance

### ✅ 5. Suspense Boundary

**File**: [src/App.tsx](src/App.tsx)

Loading fallback while lazy components load:

```typescript
<Suspense fallback={<LoadingFallback />}>
  <AppRoutes />
</Suspense>
```

Shows a centered spinner during route transitions.

### ✅ 6. Protected Routes

**File**: [src/components/common/ProtectedRoute.tsx](src/components/common/ProtectedRoute.tsx)

Authentication guard that redirects unauthenticated users:

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## Current Routes

### Public Routes (No Authentication Required)

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | Login | User login page |
| `/signup` | Signup | User registration page |

### Protected Routes (Authentication Required)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Chat | Main chat interface |

### Fallback Routes

| Path | Action | Description |
|------|--------|-------------|
| `*` | Redirect to `/` | Catch-all for unknown routes |

## Adding New Routes

### Step 1: Add Route Constant

Edit `src/constants/routes.ts`:

```typescript
export const ROUTES = {
  // ... existing routes
  SETTINGS: '/settings',  // Add new route
} as const;
```

### Step 2: Create Component

Create your page component:

```typescript
// src/pages/Settings.tsx
import React from 'react';

const Settings: React.FC = () => {
  return <div>Settings Page</div>;
};

export default Settings;
```

### Step 3: Add to Route Configuration

Edit `src/routes/index.tsx`:

```typescript
// 1. Lazy load the component
const Settings = React.lazy(() => import('../pages/Settings'));

// 2. Add to appropriate route array
const protectedRoutes: RouteObject[] = [
  // ... existing routes
  {
    path: ROUTES.SETTINGS,
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
];
```

### Step 4: Navigate to Route

Use in components:

```typescript
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.SETTINGS);
  };

  return <button onClick={handleClick}>Go to Settings</button>;
}
```

## Navigation Patterns

### Using useNavigate Hook

```typescript
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

function Component() {
  const navigate = useNavigate();

  // Navigate to route
  navigate(ROUTES.AUTH.LOGIN);

  // Navigate with state
  navigate(ROUTES.HOME, { state: { from: 'login' } });

  // Navigate with replace (no history entry)
  navigate(ROUTES.HOME, { replace: true });

  // Go back
  navigate(-1);
}
```

### Using Link Component

```typescript
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

function Component() {
  return (
    <Link to={ROUTES.AUTH.SIGNUP}>
      Sign Up
    </Link>
  );
}
```

### Programmatic Navigation

```typescript
// After form submission
const handleSubmit = async () => {
  await saveData();
  navigate(ROUTES.HOME);
};

// Conditional navigation
if (isLoggedIn) {
  navigate(ROUTES.HOME);
} else {
  navigate(ROUTES.AUTH.LOGIN);
}
```

## Advanced Patterns

### Nested Routes

```typescript
const routes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'overview', element: <Overview /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
];
```

### Route Parameters

```typescript
// Define route
{
  path: '/user/:userId',
  element: <UserProfile />,
}

// Access params
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  return <div>User ID: {userId}</div>;
}
```

### Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

function Component() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read: ?tab=settings
  const tab = searchParams.get('tab');

  // Set: ?tab=profile
  setSearchParams({ tab: 'profile' });
}
```

### Route Loaders (Future Enhancement)

```typescript
// Define loader
const userLoader = async ({ params }) => {
  return fetch(`/api/user/${params.userId}`);
};

// Use in route
{
  path: '/user/:userId',
  element: <UserProfile />,
  loader: userLoader,
}

// Access data in component
import { useLoaderData } from 'react-router-dom';

function UserProfile() {
  const user = useLoaderData();
  return <div>{user.name}</div>;
}
```

## Migration from React Router 6

### Before (React Router 6)

```typescript
<Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/" element={<Chat />} />
  </Routes>
</Router>
```

### After (React Router 7)

```typescript
// Route configuration in separate file
export const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/', element: <Chat /> },
];

// App component
<BrowserRouter>
  <Suspense fallback={<Loading />}>
    <AppRoutes />
  </Suspense>
</BrowserRouter>
```

## Benefits of This Approach

### 🚀 Performance
- **Lazy Loading**: Smaller initial bundle
- **Code Splitting**: Better caching
- **Faster Navigation**: Optimized re-renders

### 🔧 Maintainability
- **Centralized Config**: Single source of truth
- **Type Safety**: TypeScript support
- **Scalable**: Easy to add routes

### 🎯 Developer Experience
- **Auto-completion**: IDE support with constants
- **Easy Refactoring**: Change paths in one place
- **Clear Structure**: Organized route definitions

### 📦 Bundle Size
- **Reduced Initial Load**: Only load needed routes
- **Better Caching**: Split chunks cache separately
- **Optimized Builds**: Smaller production bundles

## Testing Routes

### Unit Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders login page on /login route', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('Welcome Back')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';

test('navigates to home after login', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/login'],
  });

  render(<RouterProvider router={router} />);

  // Test navigation logic
});
```

## Troubleshooting

### Issue: Blank Page After Navigation

**Solution**: Check Suspense boundary and lazy imports

```typescript
// Ensure components are wrapped in Suspense
<Suspense fallback={<Loading />}>
  <AppRoutes />
</Suspense>

// Verify lazy imports are correct
const Component = React.lazy(() => import('./Component')); // ✅
const Component = React.lazy(() => import('./component')); // ❌ (case-sensitive)
```

### Issue: Protected Route Not Redirecting

**Solution**: Verify ProtectedRoute logic

```typescript
// Check authentication state
const { isAuthenticated } = useAuth();
console.log('Auth status:', isAuthenticated);

// Ensure Navigate uses replace
<Navigate to={ROUTES.AUTH.LOGIN} replace />
```

### Issue: 404 on Refresh

**Solution**: Configure server for SPA

For Vite, add to `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
```

## Future Enhancements

### Data Loading

```typescript
// Add loaders for data fetching
{
  path: '/dashboard',
  element: <Dashboard />,
  loader: dashboardLoader,
  errorElement: <ErrorPage />,
}
```

### Error Boundaries

```typescript
// Add error handling per route
{
  path: '/dashboard',
  element: <Dashboard />,
  errorElement: <DashboardError />,
}
```

### Route-based Code Splitting

```typescript
// Split by feature
const AdminRoutes = React.lazy(() => import('./routes/admin'));
const UserRoutes = React.lazy(() => import('./routes/user'));
```

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router v7 Migration Guide](https://reactrouter.com/upgrading/v7)
- [useRoutes Hook](https://reactrouter.com/hooks/use-routes)

---

**Implementation Status**: ✅ Complete
**React Router Version**: 7.9.4
**Build Status**: ✅ Passing
**Server**: Running at http://localhost:5175
