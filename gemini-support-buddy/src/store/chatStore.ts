/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable, runInAction } from "mobx";
import { AIHelper } from "../utils/AIHelper";
import { authStore } from "./authStore";
import { toast } from "sonner";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

const API_BASE = "https://internship-reaidy.onrender.com/api";

class ChatStore {
  messages: Message[] = [];
  documents: Document[] = [];
  isTyping = false;
  isLoading = false;
  error: string | null = null;
  currentChatName: string = "Default Chat";
  isHistoryView: boolean = false;
  chatHistory: any[] = [];

  constructor() {
    makeAutoObservable(this);
    this.fetchDocuments();
    this.fetchConversations();
  }

  async fetchConversations(isHistory: boolean = false) {
    try {
      const userId = authStore.user?.id || "default";
      const res = await fetch(`${API_BASE}/conversations/${userId}${isHistory ? '?history=true' : ''}`);
      const data = await res.json();
      
      runInAction(() => {
        if (isHistory) {
          // For history view, store the conversations
          this.chatHistory = data;
          // Convert all messages from all conversations into a flat array
          const allMessages: Message[] = [];
          data.forEach((conversation: any) => {
            // Add a header message for each conversation
            allMessages.push({
              id: `header-${conversation._id}`,
              text: `Chat: ${conversation.name} (${new Date(conversation.createdAt).toLocaleString()})`,
              sender: "system",
              timestamp: new Date(conversation.createdAt),
              status: "sent"
            });
            
            conversation.messages?.forEach((msg: any) => {
              allMessages.push({
                id: `${msg._id}-user-${Date.now()}`,
                text: msg.message,
                sender: "user",
                timestamp: new Date(msg.timestamp),
                status: "sent"
              });
              if (msg.response) {
                allMessages.push({
                  id: `${msg._id}-ai-${Date.now()}`,
                  text: msg.response,
                  sender: "ai",
                  timestamp: new Date(msg.timestamp),
                  status: "sent"
                });
              }
            });
          });
          this.messages = allMessages;
          this.isHistoryView = true;
        } else {
          // For current chat view
          if (data.name) {
            this.currentChatName = data.name;
          }
          const splitMessages: Message[] = [];
          data.messages?.forEach((msg: any) => {
            splitMessages.push({
              id: `${msg._id}-user-${Date.now()}`,
              text: msg.message,
              sender: "user",
              timestamp: new Date(msg.timestamp),
              status: "sent"
            });
            if (msg.response) {
              splitMessages.push({
                id: `${msg._id}-ai-${Date.now()}`,
                text: msg.response,
                sender: "ai",
                timestamp: new Date(msg.timestamp),
                status: "sent"
              });
            }
          });
          this.messages = splitMessages;
          this.isHistoryView = false;
        }
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

  async fetchAllAIMessages(){

  }

  sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
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
          id: `ai-${Date.now()}`,
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
      // Generate a new chat name
      const newChatName = this.generateChatName();
      
      // Create a new chat session
      const newChatResponse = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authStore.user?.id,
          name: newChatName,
        }),
      });

      if (!newChatResponse.ok) {
        throw new Error('Failed to create new chat session');
      }

      // Clear current messages and update chat name
      this.messages = [];
      this.currentChatName = newChatName;
      this.isHistoryView = false;
      
      toast.success('New chat session started');
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Failed to start new chat');
    }
  };

  private generateChatName = () => {
    const adjectives = [
      'Quick', 'Smart', 'Efficient', 'Helpful', 'Friendly',
      'Expert', 'Professional', 'Reliable', 'Dynamic', 'Innovative'
    ];
    
    const nouns = [
      'Support', 'Assistance', 'Guidance', 'Help', 'Service',
      'Chat', 'Session', 'Conversation', 'Discussion', 'Consultation'
    ];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${randomAdjective} ${randomNoun} - ${timestamp}`;
  };
}

export const chatStore = new ChatStore();
