import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatViewProps {
  analysis: AnalysisResult;
  initialQuery?: string | null;
  onClearInitialQuery?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ analysis, initialQuery, onClearInitialQuery }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hi! I've analyzed your ${analysis.faceShape} face shape and ${analysis.undertone} undertone. What specific technique would you like to learn today?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedInitialQuery = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !processedInitialQuery.current && !isLoading) {
      processedInitialQuery.current = true;
      handleSend(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    const contextMessage = `Context: User has ${analysis.faceShape} face, ${analysis.undertone} undertone, ${analysis.skinType} skin, ${analysis.eyeColor || 'unknown'} eyes. Structural notes: ${analysis.structuralAnalysis}.`;
    
    const apiHistory = [
        { role: 'user', parts: [{ text: contextMessage }] },
        { role: 'model', parts: [{ text: "Understood. I have the user's profile loaded." }] },
        ...history
    ];

    try {
      const responseText = await sendChatMessage(apiHistory, userMsg.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "I'm having trouble connecting. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      <div className="bg-white border-b border-aura-100 p-4 pt-8 text-center sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-aura-900">Coach Chat</h2>
        <p className="text-xs text-aura-500">Ask about techniques, tools, or color theory.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-aura-600 text-white rounded-br-none'
                  : 'bg-aura-50 text-aura-900 border border-aura-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-2 border-b border-black/5 pb-2">
                      <Sparkles size={14} className="text-aura-500" /> 
                      <span className="text-xs font-bold text-aura-600 uppercase tracking-wide">FacetStudio</span>
                  </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-aura-50 text-aura-500 p-4 rounded-2xl rounded-bl-none text-xs flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-aura-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-aura-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-aura-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-aura-100 sticky bottom-16">
        <div className="flex items-center gap-2 bg-aura-50 rounded-full px-4 py-2 border border-aura-200 focus-within:ring-2 focus-within:ring-aura-300 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask specific questions..."
            className="flex-1 bg-transparent border-none outline-none text-aura-900 placeholder-aura-400 text-sm py-2"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-aura-600 text-white rounded-full hover:bg-aura-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
