import React, { memo, useEffect, useState } from 'react'
import { Bot } from 'lucide-react'

interface TypingIndicatorProps {
  showTimeout?: boolean
}

const TypingIndicatorComponent: React.FC<TypingIndicatorProps> = ({ showTimeout = false }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [dots, setDots] = useState(1)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev >= 3 ? 1 : prev + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`
      flex items-end space-x-3 transform transition-all duration-500 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `}>
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500/20 animate-pulse">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 px-4 py-3 rounded-2xl rounded-bl-md backdrop-blur-sm shadow-lg relative">
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 bg-purple-400 rounded-full transition-opacity duration-200 ${dots >= 1 ? 'opacity-100' : 'opacity-30'}`}
          />
          <div 
            className={`w-2 h-2 bg-purple-400 rounded-full transition-opacity duration-200 ${dots >= 2 ? 'opacity-100' : 'opacity-30'}`}
          />
          <div 
            className={`w-2 h-2 bg-purple-400 rounded-full transition-opacity duration-200 ${dots >= 3 ? 'opacity-100' : 'opacity-30'}`}
          />
        </div>

        {/* Message tail */}
        <div className="absolute bottom-0 left-0 -ml-1 w-3 h-3 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border-l border-b border-purple-500/30 transform rotate-45" />
      </div>

      {/* Typing text */}
      <div className="text-xs text-white/60 self-end mb-1">
        <div className="animate-pulse">
          AI is thinking{'.'.repeat(dots)}
        </div>
        {showTimeout && (
          <div className="text-xs text-yellow-400 mt-1">
            Response timeout in 10s
          </div>
        )}
      </div>
    </div>
  )
}

export const TypingIndicator = memo(TypingIndicatorComponent)
