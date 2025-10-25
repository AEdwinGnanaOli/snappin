import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../../components/sidebar/Sidebar";
import ChatArea from "../../components/chat/ChatArea";
import {
  Chat as ChatType,
  Group,
  dummyChats,
  dummyGroups,
  dummyMessages,
} from "../../utils/data";

// Additional type for new group creation
export interface NewGroup {
  name: string;
  initial: string;
  badge?: string;
}

type ViewType = "chats" | "groups" | "settings";

const Chat: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>("chats");
  const [selectedChat, setSelectedChat] = useState<ChatType | Group | null>(null);
  const [chats, setChats] = useState<ChatType[]>(dummyChats);
  const [groups, setGroups] = useState<Group[]>(dummyGroups);

  const handleChatSelect = (chat: ChatType | Group): void => {
    setSelectedChat(chat);
  };

  const handleGroupCreate = (newGroup: NewGroup): void => {
    const group: Group = {
      id: Date.now(),
      name: newGroup.name,
      initial: newGroup.initial,
      unreadCount: 0,
      type: "group",
      badge: newGroup.badge,
    };
    setGroups([group, ...groups]);
  };

  const handleSendMessage = (message: string): void => {
    if (selectedChat) {
      console.log("Sending message:", message);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        <Sidebar
          activeView={activeView as "chats" | "groups"}
          onViewChange={(view: "chats" | "groups") => setActiveView(view)}
          chats={chats}
          groups={groups}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          onGroupCreate={handleGroupCreate}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <ChatArea
            selectedChat={selectedChat}
            messages={selectedChat ? dummyMessages[selectedChat.id] || [] : []}
            onSendMessage={handleSendMessage}
          />
        </Box>
      </Box>
    </>
  );
};

export default Chat;
