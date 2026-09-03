import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  api,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
} from "../services/api";

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  city?: string;
  avatar?: string;
  status?: "active" | "inactive";
  totalBookings?: number;
  totalSpent?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // On page load/refresh, verify stored JWT token against backend
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.getCurrentUser();
        if (res.success && res.data?.user) {
          if (isMounted) {
            setUser(res.data.user);
            setStoredUser(res.data.user);
          }
        } else {
          // Token is invalid/expired
          if (isMounted) {
            setStoredToken(null);
            setStoredUser(null);
            setUser(null);
            setToken(null);
          }
        }
      } catch {
        // Keep cached user if offline
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.data) {
        const { user: loggedInUser, token: authToken } = res.data;
        setUser(loggedInUser);
        setToken(authToken);
        setStoredUser(loggedInUser);
        setStoredToken(authToken);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: res.error || "Login failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => {
    try {
      const res = await api.auth.register(data);
      if (res.success && res.data) {
        const { user: registeredUser, token: authToken } = res.data;
        setUser(registeredUser);
        setToken(authToken);
        setStoredUser(registeredUser);
        setStoredToken(authToken);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: res.error || "Registration failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during registration" };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setUser(null);
    setToken(null);
    setStoredUser(null);
    setStoredToken(null);
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    setStoredUser(updated);
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAuthenticated = !!user;
  const isAdmin = Boolean(
    user &&
      (user.role === "admin" ||
        user.email?.toLowerCase().trim() === "adideva@gmail.com")
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
