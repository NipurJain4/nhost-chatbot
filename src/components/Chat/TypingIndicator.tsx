import React from 'react'
import { Bot } from 'lucide-react'

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end space-x-2">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 px-4 py-2 rounded-2xl">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}