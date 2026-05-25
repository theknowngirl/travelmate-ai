/**
 * ChatMessage.jsx — Individual chat message bubble component.
 */
import React from 'react';
import { Plane } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  // Convert markdown-style bold (**text**) and bullet points to HTML-like formatting
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<li key="${i}" class="ml-4 list-disc">${line.slice(2)}</li>`;
        }
        return line ? `<p class="mb-1">${line}</p>` : '<br/>';
      })
      .join('');
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isUser ? 'bg-[#F59E0B] text-white' : 'bg-[#0D9488] text-white'
      }`}>
        {isUser ? '👤' : <Plane className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#0D9488] text-white rounded-tr-none'
            : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p>{message.text}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
          />
        )}
        {message.timestamp && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/70 text-right' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
