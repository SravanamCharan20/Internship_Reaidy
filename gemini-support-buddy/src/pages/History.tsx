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
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chat History</h1>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full hover:bg-blue-50 w-full sm:w-auto"
          >
            <Link to="/" className="flex items-center justify-center sm:justify-start gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {chatStore.messages.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
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