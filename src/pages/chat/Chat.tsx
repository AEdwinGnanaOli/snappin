import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Sidebar from "../../components/sidebar/Sidebar";
import ChatArea from "../../components/chat/ChatArea";
import { ChatListSkeleton, MessagesSkeleton, FullPageLoading } from "../../components/common/Loading";
import { useAuth } from "../../context/AuthContext";
import {
  UserData,
  Chat as ChatType,
  Message,
  subscribeToUserChats,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  setTypingStatus,
  subscribeToTypingIndicators,
  setUserPresence,
  getUsersByIds,
  getOrCreatePrivateChat,
  createChat,
  createGroup,
  subscribeToAllUsers,
} from "../../services/firestoreService";
import { getDoc, doc } from "firebase/firestore";
import { firestore, CHATS_COLLECTION } from "../../config/firebase";

type ViewType = "chats" | "users";

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

const Chat: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeView, setActiveView] = useState<ViewType>("chats");
  const [selectedChat, setSelectedChat] = useState<ChatItemDisplay | null>(
    null
  );
  const [chats, setChats] = useState<ChatItemDisplay[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [typingIndicatorText, setTypingIndicatorText] = useState<string>("");
  const [currentChatData, setCurrentChatData] = useState<ChatType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Loading states
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const unsubscribeChatsRef = useRef<(() => void) | null>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);
  const unsubscribeTypingRef = useRef<(() => void) | null>(null);
  const unsubscribeUsersRef = useRef<(() => void) | null>(null);

  // Keep track of current chat ID to avoid stale closures
  const selectedChatIdRef = useRef<string | null>(null);

  // Subscribe to all users in real-time
  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log("📋 Subscribing to all users");
    setIsLoadingUsers(true);

    unsubscribeUsersRef.current = subscribeToAllUsers((users) => {
      console.log("📋 Users updated:", users.length, "users");
      setAllUsers(users);
      setIsLoadingUsers(false);
    }, currentUser.uid);

    return () => {
      if (unsubscribeUsersRef.current) {
        console.log("📋 Unsubscribing from users");
        unsubscribeUsersRef.current();
      }
    };
  }, [currentUser]);

  // Set user presence and subscribe to chats
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Set user online
    setUserPresence(currentUser.uid, true);
    setIsLoadingChats(true);

    // Subscribe to user's chats
    unsubscribeChatsRef.current = subscribeToUserChats(
      currentUser.uid,
      async (firestoreChats) => {
        console.log("📱 Processing", firestoreChats.length, "chats");

        // Transform Firestore chats to display format
        const chatItems: ChatItemDisplay[] = await Promise.all(
          firestoreChats.map(async (chat) => {
            const otherParticipants = chat.participants.filter(
              (id) => id !== currentUser.uid
            );

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
                online: otherUser?.status === "online",
                isTyping: false,
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

        const validChats = chatItems.filter(Boolean) as ChatItemDisplay[];
        console.log("📱 Valid chats:", validChats.length);
        setChats(validChats);
        setIsLoadingChats(false);

        // Update selected chat if it exists in the new list
        if (selectedChatIdRef.current) {
          const updatedSelectedChat = validChats.find(
            (c) => c.id === selectedChatIdRef.current
          );
          if (updatedSelectedChat) {
            setSelectedChat(updatedSelectedChat);
          }
        }
      }
    );

    // Cleanup
    return () => {
      if (unsubscribeChatsRef.current) {
        unsubscribeChatsRef.current();
      }
      setUserPresence(currentUser.uid, false);
    };
  }, [currentUser]);

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat || !currentUser?.uid) {
      setMessages([]);
      setTypingIndicatorText("");
      return;
    }

    console.log(
      "📨 Selected chat changed:",
      selectedChat.id,
      selectedChat.name
    );
    selectedChatIdRef.current = selectedChat.id;

    // Unsubscribe from previous chat
    if (unsubscribeMessagesRef.current) {
      console.log("📨 Unsubscribing from previous messages");
      unsubscribeMessagesRef.current();
    }
    if (unsubscribeTypingRef.current) {
      console.log("⌨️ Unsubscribing from previous typing");
      unsubscribeTypingRef.current();
    }

    // Subscribe to messages
    console.log("📨 Subscribing to messages for:", selectedChat.id);
    setIsLoadingMessages(true);

    unsubscribeMessagesRef.current = subscribeToMessages(
      selectedChat.id,
      async (firestoreMessages) => {
        console.log("📨 Received", firestoreMessages.length, "messages");

        const messageDisplays: MessageDisplay[] = await Promise.all(
          firestoreMessages.map(async (msg) => {
            const senders = await getUsersByIds([msg.senderId]);
            const sender = senders[0];

            return {
              id: msg.id!,
              text: msg.text,
              sender: sender?.name || "Unknown",
              avatar: sender?.photoURL || undefined,
              timestamp: formatMessageTime(msg.timestamp),
              isOwn: msg.senderId === currentUser.uid,
              images:
                msg.type === "image" && msg.fileUrl ? [msg.fileUrl] : undefined,
            };
          })
        );

        setMessages(messageDisplays);
        setIsLoadingMessages(false);

        // Mark messages as read
        await markMessagesAsRead(selectedChat.id, currentUser.uid);
      }
    );

    // Subscribe to typing indicators
    unsubscribeTypingRef.current = subscribeToTypingIndicators(
      selectedChat.id,
      async (typingData) => {
        const typingUserIds = typingData
          .filter((t) => t.userId !== currentUser.uid)
          .map((t) => t.userId);

        // Get typing user names
        if (typingUserIds.length > 0) {
          const typingUsersData = await getUsersByIds(typingUserIds);
          const names = typingUsersData.map((u) => u.name);

          if (names.length === 1) {
            setTypingIndicatorText(`${names[0]} is typing...`);
          } else if (names.length === 2) {
            setTypingIndicatorText(`${names[0]} and ${names[1]} are typing...`);
          } else if (names.length > 2) {
            setTypingIndicatorText(
              `${names[0]}, ${names[1]} and ${
                names.length - 2
              } others are typing...`
            );
          }
        } else {
          setTypingIndicatorText("");
        }
      }
    );

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
      if (unsubscribeTypingRef.current) {
        unsubscribeTypingRef.current();
      }
    };
  }, [selectedChat?.id, currentUser?.uid]);

  const loadChatData = useCallback(async (chatId: string) => {
    try {
      const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        setCurrentChatData({ id: chatDoc.id, ...chatDoc.data() } as ChatType);
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
    }
  }, []);

  const handleChatSelect = useCallback((chat: ChatItemDisplay): void => {
    console.log("🎯 Chat selected:", chat.name, chat.id);
    setSelectedChat(chat);
    setActiveView("chats");
    loadChatData(chat.id);
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile, loadChatData]);

  const handleBackToSidebar = useCallback((): void => {
    if (isMobile) {
      setShowSidebar(true);
      setSelectedChat(null);
    }
  }, [isMobile]);

  const handleUserSelect = useCallback(async (user: UserData): Promise<void> => {
    if (!currentUser?.uid) return;

    try {
      console.log("👤 User selected:", user.name);

      // Get or create private chat
      const chatId = await getOrCreatePrivateChat(currentUser.uid, user.uid!);
      console.log("💬 Chat ID:", chatId);

      // Create chat item for display
      const chatItem: ChatItemDisplay = {
        id: chatId,
        name: user.name,
        avatar: user.photoURL || undefined,
        initial: user.name[0]?.toUpperCase() || "?",
        online: user.status === "online",
        isTyping: false,
        type: "private",
      };

      setSelectedChat(chatItem);
      setActiveView("chats");
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("❌ Error creating chat:", error);
    }
  }, [currentUser?.uid, isMobile]);

  const handleGroupCreate = useCallback(async (groupData: {
    name: string;
    description?: string;
    memberIds: string[];
  }): Promise<void> => {
    if (!currentUser?.uid) return;

    try {
      console.log(
        "🔵 Creating group:",
        groupData.name,
        "with members:",
        groupData.memberIds
      );

      // Use the new createGroup function that stores in GROUPS_COLLECTION
      const groupId = await createGroup({
        name: groupData.name,
        description: groupData.description,
        photoURL: undefined,
        memberIds: groupData.memberIds,
        createdBy: currentUser.uid,
      });

      console.log("✅ Group created successfully in GROUPS_COLLECTION with ID:", groupId);

      // Create chat item for immediate display
      const chatItem: ChatItemDisplay = {
        id: groupId,
        name: groupData.name,
        avatar: undefined,
        initial: groupData.name[0]?.toUpperCase() || "G",
        online: false,
        isTyping: false,
        type: "group",
      };

      // Select the newly created group
      setSelectedChat(chatItem);
      setActiveView("chats");
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("❌ Error creating group:", error);
    }
  }, [currentUser?.uid, isMobile]);

  const handleSendMessage = useCallback(async (messageText: string): Promise<void> => {
    if (!selectedChat || !currentUser?.uid) {
      console.error(
        "❌ Cannot send message: No chat selected or user not authenticated"
      );
      return;
    }

    try {
      console.log("📤 Sending message to chat:", selectedChat.id);
      await sendMessage(selectedChat.id, currentUser.uid, messageText);

      // Clear typing indicator
      await setTypingStatus(selectedChat.id, currentUser.uid, false);
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  }, [selectedChat, currentUser?.uid]);

  const handleTyping = useCallback(async (isTyping: boolean): Promise<void> => {
    if (!selectedChat || !currentUser?.uid) return;

    await setTypingStatus(selectedChat.id, currentUser.uid, isTyping);
  }, [selectedChat, currentUser?.uid]);

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
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Split chats into individual and group
  const individualChats = chats.filter((c) => c.type === "private");
  const groupChats = chats.filter((c) => c.type === "group");

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
        {/* Sidebar - hidden on mobile when chat is selected */}
        <Box
          sx={{
            display: isMobile && !showSidebar ? "none" : "flex",
            flex: isMobile ? 1 : "0 0 auto",
          }}
        >
          <Sidebar
            activeView={activeView === "chats" ? "chats" : "groups"}
            onViewChange={(view) => setActiveView(view)}
            chats={individualChats}
            groups={groupChats}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            onGroupCreate={handleGroupCreate}
            allUsers={allUsers}
            currentUserId={currentUser?.uid || ""}
            onUserSelect={handleUserSelect}
            isLoadingChats={isLoadingChats}
          />
        </Box>

        {/* Chat Area - hidden on mobile when sidebar is shown */}
        <Box
          sx={{
            flex: 1,
            display: isMobile && showSidebar ? "none" : "flex",
            overflow: "hidden",
            minWidth: 0,
            position: "relative",
          }}
        >
          {/* Back button for mobile */}
          {isMobile && selectedChat && (
            <IconButton
              onClick={handleBackToSidebar}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 10,
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <ChatArea
            selectedChat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            typingIndicator={typingIndicatorText}
            chatData={currentChatData}
            currentUserId={currentUser?.uid}
            allUsers={allUsers}
            onRefresh={() => selectedChat && loadChatData(selectedChat.id)}
            isLoadingMessages={isLoadingMessages}
          />
        </Box>
      </Box>
    </>
  );
};

export default Chat;
