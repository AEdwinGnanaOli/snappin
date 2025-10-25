/**
 * Application Route Constants
 * Centralized route paths for the Snappin application
 */

export const ROUTES = {
  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
  },

  // Main Application Routes
  HOME: '/',
  CHAT: '/',

  // Future Routes (ready for expansion)
  SETTINGS: '/settings',
  PROFILE: '/profile',
  GROUPS: '/groups',

  // Wildcard
  NOT_FOUND: '*',
} as const;

// Type for route paths
export type RouteKey = keyof typeof ROUTES;
export type AuthRouteKey = keyof typeof ROUTES.AUTH;
