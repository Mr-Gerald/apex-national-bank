
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Button from '../components/Button';
import AIChatBubble from '../components/AIChatBubble';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, InformationCircleIcon, BANK_NAME } from '../constants';

const API_KEY = process.env.API_KEY; 

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!API_KEY) {
        setError(`AI Assistant is currently unavailable. This feature requires an API Key which is expected to be configured in the application's environment settings.`);
        console.warn("API_KEY environment variable not set for AI Chat. This feature will be disabled.");
        return;
    }
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Zen, ${BANK_NAME}'s friendly and helpful AI banking assistant. You can answer questions about general banking services (like checking accounts, savings, loans, credit cards), provide financial tips, explain banking terms, and help users navigate the app's features. You cannot perform actual transactions, access or display real account details, or provide financial advice. If asked for real-time data or to perform an action, politely state your limitations. Keep your responses concise, informative, and easy to understand. Be encouraging and positive. Do not ask for Personal Identifiable Information (PII). The current bank name is ${BANK_NAME}.`,
            },
        });
        setChat(newChat);
        setMessages([{ id: 'initial-ai-greeting', text: `Hello! I'm Zen, your AI assistant from ${BANK_NAME}. How can I help you today with general banking questions or financial tips?`, sender: 'ai', timestamp: new Date() }]);
    } catch (e: any) {
        console.error("Failed to initialize AI Chat:", e);
        setError(`Failed to initialize AI Chat: ${e.message}. Please try again later.`);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { id: String(Date.now()), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    let aiMessageId = String(Date.now() + 1); 

    try {
      setMessages(prev => [...prev, { id: aiMessageId, text: "...", sender: 'ai', timestamp: new Date() }]);
      
      const stream = await chat.sendMessageStream({ message: userMessage.text });
      let currentAiMessageText = "";

      for await (const chunk of stream) { 
        if (chunk.text) {
          currentAiMessageText += chunk.text;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? {...msg, text: currentAiMessageText } : msg
          ));
        }
      }
    } catch (e: any) {
      console.error("AI Chat Error:", e);
      setError("Sorry, I encountered an error communicating with the AI. Please try again.");
      
      setMessages(prev => {
        const messageExistsIndex = prev.findIndex(m => m.id === aiMessageId);
        const errorText = "I'm having trouble connecting right now. Please try again in a moment.";

        if (messageExistsIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[messageExistsIndex] = {
            ...prev[messageExistsIndex], 
            text: errorText,
            timestamp: new Date() 
          };
          return updatedMessages;
        } else {
          return [...prev, {
            id: String(Date.now() + 2), 
            text: errorText,
            sender: 'ai',
            timestamp: new Date()
          }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center space-x-3">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-neutral-800">Zen - AI Assistant</h1>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {messages.map((msg) => (
          <AIChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <div className="p-3 bg-red-100 text-red-700 text-sm text-center">{error}</div>}
      
      {!API_KEY && chat === null && ( 
         <div className="p-4 bg-yellow-100 text-yellow-700 text-sm text-center">
            AI Chat is currently unavailable due to missing API Key configuration in the application environment.
        </div>
      )}

      <div className="p-3 border-t border-neutral-200 bg-white sticky bottom-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            placeholder={API_KEY && chat ? "Ask Zen a question..." : "AI Chat unavailable"}
            className="flex-grow p-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
            disabled={isLoading || !chat || !API_KEY}
            aria-label="Chat input"
          />
          <Button onClick={sendMessage} isLoading={isLoading} disabled={isLoading || !input.trim() || !chat || !API_KEY} aria-label="Send message">
            <PaperAirplaneIcon className="w-5 h-5"/>
          </Button>
        </div>
        <p className="text-xs text-neutral-400 mt-1 text-center">
            AI responses are for informational purposes and should not be considered financial advice. Do not share sensitive personal information. This feature uses generative AI.
        </p>
      </div>
    </div>
  );
};

export default AIChatScreen;