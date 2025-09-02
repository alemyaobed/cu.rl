import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import { TokenSchema } from "@/lib/schemas";
import {
  getGuestToken,
  getStoredToken,
  storeToken,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

type AuthContextType = {
  token: z.infer<typeof TokenSchema> | null;
  login: (credentials: { login: string; password: any }) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    username: string;
    email: any;
    password: any;
    confirmPassword: any;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<z.infer<typeof TokenSchema> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
      } else {
        try {
          const guestToken = await getGuestToken();
          storeToken(guestToken);
          setToken(guestToken);
        } catch (error) {
          console.error("Failed to initialize guest user", error);
        }
      }
      setIsInitializing(false);
    };

    initializeUser();
  }, []);

  const login = async (credentials: { login: string; password: any }) => {
    const newToken = await apiLogin(credentials);
    storeToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await apiLogout();
    setToken(null);
    const guestToken = await getGuestToken();
    storeToken(guestToken);
    setToken(guestToken);
    navigate("/");
  };

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, [logout]);

  const register = async (userData: {
    username: string;
    email: any;
    password: any;
    confirmPassword: any;
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
    <AuthContext.Provider value={{ token, login, logout, register }}>
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
