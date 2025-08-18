import React, { memo } from 'react'
import { LogOut, Bot, Wifi, WifiOff, AlertCircle, Menu } from 'lucide-react'

interface User {
  id: string
  displayName?: string
  email?: string
}

interface ChatHeaderProps {
  user: User
  onSignOut: () => void
  connectionStatus: 'connected' | 'connecting' | 'error'
  onToggleSidebar?: () => void
  showSidebarToggle?: boolean
}

const ChatHeaderComponent: React.FC<ChatHeaderProps> = ({ 
  user, 
  onSignOut, 
  connectionStatus,
  onToggleSidebar,
  showSidebarToggle = false
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Online'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="border-b border-white/10 p-4 flex items-center justify-between bg-black/20 backdrop-blur-sm">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        {/* Sidebar Toggle (Mobile) */}
        {showSidebarToggle && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* AI Assistant info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <div className={`text-sm flex items-center space-x-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - User info and sign out */}
      <div className="flex items-center space-x-3">
        {/* User info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">
            {user.displayName || 'User'}
          </p>
          <p className="text-xs text-white/60">
            {user.email}
          </p>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg ring-2 ring-blue-500/20">
          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Sign out button */}
        <button
          onClick={onSignOut}
          className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export const ChatHeader = memo(ChatHeaderComponent)
