# Snappin Project Structure

## Complete Folder Tree

```
Snappin/
├── public/                          # Static public assets
│   └── vite.svg
│
├── src/                             # Source code
│   ├── assets/                      # Application assets
│   │   └── react.svg
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── chat/                    # Chat feature components
│   │   │   ├── ChatArea.tsx         # Main chat display area
│   │   │   ├── ChatList.tsx         # List of user chats
│   │   │   └── GroupList.tsx        # List of group chats
│   │   │
│   │   ├── common/                  # Shared common components
│   │   │   └── ProtectedRoute.tsx   # Route guard for authentication
│   │   │
│   │   ├── dialogs/                 # Modal/Dialog components
│   │   │   ├── AddMemberDialog.tsx  # Create group dialog
│   │   │   └── ThemeSettings.tsx    # Theme customization dialog
│   │   │
│   │   └── sidebar/                 # Sidebar components
│   │       └── Sidebar.tsx          # Main navigation sidebar
│   │
│   ├── constants/                   # App constants (ready for use)
│   │   # Future: routes.ts, config.ts, api.ts
│   │
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state management
│   │   └── ThemeContext.tsx         # Theme state management
│   │
│   ├── hooks/                       # Custom React hooks (ready for use)
│   │   # Future: useAuth.ts, useChat.ts, useTheme.ts
│   │
│   ├── pages/                       # Page components (route views)
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── Login.tsx            # Login page
│   │   │   └── Signup.tsx           # Signup page
│   │   │
│   │   ├── chat/                    # Chat pages
│   │   │   ├── Chat.tsx             # Main chat interface
│   │   │   └── Message.tsx          # Message view
│   │   │
│   │   └── Index.tsx                # Landing/Home page
│   │
│   ├── services/                    # API & external services (ready for use)
│   │   # Future: api/, socket/
│   │
│   ├── styles/                      # Global styles
│   │   ├── index.css                # Main global styles
│   │   └── theme.css                # Theme-specific styles
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── chat.ts                  # Chat-related types
│   │
│   ├── utils/                       # Utility functions
│   │   ├── colorUtils.ts            # Color manipulation functions
│   │   ├── data.ts                  # Mock data for development
│   │   └── themePresets.ts          # Theme preset configurations
│   │
│   ├── App.tsx                      # Root application component
│   └── main.tsx                     # Application entry point
│
├── .gitignore                       # Git ignore rules
├── AUTHENTICATION.md                # Authentication documentation
├── FOLDER_STRUCTURE.md              # Folder structure plan
├── REORGANIZATION_SUMMARY.md        # Reorganization details
├── PROJECT_STRUCTURE.md             # This file
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json               # TypeScript Node configuration
└── vite.config.ts                   # Vite build configuration
```

## Folder Descriptions

### 📁 `/src/components/`
Reusable UI components organized by feature/domain:

- **`chat/`** - Chat-related components (ChatArea, ChatList, GroupList)
- **`common/`** - Shared components used across features (ProtectedRoute)
- **`dialogs/`** - Modal and dialog components (AddMemberDialog, ThemeSettings)
- **`sidebar/`** - Sidebar navigation components

### 📁 `/src/pages/`
Page-level components that represent routes:

- **`auth/`** - Authentication flows (Login, Signup)
- **`chat/`** - Chat application pages (Chat, Message)
- **`Index.tsx`** - Landing/home page

### 📁 `/src/context/`
React Context API providers for global state:

- **`AuthContext.tsx`** - Authentication state (user, login, logout)
- **`ThemeContext.tsx`** - Theme state (colors, presets)

### 📁 `/src/utils/`
Helper functions and utilities:

- **`colorUtils.ts`** - Color manipulation (lighten, darken, generate)
- **`data.ts`** - Mock data for development
- **`themePresets.ts`** - Predefined theme configurations

### 📁 `/src/types/`
TypeScript type definitions:

- **`chat.ts`** - Chat, Message, Group, User types

### 📁 `/src/styles/`
Global CSS styles:

- **`index.css`** - Base styles, fonts, resets
- **`theme.css`** - Theme-specific styles

### 📁 `/src/constants/` (Ready for future)
Application-wide constants:

- Routes configuration
- API endpoints
- Configuration values
- Feature flags

### 📁 `/src/hooks/` (Ready for future)
Custom React hooks:

- useAuth - Authentication hook
- useChat - Chat functionality hook
- useTheme - Theme management hook

### 📁 `/src/services/` (Ready for future)
External service integrations:

- API services
- WebSocket/Socket.io
- Local storage
- Analytics

## File Naming Conventions

### Components
- **PascalCase** for component files: `ChatArea.tsx`, `Sidebar.tsx`
- Default export for main component
- Named exports for types/interfaces

### Utilities
- **camelCase** for utility files: `colorUtils.ts`, `themePresets.ts`
- Named exports only

### Types
- **camelCase** with `.types.ts` suffix: `chat.types.ts`
- All named exports

### Styles
- **kebab-case** for CSS files: `index.css`, `theme.css`

## Import Examples

### Absolute Imports (Current)
```typescript
// From pages
import Sidebar from "../../components/sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";

// From components
import ChatList from "../chat/ChatList";
import type { ChatItem } from "../../types/chat";
```

### Path Aliases (Future Enhancement)
```typescript
// After configuring tsconfig.json paths
import Sidebar from "@/components/sidebar/Sidebar";
import { useAuth } from "@/context/AuthContext";
import ChatList from "@/components/chat/ChatList";
import type { ChatItem } from "@/types/chat";
```

## Component Organization Pattern

```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.styles.ts # Styled components (if needed)
├── ComponentName.test.tsx  # Unit tests (if needed)
├── types.ts               # Component-specific types
└── index.ts               # Barrel export
```

Currently using flat structure, but can upgrade to this pattern as needed.

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19.1.1 |
| **Language** | TypeScript | ~5.9.3 |
| **Build Tool** | Vite | 7.1.14 |
| **Routing** | React Router | 7.9.4 |
| **UI Library** | Material-UI | 7.3.4 |
| **Styling** | Styled Components | 6.1.19 |

## Best Practices Implemented

✅ **Feature-based organization** - Components grouped by domain
✅ **Separation of concerns** - Clear boundaries between layers
✅ **Scalable structure** - Ready for growth
✅ **Type safety** - TypeScript throughout
✅ **Consistent naming** - Following conventions
✅ **Documentation** - Well-documented structure

## Quick Navigation Guide

| What I need | Where to find it |
|-------------|-----------------|
| Add a new page | `/src/pages/[feature]/` |
| Add a component | `/src/components/[feature]/` |
| Add a utility function | `/src/utils/` |
| Add a type definition | `/src/types/` |
| Modify authentication | `/src/context/AuthContext.tsx` |
| Modify theme | `/src/context/ThemeContext.tsx` |
| Add global styles | `/src/styles/` |
| Configure routes | `/src/App.tsx` |

## Growth Path

As the application grows, consider:

1. **Extract custom hooks** - Move logic from components to `hooks/`
2. **Add service layer** - Abstract API calls to `services/`
3. **Define constants** - Move magic strings to `constants/`
4. **Add testing** - Create `__tests__/` folders alongside components
5. **Implement path aliases** - Simplify imports with `@/` prefix
6. **Add barrel exports** - Create `index.ts` files for cleaner imports

---

**Last Updated**: 2025-10-25
**Status**: ✅ Production Ready
**Build**: ✅ Passing
