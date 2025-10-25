/**
 * Snappin Application Root Component
 * Using React Router v7 with centralized route configuration
 */

import React, { Suspense } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Box, CircularProgress } from "@mui/material";
import routes from "./routes";

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

/**
 * App Routes Component
 * Renders the route configuration using useRoutes hook
 */
function AppRoutes(): React.ReactElement | null {
  const element = useRoutes(routes);
  return element;
}

/**
 * Main Application Component
 * Provides context providers and routing
 */
function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
