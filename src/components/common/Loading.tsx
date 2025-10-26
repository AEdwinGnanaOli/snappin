import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useThemeContext } from "../../context/ThemeContext";

// ==================== CHAT LIST SKELETON ====================

export const ChatListSkeleton: React.FC = () => {
  const { themeColors } = useThemeContext();

  return (
    <Box sx={{ p: 0 }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Box
          key={item}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${item * 0.1}s`,
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.6 },
            },
          }}
        >
          {/* Avatar Skeleton */}
          <Skeleton
            variant="circular"
            width={50}
            height={50}
            sx={{
              bgcolor: `${themeColors.primary}15`,
            }}
          />

          {/* Content Skeleton */}
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="text"
              width="60%"
              height={24}
              sx={{
                bgcolor: `${themeColors.primary}15`,
                mb: 0.5,
              }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={20}
              sx={{
                bgcolor: `${themeColors.primary}10`,
              }}
            />
          </Box>

          {/* Timestamp Skeleton */}
          <Skeleton
            variant="text"
            width={40}
            height={16}
            sx={{
              bgcolor: `${themeColors.primary}10`,
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

// ==================== MESSAGES SKELETON ====================

export const MessagesSkeleton: React.FC = () => {
  const { themeColors } = useThemeContext();

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((item) => {
        const isOwn = item % 2 === 0;
        return (
          <Box
            key={item}
            sx={{
              display: "flex",
              justifyContent: isOwn ? "flex-end" : "flex-start",
              gap: 1,
              animation: "fadeIn 0.5s ease-in-out",
              animationDelay: `${item * 0.1}s`,
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {/* Avatar for received messages */}
            {!isOwn && (
              <Skeleton
                variant="circular"
                width={36}
                height={36}
                sx={{
                  bgcolor: `${themeColors.primary}15`,
                  alignSelf: "flex-end",
                }}
              />
            )}

            {/* Message Bubble Skeleton */}
            <Box
              sx={{
                maxWidth: "60%",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              {!isOwn && (
                <Skeleton
                  variant="text"
                  width={80}
                  height={16}
                  sx={{
                    bgcolor: `${themeColors.primary}10`,
                    ml: 1,
                  }}
                />
              )}
              <Skeleton
                variant="rectangular"
                width={item * 40 + 150}
                height={60}
                sx={{
                  bgcolor: isOwn
                    ? `${themeColors.primary}10`
                    : `${themeColors.primary}20`,
                  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}
              />
            </Box>

            {/* Avatar for own messages */}
            {isOwn && (
              <Skeleton
                variant="circular"
                width={36}
                height={36}
                sx={{
                  bgcolor: `${themeColors.primary}15`,
                  alignSelf: "flex-end",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

// ==================== FULL PAGE LOADING ====================

interface LoadingProps {
  message?: string;
}

export const FullPageLoading: React.FC<LoadingProps> = ({ message = "Loading..." }) => {
  const { themeColors } = useThemeContext();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* Animated Logo */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: themeColors.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          animation: "bounce 1.5s ease-in-out infinite",
          boxShadow: `0 8px 24px ${themeColors.primary}40`,
          "@keyframes bounce": {
            "0%, 100%": {
              transform: "translateY(0) scale(1)",
              boxShadow: `0 8px 24px ${themeColors.primary}40`,
            },
            "50%": {
              transform: "translateY(-20px) scale(1.1)",
              boxShadow: `0 12px 32px ${themeColors.primary}60`,
            },
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "white",
            opacity: 0.9,
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        variant="h6"
        sx={{
          color: themeColors.primary,
          fontWeight: 600,
          animation: "fade 1.5s ease-in-out infinite",
          "@keyframes fade": {
            "0%, 100%": { opacity: 0.5 },
            "50%": { opacity: 1 },
          },
        }}
      >
        {message}
      </Typography>

      {/* Loading Dots */}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: themeColors.gradient,
              animation: "dotPulse 1.4s ease-in-out infinite",
              animationDelay: `${dot * 0.2}s`,
              "@keyframes dotPulse": {
                "0%, 80%, 100%": {
                  transform: "scale(0.8)",
                  opacity: 0.5,
                },
                "40%": {
                  transform: "scale(1.2)",
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// ==================== SPINNER LOADING ====================

export const SpinnerLoading: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const { themeColors } = useThemeContext();

  return (
    <Box
      sx={{
        display: "inline-block",
        width: size,
        height: size,
        border: `4px solid ${themeColors.primary}20`,
        borderTopColor: themeColors.primary,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        "@keyframes spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      }}
    />
  );
};

// ==================== EMPTY STATE ====================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
  const { themeColors } = useThemeContext();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 4,
        textAlign: "center",
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `${themeColors.primary}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          {icon}
        </Box>
      )}

      <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>

      {action}
    </Box>
  );
};
