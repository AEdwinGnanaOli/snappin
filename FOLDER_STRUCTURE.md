# Snappin Folder Structure

## Proposed Organized Structure

```
src/
├── assets/                    # Static assets (images, icons, fonts)
│   └── react.svg
│
├── components/                # Shared/reusable components
│   ├── common/               # Common UI components
│   │   └── ProtectedRoute.tsx
│   │
│   ├── chat/                 # Chat-related components
│   │   ├── ChatArea.tsx
│   │   ├── ChatList.tsx
│   │   └── GroupList.tsx
│   │
│   ├── sidebar/              # Sidebar components
│   │   └── Sidebar.tsx
│   │
│   ├── dialogs/              # Dialog/Modal components
│   │   ├── AddMemberDialog.tsx
│   │   └── ThemeSettings.tsx
│   │
│   └── layout/               # Layout components (future)
│       └── MainLayout.tsx
│
├── pages/                     # Page components (routes)
│   ├── auth/                 # Authentication pages
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   │
│   ├── chat/                 # Chat pages
│   │   ├── Chat.tsx
│   │   └── Message.tsx
│   │
│   └── Index.tsx             # Landing/Home page
│
├── context/                   # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                     # Custom React hooks (future)
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useTheme.ts
│
├── services/                  # API services (future)
│   ├── api/
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   └── user.service.ts
│   └── socket/
│       └── socket.service.ts
│
├── utils/                     # Utility functions
│   ├── colorUtils.ts
│   ├── themePresets.ts
│   └── data.ts               # Mock data (will move to services later)
│
├── types/                     # TypeScript type definitions
│   ├── auth.types.ts
│   ├── chat.types.ts
│   └── user.types.ts
│
├── constants/                 # App constants
│   ├── routes.ts
│   └── config.ts
│
├── styles/                    # Global styles
│   ├── index.css
│   └── theme.css
│
├── App.tsx                    # Root component
└── main.tsx                   # App entry point
```

## Current vs. Proposed Changes

### Components
**Before:**
```
components/
├── ChatArea.tsx
├── ChatList.tsx
├── GroupList.tsx
├── ThemeSettings.tsx
├── ProtectedRoute.tsx
├── dialog/
│   └── AddMemberDialog.tsx
└── sidebar/
    └── Sidebar.tsx
```

**After:**
```
components/
├── common/
│   └── ProtectedRoute.tsx
├── chat/
│   ├── ChatArea.tsx
│   ├── ChatList.tsx
│   └── GroupList.tsx
├── sidebar/
│   └── Sidebar.tsx
└── dialogs/
    ├── AddMemberDialog.tsx
    └── ThemeSettings.tsx
```

### Pages
**Before:**
```
pages/
├── Index.tsx
├── Login.tsx
├── Signup.tsx
├── Chat.tsx
└── message/
    └── Message.tsx
```

**After:**
```
pages/
├── auth/
│   ├── Login.tsx
│   └── Signup.tsx
├── chat/
│   ├── Chat.tsx
│   └── Message.tsx
└── Index.tsx
```

### Types
**Before:**
```
types/
└── chat.ts
```

**After:**
```
types/
├── auth.types.ts
├── chat.types.ts
└── user.types.ts
```

### Styles
**Before:**
```
src/
├── index.css
└── App.css
```

**After:**
```
styles/
├── index.css
└── theme.css (renamed from App.css)
```

## Benefits of This Structure

1. **Feature-based Organization**: Components grouped by feature/domain
2. **Scalability**: Easy to add new features without clutter
3. **Maintainability**: Clear separation of concerns
4. **Discoverability**: Easy to find files by their purpose
5. **Best Practices**: Follows React/TypeScript community standards
6. **Future-ready**: Room for services, hooks, constants, etc.

## Migration Steps

1. Create new folder structure
2. Move files to appropriate locations
3. Update all import statements
4. Test application
5. Remove old empty folders
6. Update documentation

## Import Path Examples

**Before:**
```typescript
import ChatArea from '../components/ChatArea';
import { useAuth } from '../context/AuthContext';
```

**After:**
```typescript
import ChatArea from '@/components/chat/ChatArea';
import { useAuth } from '@/context/AuthContext';
```

Note: We can set up path aliases in `tsconfig.json` for cleaner imports.
