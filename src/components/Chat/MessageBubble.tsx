import React from 'react'
import { format } from 'date-fns'
import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: string
  created_at: string
  user_id: string
  chat_id: string
  user: {
    id: string
    displayName?: string
    email?: string
  }
  chat: {
    id: string
    title: string
  }
}

interface MessageBubbleProps {
  message: Message
  currentUserId: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  const isCurrentUser = message.user_id === currentUserId
  const isAI = message.role === 'assistant'

  return (
    <div className={`flex items-end space-x-2 ${isCurrentUser && !isAI ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="flex-shrink-0">
        {isAI ? (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isAI 
          ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 text-white'
          : isCurrentUser 
            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' 
            : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isAI || isCurrentUser ? 'text-white/70' : 'text-gray-300'
        }`}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  )
}