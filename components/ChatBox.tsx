"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  assistantId: string;
}

export function ChatBox({ assistantId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          assistantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في الاتصال بالمساعد");
      }

      const data = await response.json();

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.assistantResponse || "عذراً، لم أستطع معالجة طلبك.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء الاتصال بالمساعد"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp to local time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full p-6 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50 border-0" dir="rtl">
      <div className="flex flex-col h-full">
        <div className="text-xl font-bold mb-6 text-slate-800 border-b pb-3 flex items-center">
          
          مساعد أتم الذكي
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 max-h-[400px] min-h-[300px] rounded-xl p-4 bg-gray-50 border border-gray-100 shadow-inner">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              مرحباً! كيف يمكنني مساعدتك اليوم؟
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "assistant" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm ${
                      msg.role === "assistant"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-2"
                        : "bg-white border border-gray-200 text-gray-800 ml-2"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-semibold text-blue-100">المساعد</span>
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="flex items-center justify-end mb-1">
                        <span className="text-xs font-semibold text-gray-600">أنت</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.role === "assistant"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 resize-none rounded-xl border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="h-10 rounded-full w-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
