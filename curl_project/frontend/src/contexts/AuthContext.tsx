import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { z } from "zod";
import { UserSchema } from "@/lib/schemas";
import {
  getGuestToken,
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import logger from "@/lib/logger";

type AuthContextType = {
  user: z.infer<typeof UserSchema> | null;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<z.infer<typeof UserSchema> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const initializedRef = useRef(false);
  const isLoggingOutRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const guestUser = await getGuestToken();
          setUser(guestUser);
        } catch (error) {
          logger.error("Failed to initialize guest user", error);
        }
      }
      setIsInitializing(false);
    };

    initializeUser();
  }, []);

  const login = async (credentials: { login: string; password: string }) => {
    const loggedInUser = await apiLogin(credentials);
    setUser(loggedInUser);
  };

  const logout = useCallback(async () => {
    // Prevent concurrent logout calls
    if (isLoggingOutRef.current) {
      return;
    }
    
    isLoggingOutRef.current = true;
    
    try {
      await apiLogout();
      setUser(null);
      const guestUser = await getGuestToken();
      setUser(guestUser);
      navigate("/");
    } catch (error) {
      logger.error("Logout error:", error);
      // Still clear user state even if API call fails
      setUser(null);
      navigate("/");
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    const handleAuthError = () => {
      // Prevent logout loop - only logout if not already logging out
      if (!isLoggingOutRef.current) {
        logout();
      }
    };

    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, [logout]);

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    await apiRegister(userData);
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
