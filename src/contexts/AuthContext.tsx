
import React, { createContext, useContext, useState, useEffect } from "react";

// Define types for our context
interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "family" | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: "owner" | "family") => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("careHomeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function - would connect to Supabase in a real implementation
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in real app, this would verify against database
      if (email === "owner@example.com" && password === "password") {
        const userData = { id: "1", email, name: "John Owner", role: "owner" as const };
        setUser(userData);
        localStorage.setItem("careHomeUser", JSON.stringify(userData));
      } 
      else if (email === "family@example.com" && password === "password") {
        const userData = { id: "2", email, name: "Jane Family", role: "family" as const };
        setUser(userData);
        localStorage.setItem("careHomeUser", JSON.stringify(userData));
      } 
      else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (email: string, password: string, name: string, role: "owner" | "family") => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would create a new user in the database
      const userData = { 
        id: Math.random().toString(36).substr(2, 9), 
        email, 
        name, 
        role 
      };
      
      setUser(userData);
      localStorage.setItem("careHomeUser", JSON.stringify(userData));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("careHomeUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
