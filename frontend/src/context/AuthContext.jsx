import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get("/api/auth/me");
          setUser(response.data.data);
        } catch (error) {
          console.error("Auth check failed:", error);

          // Handle token expiration
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }

          // Handle other errors
          if (error.response?.status !== 401) {
            console.error(
              "Unexpected auth error:",
              error.response?.data?.message || "Authentication failed"
            );
          }
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Set up interceptor for token expiration
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { user, token: newToken } = response.data.data;

      setUser(user);
      setToken(newToken);
      localStorage.setItem("token", newToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      const { user, token: newToken } = response.data.data;

      setUser(user);
      setToken(newToken);
      localStorage.setItem("token", newToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put("/api/auth/profile", userData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
