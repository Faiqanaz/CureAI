// Chat.tsx logic snippet
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I am your CureAI health assistant. How are you feeling today?" }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate "Real" AI response delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I've analyzed your input. For accurate medical guidance, please describe your symptoms in detail, or I can help you book an appointment with a specialist." 
      }]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      {/* Map through messages and render input field */}
      <div className="message-list">
        {messages.map((m, i) => <div key={i} className={m.role}>{m.text}</div>)}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
    </div>
  );
}