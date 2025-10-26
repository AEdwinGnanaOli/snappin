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
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  firestore,
  USERS_COLLECTION,
  CHATS_COLLECTION,
  MESSAGES_COLLECTION,
  GROUPS_COLLECTION,
} from "../config/firebase";

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
  recipientId?: string;
  text: string;
  timestamp: string;
  read: boolean;
  type?: "text" | "image" | "file" | "video" | "audio";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
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

export const createOrUpdateUser = async (
  userId: string,
  userData: Partial<UserData>
): Promise<void> => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...userData,
        lastSeen: new Date().toISOString(),
      });
    } else {
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
    console.log(`✅ User status updated to ${status}`);
  } catch (error) {
    console.error("❌ Error updating user status:", error);
  }
};

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

export const subscribeToAllUsers = (
  callback: (users: UserData[]) => void,
  excludeUserId?: string
) => {
  const usersRef = collection(firestore, USERS_COLLECTION);

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: UserData[] = [];
      snapshot.forEach((doc) => {
        if (!excludeUserId || doc.id !== excludeUserId) {
          users.push({ uid: doc.id, ...doc.data() } as UserData);
        }
      });

      users.sort((a, b) => a.name.localeCompare(b.name));

      callback(users);
    },
    (error) => {
      console.error("❌ Error subscribing to all users:", error);
    }
  );
};

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

export const createChat = async (
  participants: string[],
  type: "private" | "group" = "private",
  groupData?: {
    name: string;
    description?: string;
    photoURL?: string;
    createdBy: string;
  },
  chatId?: string
): Promise<string> => {
  try {
    // Use provided chatId or generate a new one
    const chatRef = chatId
      ? doc(firestore, CHATS_COLLECTION, chatId)
      : doc(collection(firestore, CHATS_COLLECTION));

    const chatData: any = {
      participants,
      type,
      createdAt: new Date().toISOString(),
      unreadCount: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
    };

    if (type === "group" && groupData) {
      chatData.groupName = groupData.name;
      chatData.createdBy = groupData.createdBy;
      chatData.admins = [groupData.createdBy];

      // Only add optional fields if they have values
      if (groupData.description) {
        chatData.groupDescription = groupData.description;
      }
      if (groupData.photoURL) {
        chatData.groupPhoto = groupData.photoURL;
      }
    }

    await setDoc(chatRef, chatData);
    console.log("✅ Chat created with ID:", chatRef.id);

    return chatRef.id;
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    throw error;
  }
};

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

export const getOrCreatePrivateChat = async (
  userId1: string,
  userId2: string
): Promise<string> => {
  try {
    const existingChatId = await findPrivateChat(userId1, userId2);

    if (existingChatId) {
      return existingChatId;
    }

    return await createChat([userId1, userId2], "private");
  } catch (error) {
    console.error("❌ Error getting or creating private chat:", error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(firestore, CHATS_COLLECTION);
    const q = query(chatsRef, where("participants", "array-contains", userId));

    const snapshot = await getDocs(q);
    const chats: Chat[] = [];

    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat);
    });

    chats.sort((a, b) => {
      // Convert any type to string, handling undefined/null
      const timeA = String(a.lastMessageTime || a.createdAt || "");
      const timeB = String(b.lastMessageTime || b.createdAt || "");
      return timeB.localeCompare(timeA);
    });

    return chats;
  } catch (error) {
    console.error("❌ Error getting user chats:", error);
    throw error;
  }
};

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

      chats.sort((a, b) => {
        // Convert any type to string, handling undefined/null
        const timeA = String(a.lastMessageTime || a.createdAt || "");
        const timeB = String(b.lastMessageTime || b.createdAt || "");
        return timeB.localeCompare(timeA);
      });

      console.log("📱 Chats updated:", chats.length, "chats");
      callback(chats);
    },
    (error) => {
      console.error("❌ Error subscribing to user chats:", error);
    }
  );
};

export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    const messagesRef = collection(firestore, MESSAGES_COLLECTION);
    const q = query(messagesRef, where("chatId", "==", chatId));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    batch.delete(chatRef);

    await batch.commit();
  } catch (error) {
    console.error("❌ Error deleting chat:", error);
    throw error;
  }
};

// ==================== MESSAGE OPERATIONS ====================

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
    const messageRef = doc(collection(firestore, MESSAGES_COLLECTION));
    const timestamp = new Date().toISOString();

    // GET CHAT TO DETERMINE RECIPIENT
    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    let recipientId: string | undefined;

    if (chatDoc.exists()) {
      const chat = chatDoc.data() as Chat;

      // For private chats, find the other participant
      if (chat.type === "private") {
        recipientId = chat.participants.find((id) => id !== senderId);
      }
      // For group chats, recipientId remains undefined
    }

    // Build message data - only include recipientId if it exists
    const messageData: any = {
      chatId,
      senderId,
      text,
      timestamp,
      read: false,
      type,
      ...metadata,
    };

    // Only add recipientId if it's defined (for private chats)
    if (recipientId) {
      messageData.recipientId = recipientId;
    }

    await setDoc(messageRef, messageData);
    console.log("✅ Message sent:", messageRef.id);

    // Update chat's last message
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: timestamp,
      lastMessageSenderId: senderId,
    });

    return messageRef.id;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
};

export const getChatMessages = async (
  chatId: string,
  limit?: number
): Promise<Message[]> => {
  try {
    const messagesRef = collection(firestore, MESSAGES_COLLECTION);
    const q = query(messagesRef, where("chatId", "==", chatId));

    const snapshot = await getDocs(q);
    const messages: Message[] = [];

    snapshot.forEach((doc) => {
      const message = { id: doc.id, ...doc.data() } as Message;
      if (!message.deletedAt) {
        messages.push(message);
      }
    });

    // Sort in memory
    messages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB; // ascending order (oldest first)
    });

    return messages;
  } catch (error) {
    console.error("❌ Error getting chat messages:", error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  console.log("📨 Subscribing to messages for chat:", chatId);

  const messagesRef = collection(firestore, MESSAGES_COLLECTION);
  const q = query(messagesRef, where("chatId", "==", chatId));

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

      // Sort in memory instead of using Firestore orderBy
      messages.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB; // ascending order
      });

      console.log("📨 Messages updated:", messages.length, "messages");
      callback(messages);
    },
    (error) => {
      console.error("❌ Error subscribing to messages:", error);
    }
  );
};

export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const messagesRef = collection(firestore, MESSAGES_COLLECTION);

    // Get all unread messages in this chat that the user didn't send
    const q = query(
      messagesRef,
      where("chatId", "==", chatId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(firestore);

    let markedCount = 0;
    snapshot.forEach((docSnapshot) => {
      const message = docSnapshot.data();

      // Only mark messages as read if:
      // 1. For private chats: user is the recipient
      // 2. For group chats: user is not the sender
      const shouldMarkAsRead =
        (message.recipientId && message.recipientId === userId) || // Private chat
        (!message.recipientId && message.senderId !== userId); // Group chat

      if (shouldMarkAsRead) {
        batch.update(docSnapshot.ref, {
          read: true,
          readAt: serverTimestamp(),
        });
        markedCount++;
      }
    });

    if (markedCount > 0) {
      await batch.commit();
    }

    // Update unread count
    const chatRef = doc(firestore, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    });

    console.log(`✅ Marked ${markedCount} messages as read`);
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
  }
};

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
 * Creates a new group in GROUPS_COLLECTION
 */
export const createGroup = async (
  groupData: {
    name: string;
    description?: string;
    photoURL?: string;
    memberIds: string[];
    createdBy: string;
  }
): Promise<string> => {
  try {
    const groupRef = doc(collection(firestore, GROUPS_COLLECTION));
    const groupId = groupRef.id;

    // Build group object, only including defined fields
    const group: Partial<Group> = {
      id: groupId,
      name: groupData.name,
      members: [groupData.createdBy, ...groupData.memberIds],
      admins: [groupData.createdBy],
      createdBy: groupData.createdBy,
      createdAt: new Date().toISOString(),
    };

    // Only add optional fields if they have values
    if (groupData.description) {
      group.description = groupData.description;
    }
    if (groupData.photoURL) {
      group.photoURL = groupData.photoURL;
    }

    await setDoc(groupRef, group);
    console.log("✅ Group created in GROUPS_COLLECTION:", groupId);

    // Also create a chat entry for messaging
    const chatGroupData: {
      name: string;
      createdBy: string;
      description?: string;
      photoURL?: string;
    } = {
      name: groupData.name,
      createdBy: groupData.createdBy,
    };

    // Only add optional fields if they have values
    if (groupData.description) {
      chatGroupData.description = groupData.description;
    }
    if (groupData.photoURL) {
      chatGroupData.photoURL = groupData.photoURL;
    }

    await createChat(
      [groupData.createdBy, ...groupData.memberIds],
      "group",
      chatGroupData,
      groupId // Use the same ID
    );

    return groupId;
  } catch (error) {
    console.error("❌ Error creating group:", error);
    throw error;
  }
};

/**
 * Gets a group by ID from GROUPS_COLLECTION
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      return groupDoc.data() as Group;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting group:", error);
    throw error;
  }
};

/**
 * Adds a member to a group in both GROUPS_COLLECTION and CHATS_COLLECTION
 */
export const addGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    // Update GROUPS_COLLECTION
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const group = groupDoc.data() as Group;
      if (!group.members.includes(userId)) {
        batch.update(groupRef, {
          members: [...group.members, userId],
        });
      }
    }

    // Update CHATS_COLLECTION
    const chatRef = doc(firestore, CHATS_COLLECTION, groupId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chat = chatDoc.data() as Chat;
      if (!chat.participants.includes(userId)) {
        batch.update(chatRef, {
          participants: [...chat.participants, userId],
          [`unreadCount.${userId}`]: 0,
        });
      }
    }

    await batch.commit();
    console.log("✅ Member added to group:", userId);
  } catch (error) {
    console.error("❌ Error adding group member:", error);
    throw error;
  }
};

/**
 * Removes a member from a group in both GROUPS_COLLECTION and CHATS_COLLECTION
 */
export const removeGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    // Update GROUPS_COLLECTION
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const group = groupDoc.data() as Group;
      batch.update(groupRef, {
        members: group.members.filter((id) => id !== userId),
        admins: group.admins.filter((id) => id !== userId),
      });
    }

    // Update CHATS_COLLECTION
    const chatRef = doc(firestore, CHATS_COLLECTION, groupId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chat = chatDoc.data() as Chat;
      batch.update(chatRef, {
        participants: chat.participants.filter((id) => id !== userId),
        admins: chat.admins?.filter((id) => id !== userId),
      });
    }

    await batch.commit();
    console.log("✅ Member removed from group:", userId);
  } catch (error) {
    console.error("❌ Error removing group member:", error);
    throw error;
  }
};

/**
 * Updates group information in both GROUPS_COLLECTION and CHATS_COLLECTION
 */
export const updateGroupInfo = async (
  groupId: string,
  updates: { name?: string; description?: string; photoURL?: string }
): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    // Update GROUPS_COLLECTION
    const groupRef = doc(firestore, GROUPS_COLLECTION, groupId);
    const groupUpdateData: Partial<Group> = {};
    if (updates.name !== undefined) groupUpdateData.name = updates.name;
    if (updates.description !== undefined) groupUpdateData.description = updates.description;
    if (updates.photoURL !== undefined) groupUpdateData.photoURL = updates.photoURL;

    if (Object.keys(groupUpdateData).length > 0) {
      batch.update(groupRef, groupUpdateData);
    }

    // Update CHATS_COLLECTION
    const chatRef = doc(firestore, CHATS_COLLECTION, groupId);
    const chatUpdateData: Partial<Chat> = {};
    if (updates.name !== undefined) chatUpdateData.groupName = updates.name;
    if (updates.description !== undefined) chatUpdateData.groupDescription = updates.description;
    if (updates.photoURL !== undefined) chatUpdateData.groupPhoto = updates.photoURL;

    if (Object.keys(chatUpdateData).length > 0) {
      batch.update(chatRef, chatUpdateData);
    }

    await batch.commit();
    console.log("✅ Group info updated:", groupId);
  } catch (error) {
    console.error("❌ Error updating group info:", error);
    throw error;
  }
};

/**
 * Gets all groups for a user
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const groupsQuery = query(
      collection(firestore, GROUPS_COLLECTION),
      where("members", "array-contains", userId)
    );

    const snapshot = await getDocs(groupsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Group));
  } catch (error) {
    console.error("❌ Error getting user groups:", error);
    throw error;
  }
};

// ==================== TYPING INDICATORS ====================

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
  }
};

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

    await updateUserStatus(userId, isOnline ? "online" : "offline");
  } catch (error) {
    console.error("❌ Error setting user presence:", error);
  }
};

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

export const subscribeToMultipleUserPresence = (
  userIds: string[],
  callback: (
    presenceMap: Record<string, { isOnline: boolean; lastSeen: string }>
  ) => void
) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  const presenceRef = collection(firestore, "presence");
  const q = query(presenceRef, where("userId", "in", userIds.slice(0, 10)));

  return onSnapshot(
    q,
    (snapshot) => {
      const presenceMap: Record<
        string,
        { isOnline: boolean; lastSeen: string }
      > = {};

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
