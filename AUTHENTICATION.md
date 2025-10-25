# Snappin Authentication

This document describes the login and signup functionality implemented for Snappin.

## Features Implemented

### 1. **Login Page** (`/login`)
- Clean, modern design with gradient background
- Email and password authentication
- Password visibility toggle
- Form validation
- Error handling with alert messages
- "Forgot password" link (placeholder)
- Link to signup page
- Responsive design for mobile and desktop
- Demo credentials notice

**Location**: [src/pages/Login.tsx](src/pages/Login.tsx)

### 2. **Signup Page** (`/signup`)
- Similar design aesthetic to login page
- Full name, email, and password fields
- Password confirmation field
- Password visibility toggles for both fields
- Comprehensive form validation:
  - All fields required
  - Name must be at least 2 characters
  - Password must be at least 6 characters
  - Passwords must match
- Error handling with alert messages
- Link to login page
- Terms of Service and Privacy Policy links (placeholders)

**Location**: [src/pages/Signup.tsx](src/pages/Signup.tsx)

### 3. **Authentication Context**
- Centralized authentication state management
- Methods: `login()`, `signup()`, `logout()`
- Persistent session using localStorage
- User object with id, name, email, and avatar
- Auto-restore session on app reload

**Location**: [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

### 4. **Protected Routes**
- Route guard component that redirects unauthenticated users to login
- Protects the main chat interface
- Seamless redirect flow

**Location**: [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)

### 5. **Logout Functionality**
- Logout button added to sidebar navigation
- Clears user session and localStorage
- Redirects to login page
- Visual hover effect (red highlight)

**Location**: Updated in [src/components/sidebar/Sidebar.tsx](src/components/sidebar/Sidebar.tsx)

## Design Features

### Color Scheme
- Uses existing Snappin theme colors (purple gradient)
- Primary: `#6C5CE7`
- Secondary: `#A29BFE`
- Gradient backgrounds for visual appeal
- Glass-morphism effect on login/signup cards

### UI Components
- Material-UI components throughout
- Consistent with existing Snappin design language
- Smooth transitions and hover effects
- Responsive design for all screen sizes
- Proper focus states and accessibility

### Brand Identity
- ChatBubble icon in gradient circle as logo
- "Snappin" branding with gradient text
- Consistent typography and spacing
- Professional, modern appearance

## Routing Structure

```
/login          → Login page (public)
/signup         → Signup page (public)
/               → Main chat interface (protected)
/*              → Redirects to home
```

## How It Works

### First Time Visitors
1. Visit the app → Redirected to `/login`
2. Click "Sign Up" → Navigate to `/signup`
3. Fill form and submit → Account created → Logged in → Navigate to chat

### Returning Users
1. Visit the app → Auto-login if session exists → Navigate to chat
2. Otherwise → Redirected to `/login`

### Logging Out
1. Click logout icon in sidebar → Session cleared → Navigate to `/login`

## Technical Implementation

### React Router v7
- BrowserRouter for client-side routing
- Routes configured in `App.tsx`
- Navigate hook for programmatic navigation

### Context API
- `ThemeProvider` for theme management
- `AuthProvider` for authentication state
- Nested providers in `App.tsx`

### Form Handling
- Controlled components with React state
- Real-time validation
- Async form submission with loading states
- Error message display

### State Persistence
- localStorage for session persistence
- User data stored as JSON
- Auto-restore on app mount

## Demo Mode

For development and testing, the authentication is currently set to **demo mode**:
- Any email/password combination will work for login
- Signup creates a mock user account
- No backend API calls (simulated with setTimeout)

### To Connect to Real Backend

Replace the mock implementations in [src/context/AuthContext.tsx](src/context/AuthContext.tsx):

```typescript
// Replace this:
await new Promise((resolve) => setTimeout(resolve, 1000));
const mockUser = { ... };

// With actual API calls:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const user = await response.json();
```

## File Structure

```
src/
├── pages/
│   ├── Login.tsx           # Login page component
│   ├── Signup.tsx          # Signup page component
│   └── Chat.tsx            # Main chat interface (moved from App.tsx)
├── context/
│   ├── AuthContext.tsx     # Authentication state management
│   └── ThemeContext.tsx    # Theme state management (existing)
├── components/
│   ├── ProtectedRoute.tsx  # Route guard component
│   └── sidebar/
│       └── Sidebar.tsx     # Updated with logout button
└── App.tsx                 # Updated with routing configuration
```

## Future Enhancements

- Password reset functionality
- Email verification
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- Profile avatar upload
- Remember me checkbox
- Session timeout
- Password strength indicator
- User profile management

## Testing

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:5174`
3. You'll be redirected to login
4. Test signup flow
5. Test login flow
6. Test logout functionality
7. Verify session persistence (refresh page while logged in)

---

**Note**: The authentication system is currently in demo mode and will accept any credentials. Connect to a real backend API for production use.
