
import React from 'react';
import { ChatMessage } from '../types';
import { UserCircleIcon, BANK_NAME } from '../constants'; 

const AIChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const aiAvatarLetters = BANK_NAME.substring(0, 2).toUpperCase(); // e.g., "AN" for Apex National

  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-2 self-start">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shadow">
            {aiAvatarLetters}
          </div>
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-xl shadow-sm ${
          isUser ? 'bg-primary text-white ml-8 rounded-br-none' : 'bg-white text-neutral-800 border border-neutral-200 mr-8 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {/* Timestamp can be added if desired */}
        {/* <p className={`text-xs mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> */}
      </div>
      {isUser && (
        <div className="flex-shrink-0 ml-2 self-start">
            <UserCircleIcon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
    </div>
  );
};

export default AIChatBubble;