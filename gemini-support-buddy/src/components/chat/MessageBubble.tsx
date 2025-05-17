
import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/store/chatStore";
import { CheckCircle, AlertCircle, Car, MessageSquare } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUserMessage = message.sender === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isUserMessage && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
          <Car className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg py-2 px-4 shadow-sm",
          isUserMessage 
            ? "bg-chat-user text-foreground rounded-tr-none" 
            : "bg-gradient-to-r from-primary to-secondary text-white rounded-tl-none"
        )}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.text}
        </div>
        {message.status && (
          <div className="flex items-center justify-end mt-1 text-xs">
            {message.status === "sending" && (
              <span className="opacity-70">Sending...</span>
            )}
            {message.status === "sent" && (
              <span className="flex items-center opacity-70">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sent
              </span>
            )}
            {message.status === "error" && (
              <span className="flex items-center text-red-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed to get response
              </span>
            )}
          </div>
        )}
        <div className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      {isUserMessage && (
        <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center ml-2 flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-zinc-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
