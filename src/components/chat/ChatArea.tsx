import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { MessageBox } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import GroupDetailsDialog from "../dialogs/GroupDetailsDialog";
import type {
  Chat as ChatType,
  UserData,
} from "../../services/firestoreService";
import { useThemeContext } from "../../context/ThemeContext";
import { MessagesSkeleton } from "../common/Loading";

// =====================
// ✅ Type Definitions
// =====================
interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  initial?: string;
  online?: boolean;
  type?: "private" | "group";
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  avatar?: string;
  images?: string[];
  timestamp: string;
  isOwn?: boolean;
  read?: boolean;
}

interface ChatAreaProps {
  selectedChat?: ChatUser | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  typingIndicator?: string;
  chatData?: ChatType | null;
  currentUserId?: string;
  allUsers?: UserData[];
  onRefresh?: () => void;
  isLoadingMessages?: boolean;
}

// =====================
// ✅ Component
// =====================
const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  messages,
  onSendMessage,
  onTyping,
  typingIndicator,
  chatData,
  currentUserId,
  allUsers,
  onRefresh,
  isLoadingMessages = false,
}) => {
  const [messageInput, setMessageInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const { themeColors } = useThemeContext();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset input when chat changes
  useEffect(() => {
    setMessageInput("");
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedChat?.id]);

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage) {
      console.log("📤 Sending message:", trimmedMessage);
      onSendMessage(trimmedMessage);

      // Clear input immediately - this is the key fix
      setMessageInput("");

      // Clear typing indicator
      if (onTyping) {
        onTyping(false);
      }
      setIsTyping(false);

      // Clear any pending typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Typing indicator logic
    if (onTyping && value.trim()) {
      if (!isTyping) {
        onTyping(true);
        setIsTyping(true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to clear typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (onTyping) {
          onTyping(false);
        }
        setIsTyping(false);
      }, 3000);
    } else if (onTyping && !value.trim() && isTyping) {
      onTyping(false);
      setIsTyping(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onTyping && isTyping) {
        onTyping(false);
      }
    };
  }, [onTyping, isTyping]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGroupDetailsClick = () => {
    setShowGroupDetails(true);
    handleMenuClose();
  };

  if (!selectedChat) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          width: "100%",
        }}
      >
        <Box sx={{ textAlign: "center", px: 3 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(108, 92, 231, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 3,
            }}
          >
            <SendIcon sx={{ fontSize: 60, color: "primary.main" }} />
          </Box>
          <Typography
            variant="h5"
            color="text.primary"
            fontWeight={600}
            gutterBottom
          >
            Welcome to Chat
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Select a chat to start messaging
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Choose from your existing conversations or start a new one
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
            ml: { xs: 6, md: 0 },
          }}
        >
          <Avatar
            src={selectedChat.avatar}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              bgcolor: selectedChat.avatar ? "transparent" : "primary.main",
            }}
          >
            {!selectedChat.avatar && selectedChat.initial}
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
            >
              {selectedChat.name}
            </Typography>
            {selectedChat.online && selectedChat.type === "private" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#44b700",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Online
                </Typography>
              </Box>
            )}
            {selectedChat.type === "group" && chatData && (
              <Typography variant="caption" color="text.secondary">
                {chatData.participants.length} members
              </Typography>
            )}
          </Box>
        </Box>

        {selectedChat.type === "group" && (
          <>
            <IconButton
              onClick={handleMenuClick}
              sx={{
                "&:focus": { outline: "none" },
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleGroupDetailsClick}>
                <ListItemIcon>
                  <InfoIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Group Details</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Paper>

      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {isLoadingMessages ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: message.isOwn ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <MessageBox
                  id={message.id}
                  position={message.isOwn ? "right" : "left"}
                  type={
                    message.images && message.images.length > 0
                      ? "photo"
                      : "text"
                  }
                  text={message.text}
                  title={!message.isOwn ? message.sender : ""}
                  date={new Date(message.timestamp)}
                  avatar={message.avatar || ""}
                  notch={true}
                  focus={false}
                  forwarded={false}
                  replyButton={false}
                  removeButton={false}
                  retracted={false}
                  status="read"
                  titleColor="#333"
                  dateString={message.timestamp}
                  data={
                    message.images && message.images.length > 0
                      ? {
                          uri: message.images[0],
                          status: { click: false, loading: 0 },
                        }
                      : undefined
                  }
                />
                {/* Read Receipt - Double Tick for Own Messages */}
              </Box>
            ))}

            {/* Typing Indicator */}
            {typingIndicator && (
              <Box sx={{ mt: 1 }}>
                <MessageBox
                  id="typing"
                  position="left"
                  type="text"
                  text="..."
                  title={typingIndicator}
                  date={new Date()}
                  className="typing-indicator"
                  notch={true}
                  focus={false}
                  forwarded={false}
                  replyButton={false}
                  removeButton={false}
                  retracted={false}
                  status="read"
                  titleColor="#333"
                  dateString=""
                />
              </Box>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, md: 1.5 },
            alignItems: "flex-end",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                background: "linear-gradient(135deg, #F8F9FC 0%, #F5F7FB 100%)",
                border: "2px solid rgba(108, 92, 231, 0.08)",
                py: 0.5,
                fontSize: "0.95rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                "& fieldset": { border: "none" },
                "&:hover": {
                  background: "#F5F7FB",
                  borderColor: "rgba(108, 92, 231, 0.15)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                },
                "&.Mui-focused": {
                  background: "white",
                  borderColor: "rgba(108, 92, 231, 0.3)",
                  boxShadow: "0 4px 20px rgba(108, 92, 231, 0.15)",
                },
              },
              "& .MuiInputBase-input": {
                fontWeight: 500,
                color: "#2c3e50",
                "&::placeholder": {
                  color: "rgba(0, 0, 0, 0.4)",
                  fontWeight: 400,
                  opacity: 1,
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: themeColors.primary },
                      }}
                    >
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: themeColors.primary },
                      }}
                    >
                      <AttachIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: themeColors.primary },
                      }}
                    >
                      <ImageIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            sx={{
              background: "linear-gradient(135deg, #FF6B9D 0%, #FFC371 100%)",
              color: "white",
              width: { xs: 48, md: 52 },
              height: { xs: 48, md: 52 },
              borderRadius: 2.5,
              flexShrink: 0,
              transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              boxShadow: "0 4px 16px rgba(255, 107, 157, 0.4)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #FF8FAB 0%, #FFD89B 100%)",
                transform: "scale(1.12) rotate(-5deg)",
                boxShadow: "0 8px 24px rgba(255, 107, 157, 0.6)",
              },
              "&:active": {
                transform: "scale(0.92) rotate(0deg)",
                boxShadow: "0 2px 8px rgba(255, 107, 157, 0.3)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.08)",
                color: "rgba(0, 0, 0, 0.26)",
                boxShadow: "none",
                border: "none",
              },
            }}
          >
            <SendIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
          </IconButton>
        </Box>
      </Paper>

      {/* Group Details Dialog */}
      {selectedChat?.type === "group" &&
        chatData &&
        currentUserId &&
        allUsers && (
          <GroupDetailsDialog
            open={showGroupDetails}
            onClose={() => setShowGroupDetails(false)}
            chatData={chatData}
            currentUserId={currentUserId}
            allUsers={allUsers}
            onRefresh={onRefresh}
          />
        )}
    </Box>
  );
};

export default ChatArea;
