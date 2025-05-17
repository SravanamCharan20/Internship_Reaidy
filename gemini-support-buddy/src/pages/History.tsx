import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { chatStore } from "@/store/chatStore";
import { authStore } from "@/store/authStore";
import MessageBubble from "@/components/chat/MessageBubble";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const History: React.FC = observer(() => {
  useEffect(() => {
    chatStore.fetchConversations(true);
    return () => {
      // Reset history view flag when leaving the history page
      chatStore.isHistoryView = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full hover:bg-blue-50"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            {chatStore.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No chat history available
              </div>
            ) : (
              chatStore.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default History; 