/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from "@/components/auth/AuthForm";
import ChatInterface from "@/components/chat/ChatInterface";
import DocumentUpload from "@/components/admin/DocumentUpload";
import { authStore } from "@/store/authStore";
import { chatStore } from "@/store/chatStore";
import { Toaster } from "@/components/ui/sonner";
import { Car } from "lucide-react";

const Index = observer(() => {
  useEffect(() => {
    if (authStore.isAuthenticated) {
      chatStore.fetchConversations();
    }
  }, [authStore.isAuthenticated]);

  if (!authStore.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 shadow-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">AutoCare Chat</h1>
            <p className="text-gray-600 text-lg">
              Expert vehicle support powered by AI
            </p>
          </div>
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl border border-gray-100">
            <AuthForm />
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {authStore.user?.role === "admin" ? (
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="border-b border-gray-100 px-4 bg-white/80 backdrop-blur-lg sticky top-0 z-10">
            <TabsList className="my-2 border-2 border-gray-500 rounded-lg mt-10 p-5 bg-gray-50/50">
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-300 data-[state=active]:shadow-sm">
                Customer Chat
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-blue-300 data-[state=active]:shadow-sm">
                Knowledge Base
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              <ChatInterface />
            </div>
          </TabsContent>
          <TabsContent value="admin" className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Base Management</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Upload documents containing vehicle information, service details, and FAQs to enhance AI responses.
                Any content added here will be used by the AI to provide more accurate answers to customer queries.
              </p>
              <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-xl border border-gray-100">
                <DocumentUpload />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ChatInterface />
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
});

export default Index;
