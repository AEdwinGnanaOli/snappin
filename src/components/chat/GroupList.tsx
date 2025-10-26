import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { Group as GroupIcon } from "@mui/icons-material";
import { useThemeContext } from "../../context/ThemeContext";

interface ChatItemDisplay {
  id: string;
  name: string;
  avatar?: string;
  initial: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  online?: boolean;
  isTyping?: boolean;
  type: "private" | "group";
  badge?: string;
}

interface GroupListProps {
  groups: ChatItemDisplay[];
  selectedChat?: ChatItemDisplay | null;
  onChatSelect: (group: ChatItemDisplay) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  selectedChat,
  onChatSelect,
}) => {
  const { themeColors } = useThemeContext();

  return (
    <Box sx={{ p: 0 }}>
      {groups.map((group, index) => {
        const isSelected = selectedChat?.id === group.id;

        return (
          <Box
            key={group.id}
            onClick={() => onChatSelect(group)}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              p: { xs: 2, md: 2.5 },
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderLeft: "4px solid transparent",
              background: isSelected
                ? `linear-gradient(90deg, ${themeColors.secondary}15 0%, ${themeColors.secondary}08 100%)`
                : "transparent",
              animation: `slideIn 0.4s ease ${index * 0.05}s backwards`,

              // Gradient border on left when selected
              "&::before": isSelected ? {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: "4px",
                background: `linear-gradient(180deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`,
                borderRadius: "0 4px 4px 0",
                boxShadow: `2px 0 12px ${themeColors.secondary}50`,
              } : {},

              "&:hover": {
                background: `linear-gradient(90deg, ${themeColors.secondary}10 0%, transparent 100%)`,
                transform: "translateX(4px)",

                "& .group-avatar": {
                  transform: "scale(1.08) rotate(-2deg)",
                  boxShadow: `0 6px 20px ${themeColors.secondary}40`,
                },

                "& .group-name": {
                  color: themeColors.secondary,
                },

                "& .group-icon": {
                  transform: "scale(1.2) rotate(15deg)",
                },
              },

              "&:active": {
                transform: "translateX(2px) scale(0.98)",
              },

              "@keyframes slideIn": {
                from: {
                  opacity: 0,
                  transform: "translateX(-20px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              },
            }}
          >
            {/* Avatar with group indicator */}
            <Box sx={{ position: "relative", mr: 2 }}>
              <Avatar
                src={group.avatar}
                className="group-avatar"
                sx={{
                  width: { xs: 52, md: 56 },
                  height: { xs: 52, md: 56 },
                  bgcolor: !group.avatar ? themeColors.secondary : "transparent",
                  background: !group.avatar
                    ? `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`
                    : undefined,
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  border: `3px solid ${isSelected ? themeColors.secondary : "white"}`,
                  boxShadow: isSelected
                    ? `0 4px 16px ${themeColors.secondary}45`
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {!group.avatar && group.initial}
              </Avatar>

              {/* Group Icon Badge */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                <GroupIcon
                  className="group-icon"
                  sx={{
                    fontSize: 12,
                    color: themeColors.secondary,
                    transition: "all 0.3s ease",
                  }}
                />
              </Box>
            </Box>

            {/* Group Info */}
            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              {/* Name and Timestamp */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  className="group-name"
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    color: isSelected ? themeColors.secondary : "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    transition: "color 0.3s ease",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {group.name}
                </Typography>

                {group.timestamp && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.72rem",
                      color: isSelected ? themeColors.secondary : "text.secondary",
                      fontWeight: 500,
                      ml: 1,
                      flexShrink: 0,
                    }}
                  >
                    {group.timestamp}
                  </Typography>
                )}
              </Box>

              {/* Last Message and Unread */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.85rem", md: "0.875rem" },
                    color: group.isTyping ? themeColors.secondary : "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    fontWeight: group.isTyping ? 500 : 400,
                    fontStyle: group.isTyping ? "italic" : "normal",
                  }}
                >
                  {group.isTyping ? (
                    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      typing
                      <Box sx={{ display: "flex", gap: 0.3, ml: 0.3 }}>
                        {[0, 1, 2].map((dot) => (
                          <Box
                            key={dot}
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: themeColors.secondary,
                              animation: "typingDot 1.4s infinite",
                              animationDelay: `${dot * 0.2}s`,
                              "@keyframes typingDot": {
                                "0%, 60%, 100%": {
                                  opacity: 0.3,
                                  transform: "translateY(0)",
                                },
                                "30%": {
                                  opacity: 1,
                                  transform: "translateY(-3px)",
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    group.lastMessage || "No messages yet"
                  )}
                </Typography>

                {/* Unread Badge */}
                {group.unreadCount && group.unreadCount > 0 && (
                  <Box
                    sx={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: "11px",
                      background: `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      px: 0.8,
                      ml: 1.5,
                      boxShadow: `0 3px 12px ${themeColors.secondary}50`,
                      animation: "pulseBadge 2s infinite",
                      "@keyframes pulseBadge": {
                        "0%, 100%": {
                          boxShadow: `0 3px 12px ${themeColors.secondary}50`,
                          transform: "scale(1)",
                        },
                        "50%": {
                          boxShadow: `0 4px 16px ${themeColors.secondary}70`,
                          transform: "scale(1.05)",
                        },
                      },
                    }}
                  >
                    {group.unreadCount > 99 ? "99+" : group.unreadCount}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default GroupList;
