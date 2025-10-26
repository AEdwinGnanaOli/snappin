import React from "react";
import { Box, Avatar, Typography, Badge } from "@mui/material";
import { styled } from "@mui/material/styles";
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
}

interface ChatListProps {
  chats: ChatItemDisplay[];
  selectedChat?: ChatItemDisplay | null;
  onChatSelect: (chat: ChatItemDisplay) => void;
}

// Styled Badge for online status
const StyledOnlineBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 3px ${theme.palette.background.paper}`,
    width: 14,
    height: 14,
    borderRadius: "50%",
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.5s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect,
}) => {
  const { themeColors } = useThemeContext();

  return (
    <Box sx={{ p: 0 }}>
      {chats.map((chat, index) => {
        const isSelected = selectedChat?.id === chat.id;

        return (
          <Box
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              p: { xs: 2, md: 2.5 },
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderLeft: "4px solid transparent",
              background: isSelected
                ? `linear-gradient(90deg, ${themeColors.primary}12 0%, ${themeColors.primary}05 100%)`
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
                background: themeColors.gradient,
                borderRadius: "0 4px 4px 0",
                boxShadow: `2px 0 12px ${themeColors.primary}50`,
              } : {},

              "&:hover": {
                background: `linear-gradient(90deg, ${themeColors.primary}08 0%, transparent 100%)`,
                transform: "translateX(4px)",

                "& .chat-avatar": {
                  transform: "scale(1.08)",
                  boxShadow: `0 6px 20px ${themeColors.primary}35`,
                },

                "& .chat-name": {
                  color: themeColors.primary,
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
            {/* Avatar with online status */}
            <Box sx={{ position: "relative", mr: 2 }}>
              {chat.online ? (
                <StyledOnlineBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar
                    src={chat.avatar}
                    className="chat-avatar"
                    sx={{
                      width: { xs: 52, md: 56 },
                      height: { xs: 52, md: 56 },
                      bgcolor: !chat.avatar ? themeColors.gradient : "transparent",
                      background: !chat.avatar ? themeColors.gradient : undefined,
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      border: `3px solid ${isSelected ? themeColors.primary : "white"}`,
                      boxShadow: isSelected
                        ? `0 4px 16px ${themeColors.primary}40`
                        : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {!chat.avatar && chat.initial}
                  </Avatar>
                </StyledOnlineBadge>
              ) : (
                <Avatar
                  src={chat.avatar}
                  className="chat-avatar"
                  sx={{
                    width: { xs: 52, md: 56 },
                    height: { xs: 52, md: 56 },
                    bgcolor: !chat.avatar ? themeColors.gradient : "transparent",
                    background: !chat.avatar ? themeColors.gradient : undefined,
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    border: `3px solid ${isSelected ? themeColors.primary : "white"}`,
                    boxShadow: isSelected
                      ? `0 4px 16px ${themeColors.primary}40`
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {!chat.avatar && chat.initial}
                </Avatar>
              )}
            </Box>

            {/* Chat Info */}
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
                  className="chat-name"
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    color: isSelected ? themeColors.primary : "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    transition: "color 0.3s ease",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {chat.name}
                </Typography>

                {chat.timestamp && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.72rem",
                      color: isSelected ? themeColors.primary : "text.secondary",
                      fontWeight: 500,
                      ml: 1,
                      flexShrink: 0,
                    }}
                  >
                    {chat.timestamp}
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
                    color: chat.isTyping ? themeColors.primary : "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    fontWeight: chat.isTyping ? 500 : 400,
                    fontStyle: chat.isTyping ? "italic" : "normal",
                  }}
                >
                  {chat.isTyping ? (
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
                              bgcolor: themeColors.primary,
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
                    chat.lastMessage || "No messages yet"
                  )}
                </Typography>

                {/* Unread Badge */}
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Box
                    sx={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: "11px",
                      background: themeColors.gradient,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      px: 0.8,
                      ml: 1.5,
                      boxShadow: `0 3px 12px ${themeColors.primary}50`,
                      animation: "pulseBadge 2s infinite",
                      "@keyframes pulseBadge": {
                        "0%, 100%": {
                          boxShadow: `0 3px 12px ${themeColors.primary}50`,
                          transform: "scale(1)",
                        },
                        "50%": {
                          boxShadow: `0 4px 16px ${themeColors.primary}70`,
                          transform: "scale(1.05)",
                        },
                      },
                    }}
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
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

export default ChatList;
