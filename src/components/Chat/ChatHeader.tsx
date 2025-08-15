import React from 'react'
import { nhost } from '../../lib/nhost'
import { LogOut, Bot } from 'lucide-react'

export const ChatHeader: React.FC = () => {
  const handleSignOut = () => {
    nhost.auth.signOut()
  }

  return (
    <div className="border-b border-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <p className="text-sm text-green-400">● Online</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  )
}