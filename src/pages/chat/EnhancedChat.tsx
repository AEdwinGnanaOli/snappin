import React, { useState, useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../../components/sidebar/Sidebar";
import ChatArea from "../../components/chat/ChatArea";
import { useAuth } from "../../context/AuthContext";
import {
  Chat as ChatType,
  UserData,
  Message,
  subscribeToUserChats,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  setTypingStatus,
  subscribeToTypingIndicators,
  setUserPresence,
  subscribeToMultipleUserPresence,
  getUsersByIds,
  getOrCreatePrivateChat,
  createChat,
} from "../../services/firestoreService";

// Additional type for new group creation
export interface NewGroup {
  name: string;
  description?: string;
  photoURL?: string;
  memberIds: string[];
}

type ViewType = "chats" | "groups" | "settings";

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

interface MessageDisplay {
  id: string;
  text: string;
  sender: string;
  avatar?: string;
  images?: string[];
  timestamp: string;
  isOwn?: boolean;
}

const EnhancedChat: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("chats");
  const [selectedChat, setSelectedChat] = useState<ChatItemDisplay | null>(null);
  const [chats, setChats] = useState<ChatItemDisplay[]>([]);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, { isOnline: boolean; lastSeen: string }>>({});
  const [allUsers, setAllUsers] = useState<UserData[]>([]);

  // Real-time listeners
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Set user presence to online
    setUserPresence(currentUser.uid, true);

    // Subscribe to user's chats
    const unsubscribeChats = subscribeToUserChats(currentUser.uid, async (firestoreChats) => {
      // Transform Firestore chats to display format
      const chatItems: ChatItemDisplay[] = await Promise.all(
        firestoreChats.map(async (chat) => {
          // Get other participant(s) info
          const otherParticipants = chat.participants.filter(id => id !== currentUser.uid);

          if (chat.type === "private" && otherParticipants.length > 0) {
            const otherUserId = otherParticipants[0];
            const users = await getUsersByIds([otherUserId]);
            const otherUser = users[0];

            return {
              id: chat.id!,
              name: otherUser?.name || "Unknown User",
              avatar: otherUser?.photoURL || undefined,
              initial: otherUser?.name?.[0]?.toUpperCase() || "?",
              lastMessage: chat.lastMessage,
              timestamp: formatTimestamp(chat.lastMessageTime),
              unreadCount: chat.unreadCount?.[currentUser.uid] || 0,
              online: presenceMap[otherUserId]?.isOnline || false,
              isTyping: false, // Will be updated by typing subscription
              type: "private" as const,
            };
          } else if (chat.type === "group") {
            return {
              id: chat.id!,
              name: chat.groupName || "Group Chat",
              avatar: chat.groupPhoto,
              initial: chat.groupName?.[0]?.toUpperCase() || "G",
              lastMessage: chat.lastMessage,
              timestamp: formatTimestamp(chat.lastMessageTime),
              unreadCount: chat.unreadCount?.[currentUser.uid] || 0,
              online: false,
              isTyping: false,
              type: "group" as const,
            };
          }

          return null;
        })
      );

      setChats(chatItems.filter(Boolean) as ChatItemDisplay[]);
    });

    // Subscribe to presence for all chat participants
    const participantIds = new Set<string>();
    chats.forEach(chat => {
      if (chat.type === "private") {
        // Get other participant ID from Firestore chat
        // This is a simplified version - you may need to store this separately
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeChats();
      setUserPresence(currentUser.uid, false);
    };
  }, [currentUser, presenceMap]);

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const unsubscribeMessages = subscribeToMessages(selectedChat.id, async (firestoreMessages) => {
      // Transform to display format
      const messageDisplays: MessageDisplay[] = await Promise.all(
        firestoreMessages.map(async (msg) => {
          // Get sender info
          const senders = await getUsersByIds([msg.senderId]);
          const sender = senders[0];

          return {
            id: msg.id!,
            text: msg.text,
            sender: sender?.name || "Unknown",
            avatar: sender?.photoURL || undefined,
            timestamp: formatMessageTime(msg.timestamp),
            isOwn: msg.senderId === currentUser.uid,
            images: msg.type === "image" && msg.fileUrl ? [msg.fileUrl] : undefined,
          };
        })
      );

      setMessages(messageDisplays);

      // Mark messages as read
      await markMessagesAsRead(selectedChat.id, currentUser.uid);
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = subscribeToTypingIndicators(selectedChat.id, (typingData) => {
      const typingUserIds = typingData
        .filter(t => t.userId !== currentUser.uid)
        .map(t => t.userId);
      setTypingUsers(typingUserIds);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [selectedChat, currentUser]);

  // Update typing indicator in chat list
  useEffect(() => {
    if (typingUsers.length > 0 && selectedChat) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, isTyping: true }
            : chat
        )
      );
    } else if (selectedChat) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, isTyping: false }
            : chat
        )
      );
    }
  }, [typingUsers, selectedChat]);

  const handleChatSelect = (chat: any): void => {
    setSelectedChat(chat);
  };

  const handleGroupCreate = async (newGroup: NewGroup): Promise<void> => {
    if (!currentUser?.uid) return;

    try {
      await createChat(
        [currentUser.uid, ...newGroup.memberIds],
        "group",
        {
          name: newGroup.name,
          description: newGroup.description,
          photoURL: newGroup.photoURL,
          createdBy: currentUser.uid,
        }
      );
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleSendMessage = async (messageText: string): Promise<void> => {
    if (!selectedChat || !currentUser?.uid) return;

    try {
      await sendMessage(selectedChat.id, currentUser.uid, messageText);

      // Clear typing indicator
      await setTypingStatus(selectedChat.id, currentUser.uid, false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = async (isTyping: boolean): Promise<void> => {
    if (!selectedChat || !currentUser?.uid) return;

    await setTypingStatus(selectedChat.id, currentUser.uid, isTyping);
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          chats={chats.filter(c => c.type === "private")}
          groups={chats.filter(c => c.type === "group")}
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
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </Box>
      </Box>
    </>
  );
};

export default EnhancedChat;
