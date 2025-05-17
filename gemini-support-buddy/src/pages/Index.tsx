
import React from "react";
import { observer } from "mobx-react-lite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from "@/components/auth/AuthForm";
import ChatInterface from "@/components/chat/ChatInterface";
import DocumentUpload from "@/components/admin/DocumentUpload";
import { authStore } from "@/store/authStore";
import { Toaster } from "@/components/ui/sonner";
import { Car } from "lucide-react";

const Index = observer(() => {
  if (!authStore.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">AutoCare Chat</h1>
            <p className="text-muted-foreground">
              Expert vehicle support powered by AI
            </p>
          </div>
          <AuthForm />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {authStore.user?.isAdmin ? (
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="border-b px-4 bg-gray-50">
            <TabsList className="my-2">
              <TabsTrigger value="chat">Customer Chat</TabsTrigger>
              <TabsTrigger value="admin">Knowledge Base</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              <ChatInterface />
            </div>
          </TabsContent>
          <TabsContent value="admin" className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Knowledge Base Management</h2>
            <p className="text-muted-foreground mb-6">
              Upload documents containing vehicle information, service details, and FAQs to enhance AI responses.
              Any content added here will be used by the AI to provide more accurate answers to customer queries.
            </p>
            <DocumentUpload />
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
