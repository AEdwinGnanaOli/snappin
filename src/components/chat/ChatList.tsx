import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ChatItem } from "../../types/chat";
import { getColorFromInitial } from "../../utils/colorUtils";

// Styled Badge for online status
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

interface ChatListProps {
  chats: ChatItem[];
  selectedChat?: ChatItem | null;
  onChatSelect: (chat: ChatItem) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect,
}) => {
  return (
    <List sx={{ p: 0 }}>
      {chats.map((chat) => (
        <ListItem key={chat.id} disablePadding>
          <ListItemButton
            selected={selectedChat?.id === chat.id}
            onClick={() => onChatSelect(chat)}
            sx={{
              px: 2,
              py: 1.5,
              "&.Mui-selected": {
                bgcolor: "rgba(108, 92, 231, 0.08)",
                borderLeft: "3px solid",
                borderColor: "primary.main",
              },
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemAvatar>
              {chat.online ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  {chat.avatar ? (
                    <Avatar src={chat.avatar} />
                  ) : (
                    <Avatar sx={{ bgcolor: getColorFromInitial(chat.initial) }}>
                      {chat.initial}
                    </Avatar>
                  )}
                </StyledBadge>
              ) : chat.avatar ? (
                <Avatar src={chat.avatar} />
              ) : (
                <Avatar sx={{ bgcolor: getColorFromInitial(chat.initial) }}>
                  {chat.initial}
                </Avatar>
              )}
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {chat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chat.timestamp}
                  </Typography>
                </Box>
              }
              secondary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color={chat.isTyping ? "primary.main" : "text.secondary"}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "200px",
                    }}
                  >
                    {chat.isTyping ? "Typing..." : chat.lastMessage}
                  </Typography>

                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <Chip
                      label={chat.unreadCount}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        bgcolor: "#FF6B9D",
                        color: "white",
                        fontSize: "0.75rem",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ChatList;
