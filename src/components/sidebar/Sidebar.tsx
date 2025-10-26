import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import ChatList from "../chat/ChatList";
import GroupList from "../chat/GroupList";
import CreateGroupDialog from "../dialogs/CreateGroupDialog";
import SearchUsersDialog from "../dialogs/SearchUsersDialog";
import { ChatListSkeleton } from "../common/Loading";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import type { UserData } from "../../services/firestoreService";

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

interface SidebarProps {
  activeView: "chats" | "groups";
  onViewChange: (view: "chats" | "groups") => void;
  chats: ChatItemDisplay[];
  groups: ChatItemDisplay[];
  selectedChat?: ChatItemDisplay | null;
  onChatSelect: (chat: ChatItemDisplay) => void;
  onGroupCreate: (groupData: {
    name: string;
    description?: string;
    memberIds: string[];
  }) => void;
  allUsers: UserData[];
  currentUserId: string;
  onUserSelect: (user: UserData) => void;
  showUserList?: boolean;
  isLoadingChats?: boolean;
}

const DRAWER_WIDTH = 360;

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  chats,
  groups,
  selectedChat,
  onChatSelect,
  onGroupCreate,
  allUsers,
  currentUserId,
  onUserSelect,
  showUserList = false,
  isLoadingChats = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isSearchUsersDialogOpen, setIsSearchUsersDialogOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const { themeColors } = useThemeContext();
  const [currentView, setCurrentView] = useState<"chats" | "groups">("chats");

  // Get current user's display name and email
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const userEmail = currentUser?.email || '';
  const userInitial = displayName[0].toUpperCase();

  const menuItems = [
    { icon: <ChatIcon />, view: "chats" as const, label: "Chats" },
    { icon: <GroupIcon />, view: "groups" as const, label: "Groups" },
  ];

  const handleMenuClick = (view: "chats" | "groups") => {
    setCurrentView(view);
    onViewChange(view);
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getViewTitle = () => {
    if (currentView === "chats") return "Chats";
    return "Groups";
  };

  const getSearchPlaceholder = () => {
    if (currentView === "chats") return "Search chats...";
    return "Search groups...";
  };

  return (
    <>
      {/* Left Navigation Bar */}
      <Box
        sx={{
          width: { xs: 60, sm: 70, md: 80 },
          background: `linear-gradient(180deg, ${themeColors.primary}08 0%, ${themeColors.secondary}05 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: { xs: 2, md: 3 },
          borderRight: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.05)",
          position: "relative",
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Logo */}
        <Avatar sx={{
          width: { xs: 44, md: 52 },
          height: { xs: 44, md: 52 },
          background: themeColors.gradient,
          mb: { xs: 3, md: 4 },
          boxShadow: `0 8px 24px ${themeColors.primary}35`,
          border: "2px solid rgba(255, 255, 255, 0.8)",
          transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.1) rotate(5deg)",
            boxShadow: `0 12px 32px ${themeColors.primary}50`,
          },
        }}>
          <ChatIcon sx={{ fontSize: { xs: 22, md: 26 }, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
        </Avatar>

        {/* Menu Items */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {menuItems.map((item) => (
            <IconButton
              key={item.view}
              onClick={() => handleMenuClick(item.view)}
              sx={{
                position: "relative",
                color: currentView === item.view ? "white" : "text.secondary",
                background: currentView === item.view ? themeColors.gradient : "transparent",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: currentView === item.view ? `0 6px 20px ${themeColors.primary}45` : "none",
                width: { xs: 44, md: 48 },
                height: { xs: 44, md: 48 },
                "&::before": currentView === item.view ? {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "-16px",
                  transform: "translateY(-50%)",
                  width: "4px",
                  height: "60%",
                  borderRadius: "0 4px 4px 0",
                  background: themeColors.gradient,
                  boxShadow: `2px 0 8px ${themeColors.primary}50`,
                } : {},
                "&:hover": {
                  background: currentView === item.view
                    ? themeColors.gradient
                    : `${themeColors.primary}15`,
                  transform: "scale(1.1)",
                  boxShadow: `0 8px 24px ${themeColors.primary}50`,
                },
              }}
              title={item.label}
            >
              {item.icon}
            </IconButton>
          ))}

          {/* New Chat Button */}
          <IconButton
            onClick={() => setIsSearchUsersDialogOpen(true)}
            sx={{
              color: themeColors.primary,
              background: `${themeColors.primary}12`,
              border: `2px dashed ${themeColors.primary}40`,
              width: { xs: 44, md: 48 },
              height: { xs: 44, md: 48 },
              transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              "&:hover": {
                background: `${themeColors.primary}20`,
                border: `2px solid ${themeColors.primary}`,
                transform: "scale(1.15) rotate(90deg)",
                boxShadow: `0 8px 24px ${themeColors.primary}40`,
              },
            }}
            title="Start New Chat"
          >
            <PersonAddIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
          </IconButton>
        </Box>

        {/* User Profile Section */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            mt: "auto",
            pt: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* User Avatar */}
          <Avatar
            src={currentUser?.photoURL || undefined}
            sx={{
              width: { xs: 44, md: 50 },
              height: { xs: 44, md: 50 },
              background: !currentUser?.photoURL ? themeColors.gradient : undefined,
              border: "3px solid white",
              boxShadow: `0 4px 12px ${themeColors.primary}30`,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: `0 6px 20px ${themeColors.primary}50`,
              },
            }}
            title={displayName}
          >
            {!currentUser?.photoURL && userInitial}
          </Avatar>

          {/* Logout Button */}
          <IconButton
            onClick={logout}
            sx={{
              color: "text.secondary",
              width: { xs: 40, md: 44 },
              height: { xs: 40, md: 44 },
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255, 0, 0, 0.1)",
                color: "error.main",
                transform: "scale(1.05)",
              },
            }}
            title="Logout"
          >
            <LogoutIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
          </IconButton>
        </Box>
      </Box>

      {/* Chat/Group List Panel */}
      <Box
        sx={{
          width: { xs: "calc(100% - 60px)", sm: "calc(100% - 70px)", md: DRAWER_WIDTH },
          maxWidth: { md: DRAWER_WIDTH },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(135deg, ${themeColors.primary}03 0%, transparent 100%)`,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                background: themeColors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
              }}
            >
              {getViewTitle()}
            </Typography>

            {/* Action buttons based on current view */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {currentView === "groups" ? (
                <IconButton
                  onClick={() => setIsGroupDialogOpen(true)}
                  sx={{
                    background: themeColors.gradient,
                    color: "white",
                    width: 36,
                    height: 36,
                    boxShadow: `0 4px 12px ${themeColors.primary}40`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: themeColors.gradient,
                      transform: "scale(1.1) rotate(15deg)",
                      boxShadow: `0 6px 20px ${themeColors.primary}60`,
                    },
                  }}
                  title="Create New Group"
                >
                  <GroupIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => setIsSearchUsersDialogOpen(true)}
                  sx={{
                    background: themeColors.gradient,
                    color: "white",
                    width: 36,
                    height: 36,
                    boxShadow: `0 4px 12px ${themeColors.primary}40`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: themeColors.gradient,
                      transform: "scale(1.1) rotate(15deg)",
                      boxShadow: `0 6px 20px ${themeColors.primary}60`,
                    },
                  }}
                  title="Start New Chat"
                >
                  <PersonAddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            size="medium"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: themeColors.primary, fontSize: 22 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "#F5F7FB",
                fontSize: "0.95rem",
                py: 0.5,
                transition: "all 0.3s ease",
                border: "2px solid transparent",
                boxShadow: "0 2px 8px rgba(108, 92, 231, 0.08)",
                "& fieldset": {
                  border: "none",
                },
                "&:hover": {
                  bgcolor: "#EEF1F7",
                  boxShadow: "0 4px 12px rgba(108, 92, 231, 0.12)",
                },
                "&.Mui-focused": {
                  bgcolor: "white",
                  border: `2px solid ${themeColors.primary}30`,
                  boxShadow: `0 4px 16px ${themeColors.primary}20`,
                },
              },
            }}
          />
        </Box>

        {/* Quick Contacts - Only show for chats view */}
        {currentView === "chats" && chats.length > 0 && (
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: `linear-gradient(90deg, ${themeColors.primary}02 0%, transparent 100%)`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="600"
              sx={{
                mb: 1.5,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.7rem",
              }}
            >
              Recent Chats
            </Typography>
            <Box sx={{
              display: "flex",
              gap: 2.5,
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: `${themeColors.primary}30`,
                borderRadius: "2px",
              },
            }}>
              {chats.slice(0, 6).map((chat, index) => (
                <Box
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 68,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    animation: `fadeIn 0.4s ease ${index * 0.1}s backwards`,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      "& .avatar": {
                        boxShadow: `0 8px 24px ${themeColors.primary}40`,
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  <Avatar
                    src={chat.avatar}
                    className="avatar"
                    sx={{
                      width: 58,
                      height: 58,
                      mb: 0.8,
                      border: `3px solid ${selectedChat?.id === chat.id ? themeColors.primary : "white"}`,
                      boxShadow: selectedChat?.id === chat.id
                        ? `0 6px 20px ${themeColors.primary}50`
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      background: !chat.avatar ? themeColors.gradient : undefined,
                    }}
                  >
                    {!chat.avatar && chat.initial}
                  </Avatar>
                  <Typography
                    variant="caption"
                    noWrap
                    fontWeight="500"
                    sx={{
                      maxWidth: 68,
                      color: selectedChat?.id === chat.id ? themeColors.primary : "text.primary",
                      fontSize: "0.75rem",
                    }}
                  >
                    {chat.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* List Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {isLoadingChats ? (
            <ChatListSkeleton />
          ) : currentView === "chats" ? (
            filteredChats.length > 0 ? (
              <ChatList
                chats={filteredChats}
                selectedChat={selectedChat}
                onChatSelect={onChatSelect}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? "No chats found"
                    : "No chats yet. Start a new conversation!"}
                </Typography>
              </Box>
            )
          ) : filteredGroups.length > 0 ? (
            <GroupList
              groups={filteredGroups}
              selectedChat={selectedChat}
              onChatSelect={onChatSelect}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "No groups found"
                  : "No groups yet. Create your first group!"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        onGroupCreate={onGroupCreate}
        allUsers={allUsers}
        currentUserId={currentUserId}
      />

      {/* Search Users Dialog */}
      <SearchUsersDialog
        open={isSearchUsersDialogOpen}
        onClose={() => setIsSearchUsersDialogOpen(false)}
        allUsers={allUsers}
        currentUserId={currentUserId}
        onUserSelect={onUserSelect}
      />
    </>
  );
};

export default Sidebar;
