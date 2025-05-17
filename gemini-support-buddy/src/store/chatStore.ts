/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable, runInAction } from "mobx";
import { AIHelper } from "../utils/AIHelper";
import { authStore } from "./authStore";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

const API_BASE = "http://localhost:3000/api";

class ChatStore {
  messages: Message[] = [];
  documents: Document[] = [];
  isTyping = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.fetchConversations();
    this.fetchDocuments();
  }

  async fetchConversations() {
    try {
      const userId = authStore.user?.id || "default";
      const role = authStore.user?.role || "user";
      const res = await fetch(`${API_BASE}/conversations/${userId}?role=${role}`);
      const data = await res.json();
      runInAction(() => {
        // Split each message into user and AI messages for the chat history
        const splitMessages: Message[] = [];
        data.messages.forEach((msg: any) => {
          // User message
          splitMessages.push({
            id: msg._id + "-user",
            text: msg.message,
            sender: "user",
            timestamp: new Date(msg.timestamp),
            status: "sent"
          });
          // AI response (if present)
          if (msg.response) {
            splitMessages.push({
              id: msg._id + "-ai",
              text: msg.response,
              sender: "ai",
              timestamp: new Date(msg.timestamp), // Optionally, use a different timestamp if available
              status: "sent"
            });
          }
        });
        this.messages = splitMessages;
      });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }

  async fetchDocuments() {
    try {
      const res = await fetch(`${API_BASE}/faq`);
      const data = await res.json();
      runInAction(() => {
        this.documents = data.map((doc: any) => ({
          id: doc._id,
          name: doc.question,
          content: doc.answer,
          uploadedAt: new Date(doc.uploadedAt)
        }));
      });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  }

  async fetchAllChatHistory() {
    try {
      const userId = authStore.user?.id || "default";
      const res = await fetch(`${API_BASE}/chat/history/${userId}`);
      const data = await res.json();
      runInAction(() => {
        const newMessages = data.map((msg: any) => ({
          id: msg._id,
          text: msg.message,
          sender: msg.user === "ai" ? "ai" : "user",
          response: msg.response,
          timestamp: new Date(msg.timestamp),
          status: "sent"
        }));
        this.messages = [...this.messages, ...newMessages];
      });
    } catch (error) {
      console.error("Failed to fetch all chat history:", error);
    }
  }

  async fetchAllAIMessages(){

  }

  sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      status: "sending"
    };

    this.messages.push(userMessage);

    try {
      runInAction(() => {
        this.isTyping = true;
      });

      // Process with AI helper
      const response = await AIHelper.getResponse(text, this.documents);

      // Save to conversations
      const userId = authStore.user?.id || "default";
      const saveRes = await fetch(`${API_BASE}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text, response })
      });
      const saved = await saveRes.json();

      runInAction(() => {
        // Update the user message status first
        const userMessageIndex = this.messages.findIndex(msg => msg.id === userMessage.id);
        if (userMessageIndex !== -1) {
          this.messages[userMessageIndex].status = "sent";
        }

        // Add the AI response as a separate message
        const aiMessage: Message = {
          id: saved._id + "-ai",
          text: response,
          sender: "ai",
          timestamp: new Date(saved.timestamp),
          status: "sent"
        };

        this.messages.push(aiMessage);
        this.isTyping = false;
      });
    } catch (error) {
      console.error("Failed to get AI response:", error);
      runInAction(() => {
        const userMessageIndex = this.messages.findIndex(msg => msg.id === userMessage.id);
        if (userMessageIndex !== -1) {
          this.messages[userMessageIndex].status = "error";
        }
        this.isTyping = false;
        this.error = "Failed to get a response. Please try again.";
      });
    }
  };

  uploadDocument = async (name: string, content: string) => {
    try {
      const res = await fetch(`${API_BASE}/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: name, answer: content })
      });
      const saved = await res.json();
      runInAction(() => {
        this.documents.unshift({
          id: saved._id,
          name: saved.question,
          content: saved.answer,
          uploadedAt: new Date(saved.uploadedAt)
        });
      });
      return saved._id;
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  };

  deleteDocument = (id: string) => {
    this.documents = this.documents.filter(doc => doc.id !== id);
    // Optionally, implement backend delete endpoint
  };

  clearChat = async () => {
    try {
      const userId = authStore.user?.id || "default";
      await fetch(`${API_BASE}/chat/clear/${userId}`, { method: "DELETE" });
      runInAction(() => {
        this.messages = [];
      });
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };
}

export const chatStore = new ChatStore();
