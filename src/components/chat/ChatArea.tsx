import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Call as CallIcon,
  Videocam as VideocamIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  Send as SendIcon,
} from "@mui/icons-material";

// =====================
// ✅ Type Definitions
// =====================
interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  initial?: string;
  online?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  avatar?: string;
  images?: string[];
  timestamp: string;
  isOwn?: boolean;
}

interface ChatAreaProps {
  selectedChat?: ChatUser | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

// =====================
// ✅ Component
// =====================
const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  messages,
  onSendMessage,
}) => {
  const [messageInput, setMessageInput] = useState<string>("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={selectedChat.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: selectedChat.avatar ? "transparent" : "primary.main",
            }}
          >
            {!selectedChat.avatar && selectedChat.initial}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {selectedChat.name}
            </Typography>
            {selectedChat.online && (
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
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
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
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              justifyContent: message.isOwn ? "flex-end" : "flex-start",
              gap: 1,
            }}
          >
            {!message.isOwn && (
              <Avatar
                src={message.avatar}
                sx={{ width: 36, height: 36, mt: 1 }}
              />
            )}
            <Box
              sx={{
                maxWidth: "60%",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              {!message.isOwn && (
                <Typography variant="caption" fontWeight={600} sx={{ ml: 1.5 }}>
                  {message.sender}
                </Typography>
              )}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: message.isOwn ? "transparent" : "primary.main",
                  color: message.isOwn ? "text.primary" : "white",
                  borderRadius: 3,
                  border: message.isOwn ? "1px solid" : "none",
                  borderColor: "divider",
                  position: "relative",
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                {message.images && (
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    {message.images.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img}
                        alt={`attachment-${idx}`}
                        sx={{
                          width: 180,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    textAlign: "right",
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    opacity: 0.7,
                    color: message.isOwn ? "text.secondary" : "white",
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Paper>
              {message.isOwn && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {message.sender}
                  </Typography>
                  <Avatar src={message.avatar} sx={{ width: 20, height: 20 }} />
                </Box>
              )}
            </Box>
            {message.isOwn && (
              <Avatar
                src={message.avatar}
                sx={{ width: 36, height: 36, mt: 1 }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Enter Message..."
            value={messageInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setMessageInput(e.target.value)
            }
            onKeyPress={handleKeyPress}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "#F5F7FB",
                "& fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton size="small">
                    <EmojiIcon />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <AttachIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ImageIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 48,
              height: 48,
              "&:hover": { bgcolor: "primary.dark" },
              "&:disabled": { bgcolor: "action.disabledBackground" },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatArea;
