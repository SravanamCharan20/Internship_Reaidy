import React from "react";
import { cn } from "@/lib/utils";
import { Car, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: {
    text: string;
    sender: "user" | "ai" | "system";
    timestamp: Date;
    status?: "sending" | "sent" | "error";
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 sm:my-4">
        <div className="bg-gray-100 text-gray-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2 items-end gap-1.5 sm:gap-2 w-full`}>
      {!isUser && (
        <div className="flex items-center justify-center bg-gray-300 text-gray-600 rounded-full h-6 w-6 sm:h-8 sm:w-8 shadow-md text-xs sm:text-sm">AI</div>
      )}
      <div className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2 sm:py-3 shadow-md break-words ${isUser ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
        <p className="text-sm sm:text-md font-medium break-words">{message.text}</p>
        <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isUser ? "text-blue-200" : "text-gray-500"} text-right`}>
          {new Date(message.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div className="flex items-center justify-center bg-blue-400 text-white rounded-full h-6 w-6 sm:h-8 sm:w-8 shadow-md text-xs sm:text-sm">U</div>
      )}
    </div>
  );
  
  
};
export default MessageBubble;

