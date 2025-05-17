/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Car, X } from "lucide-react";
import { chatStore } from "@/store/chatStore";
import { authStore } from "@/store/authStore";
import MessageBubble from "./MessageBubble";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-2 mr-3">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">AutoCare Assistant</h2>
            <p className="text-sm text-muted-foreground">
              24/7 Vehicle Service Support
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:block">
            Welcome, {authStore.user?.username}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => authStore.logout()}
          >
            Logout
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => chatStore.clearChat()}
          >
            Clear Chat
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => chatStore.fetchAllChatHistory()}
          >
            Load Full History
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/history"}
          >
            View History
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {chatStore.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center text-muted-foreground max-w-md">
              <Car className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-medium text-lg">Welcome to AutoCare Support</h3>
              <p className="text-sm mb-6">Ask a question about your vehicle, our services, or maintenance tips</p>
              
              <Button 
                variant="outline"
                onClick={() => setShowFaqs(!showFaqs)}
                className="mb-4"
              >
                {showFaqs ? "Hide FAQs" : "View Common Questions"}
              </Button>
              
              {showFaqs && (
                <div className="mt-4 text-left bg-white rounded-lg shadow p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {FAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleFaqClick(faq.question)}
                            className="text-xs"
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
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                <Car className="h-4 w-4" />
              </div>
              <div className="bg-chat-ai-light text-foreground rounded-lg rounded-tl-none py-2 px-4">
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

      {/* Suggested Questions */}
      {chatStore.messages.length > 0 && !chatStore.isTyping && (
        <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => chatStore.sendMessage("What maintenance is recommended for a car with 50,000 miles?")}
          >
            Maintenance at 50k miles
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => chatStore.sendMessage("How often should I replace my brake pads?")}
          >
            Brake replacement
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => chatStore.sendMessage("What causes a check engine light?")}
          >
            Check engine light
          </Button>
        </div>
      )}

      {/* Message Input */}
      <form 
        className="p-4 border-t flex gap-2 bg-white"
        onSubmit={handleSendMessage}
      >
        <Input
          className="flex-1"
          placeholder="Ask about our services, maintenance or repairs..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={chatStore.isTyping}
        />
        <Button 
          type="submit" 
          disabled={chatStore.isTyping || !message.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
});

export default ChatInterface;
