// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
import { auth } from "../firebase/config";
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

  // Convert Firebase User to our User type
  const formatUser = (firebaseUser: FirebaseUser): User => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || undefined,
    };
  };

  // Sign up function
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user document in Firestore using service
      await createOrUpdateUser(userCredential.user.uid, {
        name: name,
        email: email,
        status: "online",
        photoURL: null,
      });

      // Update local user state
      setUser({
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
      });

      console.log("✅ User signed up successfully");
    } catch (error: any) {
      console.error("❌ Error signing up:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user status to online using service
      await updateUserStatus(userCredential.user.uid, "online");

      setUser(formatUser(userCredential.user));
      console.log("✅ User logged in successfully");
    } catch (error: any) {
      console.error("❌ Error logging in:", error);
      throw error;
    }
  };

  // Sign in anonymously
  const signInAnonymously = async (): Promise<void> => {
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      const anonymousName = `Guest${Math.floor(Math.random() * 10000)}`;

      // Update profile with anonymous name
      await updateProfile(userCredential.user, {
        displayName: anonymousName,
      });

      // Create user document in Firestore using service
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
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (user) {
        // Update status to offline before logout
        await updateUserStatus(user.uid, "offline");
      }

      await firebaseSignOut(auth);
      setUser(null);
      console.log("✅ User logged out successfully");
    } catch (error: any) {
      console.error("❌ Error logging out:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore using service
          const userData = await getUserData(firebaseUser.uid);

          if (userData) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || userData.email || "",
              displayName: userData.name || firebaseUser.displayName || "",
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            });

            // Update user status to online
            await updateUserStatus(firebaseUser.uid, "online");
          } else {
            // If no Firestore data exists, use Firebase auth data
            setUser(formatUser(firebaseUser));

            // Create initial Firestore document
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
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup: Set user offline when window is closed
    const handleBeforeUnload = async () => {
      if (user) {
        await updateUserStatus(user.uid, "offline");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Set user offline when component unmounts
      if (user) {
        updateUserStatus(user.uid, "offline");
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribe();
    };
  }, []);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (user) {
        if (document.hidden) {
          // User switched to another tab or minimized window
          await updateUserStatus(user.uid, "offline");
        } else {
          // User came back to the tab
          await updateUserStatus(user.uid, "online");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signup,
    login,
    logout,
    signInAnonymously,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
