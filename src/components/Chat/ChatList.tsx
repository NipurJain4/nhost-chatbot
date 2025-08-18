import React, { memo, useState, useMemo } from 'react'
import { Plus, Search, X, MessageSquare } from 'lucide-react'
import { ChatListItem } from './ChatListItem'
import { ChatListSkeleton } from '../UI/LoadingSkeleton'

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Array<{
    id: string
    content: string
    role: string
    created_at: string
    is_ai?: boolean
  }>
}

interface ChatListProps {
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onDeleteChat: (chatId: string) => void
  onGenerateTitle?: (chatId: string) => void
}

const ChatListComponent: React.FC<ChatListProps> = ({
  chats,
  currentChatId,
  isLoading,
  onChatSelect,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onGenerateTitle
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats

    const query = searchQuery.toLowerCase()
    return chats.filter(chat => {
      const titleMatch = chat.title.toLowerCase().includes(query)
      const messageMatch = chat.messages.some(message => 
        message.content.toLowerCase().includes(query)
      )
      return titleMatch || messageMatch
    })
  }, [chats, searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border-r border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Chats</h2>
          <button
            onClick={onNewChat}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="New Chat"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className={`
            flex items-center space-x-2 bg-white/5 border rounded-lg px-3 py-2 transition-all duration-200
            ${isSearchFocused ? 'border-blue-500 bg-white/10' : 'border-white/10'}
          `}>
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 chat-scroll">
        {isLoading ? (
          <ChatListSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
            {searchQuery ? (
              <>
                <h3 className="text-white/60 font-medium mb-2">No chats found</h3>
                <p className="text-white/40 text-sm">
                  Try adjusting your search terms
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <h3 className="text-white/60 font-medium mb-2">No chats yet</h3>
                <p className="text-white/40 text-sm mb-4">
                  Start a conversation to see your chats here
                </p>
                <button
                  onClick={onNewChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Start New Chat
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onClick={() => onChatSelect(chat.id)}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
                onGenerateTitle={onGenerateTitle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          {filteredChats.length} {filteredChats.length === 1 ? 'chat' : 'chats'}
          {searchQuery && ` found for "${searchQuery}"`}
        </div>
      </div>
    </div>
  )
}

export const ChatList = memo(ChatListComponent)
