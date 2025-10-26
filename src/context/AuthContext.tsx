// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  createOrUpdateUser,
  updateUserStatus,
  getUserData,
} from "../services/firestoreService";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs to track state across effect cleanup
  const isRefreshingRef = useRef(false);
  const offlineTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Convert Firebase User to our User type
  const formatUser = (firebaseUser: FirebaseUser): User => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || undefined,
    };
  };

  // Sign up function - memoized to prevent re-renders
  const signup = useCallback(async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      console.log("🔄 Attempting to create user with email:", email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ User created successfully:", userCredential.user.uid);

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      console.log("✅ Profile updated with display name");

      await createOrUpdateUser(userCredential.user.uid, {
        name: name,
        email: email,
        status: "online",
        photoURL: null,
      });

      console.log("✅ User document created in Firestore");

      setUser({
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
      });

      console.log("✅ User signed up successfully");
    } catch (error: any) {
      console.error("❌ Error signing up:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);

      if (error.code === "auth/configuration-not-found") {
        console.error(
          "⚠️ IMPORTANT: Email/Password authentication is NOT enabled in Firebase Console!"
        );
        console.error(
          "⚠️ Go to: https://console.firebase.google.com/project/testchat-3839e/authentication/providers"
        );
        console.error("⚠️ Enable 'Email/Password' under Sign-in providers");
      }

      throw error;
    }
  }, []);

  // Login function - memoized to prevent re-renders
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      console.log("🔄 Attempting login with email:", email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ Login successful:", userCredential.user.uid);

      await updateUserStatus(userCredential.user.uid, "online");

      setUser(formatUser(userCredential.user));
      console.log("✅ User logged in successfully");
    } catch (error: any) {
      console.error("❌ Error logging in:", error);
      console.error("❌ Error code:", error.code);
      throw error;
    }
  }, []);

  // Sign in anonymously - memoized to prevent re-renders
  const signInAnonymously = useCallback(async (): Promise<void> => {
    try {
      console.log("🔄 Attempting anonymous sign in");

      const userCredential = await firebaseSignInAnonymously(auth);
      const anonymousName = `Guest${Math.floor(Math.random() * 10000)}`;

      console.log("✅ Anonymous user created:", userCredential.user.uid);

      await updateProfile(userCredential.user, {
        displayName: anonymousName,
      });

      await createOrUpdateUser(userCredential.user.uid, {
        name: anonymousName,
        status: "online",
      });

      setUser({
        uid: userCredential.user.uid,
        email: "",
        displayName: anonymousName,
      });

      console.log("✅ Anonymous sign in successful");
    } catch (error: any) {
      console.error("❌ Anonymous sign in error:", error);
      console.error("❌ Error code:", error.code);

      if (error.code === "auth/configuration-not-found") {
        console.error(
          "⚠️ Anonymous authentication is NOT enabled in Firebase Console!"
        );
        console.error(
          "⚠️ Go to: https://console.firebase.google.com/project/testchat-3839e/authentication/providers"
        );
        console.error("⚠️ Enable 'Anonymous' under Sign-in providers");
      }

      throw error;
    }
  }, []);

  // Logout function - memoized to prevent re-renders
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (user) {
        console.log("🔄 Logging out user:", user.uid);
        await updateUserStatus(user.uid, "offline");
      }

      await firebaseSignOut(auth);
      setUser(null);
      userIdRef.current = null;
      console.log("✅ User logged out successfully");
    } catch (error: any) {
      console.error("❌ Error logging out:", error);
      throw error;
    }
  }, [user]);

  // Listen for auth state changes
  useEffect(() => {
    console.log("🔄 Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("🔄 Auth state: User logged in -", firebaseUser.uid);
        userIdRef.current = firebaseUser.uid;

        try {
          const userData = await getUserData(firebaseUser.uid);

          if (userData) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || userData.email || "",
              displayName: userData.name || firebaseUser.displayName || "",
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            });

            // Update status to online (important for refresh scenarios)
            await updateUserStatus(firebaseUser.uid, "online");
          } else {
            setUser(formatUser(firebaseUser));

            await createOrUpdateUser(firebaseUser.uid, {
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              status: "online",
            });
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          setUser(formatUser(firebaseUser));
        }
      } else {
        console.log("🔄 Auth state: User logged out");
        setUser(null);
        userIdRef.current = null;
      }
      setLoading(false);
    });

    return () => {
      console.log("🧹 Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Handle page unload - ONLY mark offline on actual window close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const userId = userIdRef.current;
      if (!userId) return;

      // Check if this is a refresh or navigation within the app
      const isRefresh =
        e.type === "beforeunload" &&
        (performance.navigation.type === 1 || // TYPE_RELOAD
          (window.performance.getEntriesByType("navigation")[0] as any)
            ?.type === "reload");

      // Only mark offline if NOT refreshing
      if (!isRefresh) {
        console.log("🚪 Page closing - marking user offline");
        isRefreshingRef.current = false;

        // Use synchronous update for reliability
        updateUserStatus(userId, "offline").catch((err) => {
          console.error("Failed to update status on unload:", err);
        });
      } else {
        console.log("🔄 Page refreshing - keeping user online");
        isRefreshingRef.current = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Handle visibility change with smart debouncing
  useEffect(() => {
    const userId = userIdRef.current;
    if (!userId) return;

    const handleVisibilityChange = async () => {
      // Don't handle visibility changes during refresh
      if (isRefreshingRef.current) {
        console.log("🔄 Ignoring visibility change during refresh");
        return;
      }

      // Clear any existing timer
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }

      if (document.hidden) {
        console.log("👁️ Tab hidden - starting offline timer");

        // Wait 2 minutes before marking offline (handles tab switches)
        offlineTimerRef.current = setTimeout(async () => {
          if (
            document.hidden &&
            userIdRef.current &&
            !isRefreshingRef.current
          ) {
            console.log("⏰ Marking user offline after timeout");
            await updateUserStatus(userIdRef.current, "offline");
          }
        }, 120000); // 2 minutes
      } else {
        console.log("👁️ Tab visible - marking user online");

        // User came back to the tab - immediately mark online
        if (userIdRef.current) {
          await updateUserStatus(userIdRef.current, "online");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial check
    if (!document.hidden && userId) {
      updateUserStatus(userId, "online").catch(console.error);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Clear timer on cleanup
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
      }
    };
  }, []);

  // Reset refresh flag after a delay
  useEffect(() => {
    if (isRefreshingRef.current) {
      const timer = setTimeout(() => {
        console.log("✅ Refresh complete - resetting flag");
        isRefreshingRef.current = false;
      }, 3000); // 3 seconds after refresh

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Memoize context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(
    () => ({
      user,
      currentUser: user,
      isAuthenticated: !!user,
      loading,
      signup,
      login,
      logout,
      signInAnonymously,
    }),
    [user, loading, signup, login, logout, signInAnonymously]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
