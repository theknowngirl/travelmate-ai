/**
 * Chat.jsx — AI-powered travel chatbot page.
 * Full conversation history, typing indicator, and starter prompts.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Plane, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import ChatMessage from '../components/ChatMessage';
import { sendChatMessage } from '../service/AIModal';
import { toast } from 'sonner';

const STARTER_PROMPTS = [
  'Plan a 5-day trip to Paris on a moderate budget',
  'Best destinations for solo travel in Asia',
  'What to pack for a beach vacation?',
  'Estimate the cost of a 7-day Europe trip',
  'Hidden gems to visit in Japan',
  'Family-friendly activities in New York City',
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build history for Gemini (exclude the current message — it's sent separately)
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const aiText = await sendChatMessage(history, trimmed);

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: aiText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('[Chat] Error:', err);
      toast.error('Failed to get a response. Check your Gemini API key.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "I'm sorry, I encountered an error. Please check your API configuration and try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* ── Chat Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0D9488] rounded-full flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">TravelMate AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-500">Online · Travel Planning Assistant</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Empty state with starter prompts */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#0D9488]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Ask TravelMate AI anything
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Get destination ideas, trip plans, packing tips, budget estimates, and more.
              </p>

              {/* Starter prompt chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isTyping}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-teal-50 transition-all cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center flex-shrink-0">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about destinations, budgets, packing, or anything travel..."
            className="flex-1 h-12 rounded-xl border-gray-200 focus:border-[#0D9488]"
            disabled={isTyping}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 rounded-xl p-0 flex-shrink-0 shadow-md shadow-teal-100"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by Google Gemini 2.0 Flash · Press Enter to send
        </p>
      </div>
    </div>
  );
}
