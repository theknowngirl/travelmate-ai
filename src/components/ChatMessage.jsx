/**
 * ChatMessage.jsx — Individual chat message bubble component.
 */
import React from 'react';
import { Plane } from 'lucide-react';

/** Parse inline **bold** and *italic* markers into React elements. */
function parseLine(text, keyPrefix) {
  const parts = [];
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={`${keyPrefix}-b-${match.index}`}>{match[1]}</strong>);
    else parts.push(<em key={`${keyPrefix}-i-${match.index}`}>{match[2]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

/** Convert AI response text into properly structured React elements. */
function formatMessage(text) {
  const lines = text.split('\n');
  const result = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    const cls = listType === 'ol' ? 'list-decimal ml-5 my-1.5 space-y-0.5' : 'list-disc ml-5 my-1.5 space-y-0.5';
    result.push(<Tag key={`list-${result.length}`} className={cls}>{listItems}</Tag>);
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const bulletMatch = /^[•\-\*]\s+(.*)/.exec(line);
    const numberedMatch = /^\d+[\.\)]\s+(.*)/.exec(line);
    const headingMatch = /^#{1,3}\s+(.*)/.exec(line);

    if (bulletMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(<li key={i}>{parseLine(bulletMatch[1], `li-${i}`)}</li>);
    } else if (numberedMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(<li key={i}>{parseLine(numberedMatch[1], `li-${i}`)}</li>);
    } else if (headingMatch) {
      flushList();
      result.push(
        <p key={i} className="font-semibold text-gray-900 mt-2 mb-0.5">
          {parseLine(headingMatch[1], `h-${i}`)}
        </p>
      );
    } else {
      flushList();
      if (line.trim()) {
        result.push(
          <p key={i} className="mb-1 last:mb-0">
            {parseLine(line, `p-${i}`)}
          </p>
        );
      } else if (result.length > 0 && i < lines.length - 1) {
        result.push(<div key={i} className="h-1" />);
      }
    }
  });

  flushList();
  return result;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold self-end mb-5 ${
        isUser ? 'bg-[#F59E0B] text-white' : 'bg-[#0D9488] text-white'
      }`}>
        {isUser ? '👤' : <Plane className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] sm:max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-[#0D9488] text-white rounded-tr-none'
          : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
      }`}>
        {isUser ? (
          <p>{message.text}</p>
        ) : (
          <div className="space-y-0.5">
            {formatMessage(message.text)}
          </div>
        )}
        {message.timestamp && (
          <p className={`text-[10px] mt-2 ${isUser ? 'text-white/60 text-right' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
