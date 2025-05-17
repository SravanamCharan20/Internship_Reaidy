/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from "mobx";

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

  logout = () => {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem("user");
  };

  setUser(user: User) {
    this.user = user;
    this.isAuthenticated = true;
  }
}

export const authStore = new AuthStore();
