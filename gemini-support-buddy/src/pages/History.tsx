import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { chatStore } from "@/store/chatStore";
import { authStore } from "@/store/authStore";
import MessageBubble from "@/components/chat/MessageBubble";
import { Link } from "react-router-dom";

const History: React.FC = observer(() => {
  useEffect(() => {
    chatStore.fetchAllChatHistory();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat History</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md"><Link to="/">Back to Chat</Link></button>
      
      <div className="space-y-4">
        {chatStore.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />

        ))}
      </div>
    </div>
  );
});

export default History; 