/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Car, X, LogOut } from "lucide-react";
import { chatStore } from "@/store/chatStore";
import { authStore } from "@/store/authStore";
import MessageBubble from "./MessageBubble";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DocumentUpload from "@/components/admin/DocumentUpload";

const FAQs = [
  {
    question: "What services do you offer?",
    answer: "We offer a complete range of automotive services including oil changes, brake repairs, engine diagnostics, transmission services, tire rotations and replacement, air conditioning repairs, and full vehicle maintenance."
  },
  {
    question: "How often should I service my car?",
    answer: "Most manufacturers recommend servicing your vehicle every 10,000 miles or annually, whichever comes first. However, this can vary based on your car model, age, and driving habits."
  },
  {
    question: "How much does an oil change cost?",
    answer: "Our standard oil change starts at $39.99 for conventional oil. Synthetic oil changes start at $69.99. Both services include a complimentary multi-point inspection."
  },
  {
    question: "Do you offer warranties on repairs?",
    answer: "Yes, we provide a 12-month/12,000-mile warranty on all parts and labor for services performed at our shops."
  }
];

const ChatInterface: React.FC = observer(() => {
  const [message, setMessage] = useState("");
  const [showFaqs, setShowFaqs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatStore.messages, chatStore.isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      chatStore.sendMessage(message);
      setMessage("");
    }
  };

  const handleFaqClick = (question: string) => {
    chatStore.sendMessage(question);
    setShowFaqs(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="w-full bg-white backdrop-blur-lg sticky top-0 z-10 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row w-full sm:w-3/4 mx-auto rounded-full m-2 sm:m-3 items-center justify-between p-2 sm:p-3 border border-gray-500 bg-gradient-to-r from-gray-50 to-white shadow-md">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-2 sm:p-3 shadow-xl">
              <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-gray-900">AutoCare Assistant</h2>
              <p className="text-xs sm:text-sm text-gray-600">{chatStore.currentChatName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <span className="text-base sm:text-lg text-gray-600 hidden md:block">Welcome, <span className="text-blue-600 font-bold">{authStore.user?.username}</span></span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => authStore.logout()}
              className="rounded-full border-2 border-red-500 text-sm hover:bg-red-600 hover:text-white transition-all duration-300">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Logout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => chatStore.clearChat()}
              className="text-gray-600 border-2 border-gray-500 rounded-full hover:text-blue-600 transition-all duration-300 text-sm">
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/history"}
              className="text-gray-600 border-2 border-gray-500 rounded-full hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-sm">
              History
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-2 sm:p-4 pb-24 w-full sm:w-3/4 border-2 border-gray-200 rounded-lg mx-auto overflow-y-auto">
  {chatStore.messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center text-gray-600 max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-lg">
          <Car className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-medium text-xl text-gray-900 mb-2">Welcome to AutoCare Support</h3>
        <p className="text-gray-600 mb-6">Ask a question about your vehicle, our services, or maintenance tips</p>

        <Button 
          variant="outline"
          onClick={() => setShowFaqs(!showFaqs)}
          className="mb-4 hover:bg-gray-50"
        >
          {showFaqs ? "Hide FAQs" : "View Common Questions"}
        </Button>

        {showFaqs && (
          <div className="mt-4 text-left bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {FAQs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-blue-600 text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">{faq.answer}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFaqClick(faq.question)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                    >
                      Ask this question
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  ) : (
    chatStore.messages.map((msg) => (
      <MessageBubble key={msg.id} message={msg} />
    ))
  )}

  {/* AI typing indicator */}
  {chatStore.isTyping && (
    <div className="flex w-full mb-4 justify-start">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-2 mr-2 shadow-lg">
          <Car className="h-4 w-4 text-white" />
        </div>
        <div className="bg-white/80 backdrop-blur-lg text-gray-900 rounded-2xl rounded-tl-none py-2 px-4 shadow-sm border border-gray-100">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  )}

  <div ref={messagesEndRef} />
  </div>

      {/* Message Input */}
      <form 
        className="fixed bottom-4 h-16 sm:h-20 left-1/2 transform -translate-x-1/2 p-2 sm:p-5 border-t rounded-full w-[95%] sm:w-3/4 md:w-1/2 items-center justify-center border-gray-100 flex gap-2 bg-white/80 backdrop-blur-lg shadow-lg"
        onSubmit={handleSendMessage}
      >
        <Input
          className="flex-1 bg-white/50 rounded-full border-gray-200 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base"
          placeholder="Ask about our services..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={chatStore.isTyping}
        />
        <Button 
          type="submit" 
          disabled={chatStore.isTyping || !message.trim()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-md px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline ml-1">Send</span>
        </Button>
      </form>
    </div>
  );
});

export default ChatInterface;
