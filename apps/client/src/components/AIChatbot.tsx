"use client"

import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Loader } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  codeContext?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({
  codeContext = "",
  isOpen: initialOpen = true,
  onClose = () => {},
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! 👋 I'm your AI code assistant. I can help you analyze code, answer questions about commits, suggest improvements, and much more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare the context for the AI
      const fullPrompt = codeContext
        ? `Code context:\n${codeContext}\n\nUser question: ${inputValue}`
        : inputValue;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/github/commit/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: fullPrompt,
          analysisType: "chatbot",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.analysis || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again or check if the AI service is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        title="Open AI Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-blue-100">Always ready to help</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onClose();
          }}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 px-4 py-2 rounded-lg rounded-bl-none border border-gray-200 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by AI • Press Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
