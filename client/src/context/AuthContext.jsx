import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEYS.TOKEN)
  );
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, logout]);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    const { token: newToken, user: registeredUser } = response.data;

    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

    setToken(newToken);
    setUser(registeredUser);

    return registeredUser;
  };

  const updateUser = useCallback((updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};