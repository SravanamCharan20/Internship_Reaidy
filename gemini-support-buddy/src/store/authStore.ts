/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from "mobx";
import { API_BASE } from "@/config";

export interface User {
  isAdmin: any;
  id: string;
  username: string;
  role: "user" | "admin";
}

class AuthStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    // Check for existing session
    this.checkAuth();
  }

  checkAuth() {
    // For demo purposes, check localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }

  login = async (username: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Simulate API call - in a real app, this would be a fetch to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo validation - in a real app, this would be validated by your backend
      if (username === "user" && password === "password") {
        const user: User = {
          id: "1", username, role: "user",
          isAdmin: undefined
        };
        this.setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.reload();
        return true;
      } else if (username === "admin" && password === "admin") {
        const user: User = {
          id: "2", username, role: "admin",
          isAdmin: undefined
        };
        this.setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.reload();
        return true;
      } else {
        this.error = "Invalid username or password";
        return false;
      }
    } catch (error) {
      this.error = "Login failed. Please try again.";
      return false;
    } finally {
      this.isLoading = false;
    }
  };

  logout = async () => {
    try {
      // End current chat session before logging out
      if (this.user?.id) {
        await fetch(`${API_BASE}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.user.id,
            endSession: true
          }),
        });
      }

      this.user = null;
      localStorage.removeItem("user");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  setUser(user: User) {
    this.user = user;
    this.isAuthenticated = true;
  }
}

export const authStore = new AuthStore();
