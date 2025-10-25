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
  GroupAdd as GroupAddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import ChatList from "../chat/ChatList";
import GroupList from "../chat/GroupList";
import CreateGroupDialog from "../dialogs/AddMemberDialog";
import { useAuth } from "../../context/AuthContext";

import type { ChatItem, GroupItem } from "../../types/chat"; // type-only import

interface SidebarProps {
  activeView: "chats" | "groups";
  onViewChange: (view: "chats" | "groups") => void;
  chats: ChatItem[];
  groups: GroupItem[];
  selectedChat?: ChatItem | GroupItem | null;
  onChatSelect: (chat: ChatItem | GroupItem) => void;
  onGroupCreate: (group: GroupItem) => void;
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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const { logout } = useAuth();

  const [quickContacts] = useState([
    { id: 1, name: "Patrick", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 2, name: "Doris", avatar: "https://i.pravatar.cc/150?img=45" },
    { id: 3, name: "Emily", avatar: "https://i.pravatar.cc/150?img=25" },
    { id: 4, name: "Steve", avatar: "https://i.pravatar.cc/150?img=33" },
  ]);

  const menuItems: { icon: React.ReactNode; view: "chats" | "groups" }[] = [
    { icon: <ChatIcon />, view: "chats" },
    { icon: <GroupIcon />, view: "groups" },
  ];

  const handleMenuClick = (view: "chats" | "groups") => {
    onViewChange(view);
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Left Navigation Bar */}
      <Box
        sx={{
          width: 80,
          bgcolor: "#F5F7FB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          borderRight: "1px solid",
          borderColor: "divider",
          position: { xs: "fixed", md: "relative" },
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1200,
        }}
      >
        {/* Logo */}
        <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main", mb: 3 }}>
          <ChatIcon />
        </Avatar>

        {/* Menu Items */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {menuItems.map((item, index) => (
            <IconButton
              key={index}
              onClick={() => handleMenuClick(item.view)}
              sx={{
                color:
                  activeView === item.view ? "primary.main" : "text.secondary",
                bgcolor:
                  activeView === item.view
                    ? "rgba(108, 92, 231, 0.1)"
                    : "transparent",
                "&:hover": {
                  bgcolor:
                    activeView === item.view
                      ? "rgba(108, 92, 231, 0.15)"
                      : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>

        {/* Logout Button */}
        <IconButton
          onClick={logout}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "rgba(255, 0, 0, 0.08)",
              color: "error.main",
            },
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Chat/Group List Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: DRAWER_WIDTH },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          borderRight: { md: "1px solid" },
          borderColor: "divider",
          position: { xs: "fixed", md: "relative" },
          left: { xs: 80, md: "auto" },
          top: 0,
          bottom: 0,
          zIndex: 1100,
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight="600">
              {activeView === "chats" ? "Chats" : "Groups"}
            </Typography>
            {activeView === "groups" && (
              <IconButton
                size="small"
                onClick={() => setIsGroupDialogOpen(true)}
                sx={{ color: "primary.main" }}
              >
                <GroupAddIcon />
              </IconButton>
            )}
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${
              activeView === "chats" ? "messages or users" : "groups..."
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F5F7FB",
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Box>

        {/* Quick Contacts */}
        {activeView === "chats" && (
          <Box
            sx={{
              px: 2,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
              {quickContacts.map((contact) => (
                <Box
                  key={contact.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 70,
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    src={contact.avatar}
                    sx={{ width: 56, height: 56, mb: 0.5 }}
                  />
                  <Typography variant="caption" noWrap sx={{ maxWidth: 70 }}>
                    {contact.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Chat or Group List */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {activeView === "chats" ? (
            <ChatList
              chats={filteredChats}
              selectedChat={selectedChat}
              onChatSelect={onChatSelect}
            />
          ) : (
            <GroupList
              groups={filteredGroups}
              selectedChat={selectedChat}
              onChatSelect={onChatSelect}
            />
          )}
        </Box>
      </Box>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        onGroupCreate={onGroupCreate}
      />
    </>
  );
};

export default Sidebar;
