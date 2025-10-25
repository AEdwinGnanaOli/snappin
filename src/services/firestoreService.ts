// src/services/firestoreService.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import {
  firestore,
  USERS_COLLECTION,
  CHATS_COLLECTION,
  MESSAGES_COLLECTION,
  GROUPS_COLLECTION,
} from "../config/firebase-config";

// ==================== TYPES ====================

export interface UserData {
  uid?: string;
  name: string;
  email?: string;
  photoURL?: string | null;
  status: "online" | "offline";
  lastSeen?: string;
  createdAt?: string;
  bio?: string;
  phoneNumber?: string;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: string;
  read: boolean;
  type?: "text" | "image" | "file" | "video" | "audio";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string; // Message ID being replied to
  edited?: boolean;
  deletedAt?: string;
}

export interface Chat {
  id?: string;
  participants: string[];
  participantDetails?: {
    [userId: string]: { name: string; photoURL?: string };
  };
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageTime?: string;
  unreadCount?: { [userId: string]: number };
  type: "private" | "group";
  createdAt?: string;
  createdBy?: string;
  // Group specific
  groupName?: string;
  groupPhoto?: string;
  groupDescription?: string;
  admins?: string[];
}

export interface Group {
  id?: string;
  name: string;
  description?: string;
  photoURL?: string;
  members: string[];
  admins: string[];
  createdBy: string;
  createdAt: string;
  lastMessageTime?: string;
}

// ==================== USER OPERATIONS ====================

/**
 * Create or update user in Firestore
 */
export const createOrUpdateUser = async (
  userId: string,
  userData: Partial<UserData>
): Promise<void> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        lastSeen: new Date().toISOString(),
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        uid: userId,
        ...userData,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Error creating/updating user:", error);
    throw error;
  }
};

/**
 * Update user status (online/offline)
 */
export const updateUserStatus = async (
  userId: string,
  status: "online" | "offline"
): Promise<void> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      status,
      lastSeen: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    // Don't throw error to prevent app crashes on status updates
  }
};

/**
 * Get user data by ID
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as UserData;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    throw error;
  }
};

/**
 * Get multiple users by IDs
 */
export const getUsersByIds = async (userIds: string[]): Promise<UserData[]> => {
  try {
    const users: UserData[] = [];

    for (const userId of userIds) {
      const userData = await getUserData(userId);
      if (userData) {
        users.push(userData);
      }
    }

    return users;
  } catch (error) {
    console.error("❌ Error getting users by IDs:", error);
    throw error;
  }
};

/**
 * Get all users (for contacts/search)
 */
export const getAllUsers = async (
  excludeUserId?: string
): Promise<UserData[]> => {
  try {
    const usersRef = collection(firestore, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    const users: UserData[] = [];
    snapshot.forEach((doc) => {
      if (!excludeUserId || doc.id !== excludeUserId) {
        users.push({ uid: doc.id, ...doc.data() } as UserData);
      }
    });

    return users;
  } catch (error) {
    console.error("❌ Error getting all users:", error);
    throw error;
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (
  searchTerm: string,
  excludeUserId?: string
): Promise<UserData[]> => {
  try {
    const allUsers = await getAllUsers(excludeUserId);
    const lowerSearch = searchTerm.toLowerCase();

    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch))
    );
  } catch (error) {
    console.error("❌ Error searching users:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserData>
): Promise<void> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    throw error;
  }
};

/**
 * Listen to user status changes
 */
export const subscribeToUserStatus = (
  userId: string,
  callback: (status: "online" | "offline", lastSeen: string) => void
) => {
  const userRef = doc(firestore, USERS_COLLECTION, userId);

  return onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.status, data.lastSeen);
      }
    },
    (error) => {
      console.error("❌ Error subscribing to user status:", error);
    }
  );
};

// ==================== CHAT OPERATIONS ====================

/**
 * Create a new chat (private or group)
 */
export const createChat = async (
  participants: string[],
  type: "private" | "group" = "private",
  groupData?: {
    name: string;
    description?: string;
    photoURL?: string;
    createdBy: string;
  }
): Promise<string> => {
  try {
    const chatRef = doc(collection(firestore, CHATS_COLLECTION));

    const chatData: Chat = {
      participants,
      type,
      createdAt: new Date().toISOString(),
      unreadCount: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
    };

    if (type === "group" && groupData) {
      chatData.groupName = groupData.name;
      chatData.groupDescription = groupData.description;
      chatData.groupPhoto = groupData.photoURL;
      chatData.createdBy = groupData.createdBy;
      chatData.admins = [groupData.createdBy];
    }

    await setDoc(chatRef, chatData);
    return chatRef.id;
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    throw error;
  }
};

/**
 * Find existing private chat between two users
 */
export const findPrivateChat = async (
  userId1: string,
  userId2: string
): Promise<string | null> => {
  try {
    const chatsRef = collection(firestore, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where("type", "==", "private"),
      where("participants", "array-contains", userId1)
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const chat = doc.data() as Chat;
      if (chat.participants.includes(userId2)) {
        return doc.id;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding private chat:", error);
    throw error;
  }
};

/**
 * Get or create private chat
 */
export const getOrCreatePrivateChat = async (
  userId1: string,
  userId2: string
): Promise<string> => {
  try {
    // Check if chat already exists
    const existingChatId = await findPrivateChat(userId1, userId2);

    if (existingChatId) {
      return existingChatId;
    }

    // Create new chat
    return await createChat([userId1, userId2], "private");
  } catch (error) {
    console.error("❌ Error getting or creating private chat:", error);
    throw error;
  }
};

/**
 * Get user's chats
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(firestore, CHATS_COLLECTION);
    const q = query(chatsRef, where("participants", "array-contains", userId));

    const snapshot = await getDocs(q);
    const chats: Chat[] = [];

    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat);
    });

    // Sort by last message time
    chats.sort((a, b) => {
      const timeA = a.lastMessageTime || a.createdAt || "";
      const timeB = b.lastMessageTime || b.createdAt || "";
      return timeB.localeCompare(timeA);
    });

    return chats;
  } catch (error) {
    console.error("❌ Error getting user chats:", error);
    throw error;
  }
};

/**
 * Listen to user's chats in real-time
 */
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(firestore, CHATS_COLLECTION);
  const q = query(chatsRef, where("participants", "array-contains", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });

      // Sort by last message time
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime || a.createdAt || "";
        const timeB = b.lastMessageTime || b.createdAt || "";
        return timeB.localeCompare(timeA);
      });

      callback(chats);
    },
    (error) => {
      console.error("❌ Error subscribing to user chats:", error);
    }
  );
};

/**
 * Delete a chat
 */
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    // Delete all messages in the chat
    const messagesRef = collection(firestore, MESSAGES_COLLECTION);
    const q = query(messagesRef, where("chatId", "==", chatId));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the chat
    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    batch.delete(chatRef);

    await batch.commit();
  } catch (error) {
    console.error("❌ Error deleting chat:", error);
    throw error;
  }
};

// ==================== MESSAGE OPERATIONS ====================

/**
 * Send a message
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  type: "text" | "image" | "file" | "video" | "audio" = "text",
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: string;
  }
): Promise<string> => {
  try {
    // Add message to messages collection
    const messageRef = doc(collection(firestore, MESSAGES_COLLECTION));
    const messageData: Message = {
      chatId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      ...metadata,
    };

    await setDoc(messageRef, messageData);

    // Update chat with last message
    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chat = chatDoc.data() as Chat;
      const updates: any = {
        lastMessage: text.length > 50 ? text.substring(0, 50) + "..." : text,
        lastMessageSenderId: senderId,
        lastMessageTime: new Date().toISOString(),
      };

      // Increment unread count for other participants
      chat.participants.forEach((participantId) => {
        if (participantId !== senderId) {
          updates[`unreadCount.${participantId}`] = increment(1);
        }
      });

      await updateDoc(chatRef, updates);
    }

    return messageRef.id;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (
  chatId: string,
  limit?: number
): Promise<Message[]> => {
  try {
    const messagesRef = collection(firestore, MESSAGES_COLLECTION);
    let q = query(
      messagesRef,
      where("chatId", "==", chatId),
      orderBy("timestamp", "desc")
    );

    if (limit) {
      q = query(q);
    }

    const snapshot = await getDocs(q);
    const messages: Message[] = [];

    snapshot.forEach((doc) => {
      const message = { id: doc.id, ...doc.data() } as Message;
      if (!message.deletedAt) {
        messages.push(message);
      }
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error("❌ Error getting chat messages:", error);
    throw error;
  }
};

/**
 * Listen to messages in real-time
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(firestore, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() } as Message;
        if (!message.deletedAt) {
          messages.push(message);
        }
      });
      callback(messages);
    },
    (error) => {
      console.error("❌ Error subscribing to messages:", error);
    }
  );
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const messagesRef = collection(firestore, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where("chatId", "==", chatId),
      where("senderId", "!=", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(firestore);

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    // Reset unread count for this user
    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  newText: string
): Promise<void> => {
  try {
    const messageRef = doc(firestore, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      text: newText,
      edited: true,
    });
  } catch (error) {
    console.error("❌ Error editing message:", error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(firestore, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      text: "This message was deleted",
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    throw error;
  }
};

// ==================== GROUP OPERATIONS ====================

/**
 * Create a group
 */
export const createGroup = async (
  name: string,
  members: string[],
  createdBy: string,
  description?: string,
  photoURL?: string
): Promise<string> => {
  try {
    const groupRef = doc(collection(firestore, GROUPS_COLLECTION));
    const groupData: Group = {
      name,
      description,
      photoURL,
      members,
      admins: [createdBy],
      createdBy,
      createdAt: new Date().toISOString(),
    };

    await setDoc(groupRef, groupData);

    // Create a chat for this group
    await createChat(members, "group", {
      name,
      description,
      photoURL,
      createdBy,
    });

    return groupRef.id;
  } catch (error) {
    console.error("❌ Error creating group:", error);
    throw error;
  }
};

/**
 * Add member to group
 */
export const addGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const group = groupDoc.data() as Group;
      if (!group.members.includes(userId)) {
        await updateDoc(groupRef, {
          members: [...group.members, userId],
        });
      }
    }
  } catch (error) {
    console.error("❌ Error adding group member:", error);
    throw error;
  }
};

/**
 * Remove member from group
 */
export const removeGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const group = groupDoc.data() as Group;
      await updateDoc(groupRef, {
        members: group.members.filter((id) => id !== userId),
        admins: group.admins.filter((id) => id !== userId),
      });
    }
  } catch (error) {
    console.error("❌ Error removing group member:", error);
    throw error;
  }
};

/**
 * Update group info
 */
export const updateGroupInfo = async (
  groupId: string,
  updates: { name?: string; description?: string; photoURL?: string }
): Promise<void> => {
  try {
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    await updateDoc(groupRef, updates);
  } catch (error) {
    console.error("❌ Error updating group info:", error);
    throw error;
  }
};

// ==================== TYPING INDICATORS ====================

/**
 * Set typing status for a user in a chat
 */
export const setTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const typingRef = doc(firestore, "typing", `${chatId}_${userId}`);

    if (isTyping) {
      await setDoc(typingRef, {
        chatId,
        userId,
        isTyping: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      await deleteDoc(typingRef);
    }
  } catch (error) {
    console.error("❌ Error setting typing status:", error);
    // Don't throw to prevent disrupting user experience
  }
};

/**
 * Subscribe to typing indicators for a chat
 */
export const subscribeToTypingIndicators = (
  chatId: string,
  callback: (typingUsers: { userId: string; timestamp: string }[]) => void
) => {
  const typingRef = collection(firestore, "typing");
  const q = query(typingRef, where("chatId", "==", chatId));

  return onSnapshot(
    q,
    (snapshot) => {
      const typingUsers: { userId: string; timestamp: string }[] = [];
      const now = Date.now();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const typingTime = new Date(data.timestamp).getTime();

        // Only show typing if it's less than 5 seconds old
        if (now - typingTime < 5000) {
          typingUsers.push({
            userId: data.userId,
            timestamp: data.timestamp,
          });
        }
      });

      callback(typingUsers);
    },
    (error) => {
      console.error("❌ Error subscribing to typing indicators:", error);
    }
  );
};

// ==================== PRESENCE/ONLINE STATUS ====================

/**
 * Set user presence (online/offline)
 */
export const setUserPresence = async (
  userId: string,
  isOnline: boolean
): Promise<void> => {
  try {
    const presenceRef = doc(firestore, "presence", userId);

    await setDoc(presenceRef, {
      userId,
      isOnline,
      lastSeen: new Date().toISOString(),
    });

    // Also update user status
    await updateUserStatus(userId, isOnline ? "online" : "offline");
  } catch (error) {
    console.error("❌ Error setting user presence:", error);
  }
};

/**
 * Subscribe to user presence
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (isOnline: boolean, lastSeen: string) => void
) => {
  const presenceRef = doc(firestore, "presence", userId);

  return onSnapshot(
    presenceRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.isOnline, data.lastSeen);
      } else {
        callback(false, new Date().toISOString());
      }
    },
    (error) => {
      console.error("❌ Error subscribing to user presence:", error);
    }
  );
};

/**
 * Subscribe to multiple users' presence
 */
export const subscribeToMultipleUserPresence = (
  userIds: string[],
  callback: (presenceMap: Record<string, { isOnline: boolean; lastSeen: string }>) => void
) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  const presenceRef = collection(firestore, "presence");
  const q = query(presenceRef, where("userId", "in", userIds.slice(0, 10))); // Firestore 'in' limit is 10

  return onSnapshot(
    q,
    (snapshot) => {
      const presenceMap: Record<string, { isOnline: boolean; lastSeen: string }> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        presenceMap[data.userId] = {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
        };
      });

      callback(presenceMap);
    },
    (error) => {
      console.error("❌ Error subscribing to multiple user presence:", error);
    }
  );
};
