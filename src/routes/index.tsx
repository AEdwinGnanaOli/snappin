/**
 * Route Configuration for Snappin Application
 * Using React Router v7 best practices
 */

import React from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Lazy load components for better performance
const Login = React.lazy(() => import('../pages/auth/Login'));
const Signup = React.lazy(() => import('../pages/auth/Signup'));
const Chat = React.lazy(() => import('../pages/chat/Chat'));

// Layout components
import ProtectedRoute from '../components/common/ProtectedRoute';

/**
 * Public Routes - Accessible without authentication
 */
const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.AUTH.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.AUTH.SIGNUP,
    element: <Signup />,
  },
];

/**
 * Protected Routes - Require authentication
 */
const protectedRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
];

/**
 * Fallback Routes
 */
const fallbackRoutes: RouteObject[] = [
  {
    path: ROUTES.NOT_FOUND,
    element: <Navigate to={ROUTES.HOME} replace />,
  },
];

/**
 * Complete Route Configuration
 * Export all routes in a single array
 */
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...fallbackRoutes,
];

export default routes;
