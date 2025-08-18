import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { Bot, Loader2 } from 'lucide-react'
import { 
  GET_MESSAGES, 
  MESSAGES_SUBSCRIPTION, 
  INSERT_MESSAGE, 
  CREATE_CHAT, 
  GET_USER_CHATS, 
  CHATS_SUBSCRIPTION,
  SEND_MESSAGE_ACTION,
  UPDATE_CHAT_TITLE,
  DELETE_CHAT
} from '../../graphql/queries'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { TypingIndicator } from './TypingIndicator'
import { ChatList } from './ChatList'
import { ConfirmDialog } from '../UI/ConfirmDialog'
import { ToastContainer } from '../UI/Toast'
import { MessageSkeleton } from '../UI/LoadingSkeleton'
import { useToast } from '../../hooks/useToast'
import { generateChatTitle } from '../../utils/chatTitleGenerator'
import { nhost } from '../../lib/nhost'

interface Message {
  id: string
  chat_id: string
  content: string
  role: string
  created_at: string
  is_ai?: boolean
  user_id: string
  status?: 'sending' | 'sent' | 'failed'
  user?: {
    id: string
    displayName?: string
    email?: string
  }
  chat?: {
    id: string
    title: string
  }
}

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

interface UserProfile {
  id: string
  displayName?: string
  email?: string
}

export const ChatInterface: React.FC = () => {
  const { user: nhostUser, isAuthenticated } = useAuthenticationStatus()
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [aiTyping, setAiTyping] = useState(false)
  const [aiResponseTimeout, setAiResponseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024) // Open by default on desktop
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; chatId: string | null }>({
    isOpen: false,
    chatId: null
  })
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  // Get effective user data
  const actualUser = nhost.auth.getUser()
  const effectiveUser = actualUser || nhostUser
  const effectiveUserId = effectiveUser?.id

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true) // Always open on desktop
      } else {
        setIsSidebarOpen(false) // Closed by default on mobile
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Set user profile
  useEffect(() => {
    if (effectiveUser) {
      console.log('Setting user profile:', effectiveUser)
      setUserProfile({
        id: effectiveUser.id,
        displayName: effectiveUser.displayName || effectiveUser.display_name || 'User',
        email: effectiveUser.email
      })
    } else {
      console.log('No effective user found')
    }
  }, [effectiveUser])

  // Get user's chats with subscription
  const { refetch: refetchChats, loading: chatsLoading } = useQuery(GET_USER_CHATS, {
    variables: { user_id: effectiveUserId },
    skip: !effectiveUserId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Failed to load chats:', error)
      showError('Failed to load chats', 'Please refresh the page')
    },
    onCompleted: (data) => {
      if (data?.chats) {
        setChats(data.chats)
        if (data.chats.length > 0 && !currentChatId) {
          setCurrentChatId(data.chats[0].id)
        }
      }
      setIsInitializing(false)
    }
  })

  // Subscribe to chat list updates
  const { data: chatsSubscriptionData } = useSubscription(CHATS_SUBSCRIPTION, {
    variables: { user_id: effectiveUserId },
    skip: !effectiveUserId,
    onError: () => {
      showError('Chat sync failed', 'Please refresh the page')
    }
  })

  // Update chats from subscription
  useEffect(() => {
    if (chatsSubscriptionData?.chats) {
      setChats(chatsSubscriptionData.chats)
    }
  }, [chatsSubscriptionData])

  // Get messages for current chat
  const { data: messagesData, loading: messagesQueryLoading } = useQuery(GET_MESSAGES, {
    variables: { chatId: currentChatId },
    skip: !currentChatId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Failed to load messages:', error)
      showError('Failed to load messages', 'Please refresh the page')
    }
  })

  // Subscribe to new messages
  const { data: subscriptionData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: currentChatId },
    skip: !currentChatId,
    onError: () => {
      setConnectionStatus('error')
      showError('Connection lost', 'Trying to reconnect...')
    },
    onData: () => {
      setConnectionStatus('connected')
    }
  })

  // Mutations
  const [createChat] = useMutation(CREATE_CHAT, {
    onError: () => {
      showError('Failed to create chat', 'Please try again')
      setIsCreatingChat(false)
    },
    onCompleted: (data) => {
      if (data?.insert_chats_one?.id) {
        setCurrentChatId(data.insert_chats_one.id)
        success('New chat created')
        refetchChats()
      }
      setIsCreatingChat(false)
    }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    onError: () => {
      showError('Failed to send message', 'Please try again')
    }
  })

  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION, {
    onError: (error) => {
      // Only show error if it's not a webhook response format issue
      if (!error.message.includes('webhook response') && !error.message.includes('field "id" expected')) {
        console.error('Send message action error:', error)
        showError('AI response failed', 'Please try again')
        setAiTyping(false)
      } else {
        // This is likely a webhook format issue, but the response might still work
        console.warn('Webhook format warning (response may still work):', error.message)
      }
    },
    onCompleted: () => {
      // Don't set aiTyping to false here immediately, let the subscription handle it
      console.log('Send message action completed')
    }
  })

  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE, {
    onError: () => {
      showError('Failed to rename chat', 'Please try again')
    },
    onCompleted: () => {
      // Only show success message for manual renames (when called from handleRenameChat)
      // Automatic title updates should be silent
      refetchChats()
    }
  })

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onError: () => {
      showError('Failed to delete chat', 'Please try again')
    },
    onCompleted: () => {
      success('Chat deleted successfully')
      refetchChats()
    }
  })

  // Handle creating new chat
  const handleCreateNewChat = useCallback(async () => {
    if (!effectiveUserId || isCreatingChat) return

    setIsCreatingChat(true)
    try {
      // Create chat with a timestamp-based title that will be auto-updated
      const now = new Date()
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const initialTitle = `Chat ${timeString}`
      
      await createChat({
        variables: {
          title: initialTitle
        }
      })
    } catch {
      showError('Failed to create new chat', 'Please try again')
      setIsCreatingChat(false)
    }
  }, [effectiveUserId, createChat, showError, isCreatingChat])

  // Create initial chat if none exists
  useEffect(() => {
    if (effectiveUserId && chats.length === 0 && !currentChatId && !isInitializing && !chatsLoading) {
      handleCreateNewChat()
    }
  }, [effectiveUserId, chats.length, currentChatId, isInitializing, chatsLoading, handleCreateNewChat])

  // Update messages when data changes
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages)
    }
  }, [messagesData])

  // Update messages from subscription
  useEffect(() => {
    if (subscriptionData?.messages) {
      const newMessages = subscriptionData.messages
      const previousMessageCount = messages.length
      
      // Check if we received a new AI message
      if (newMessages.length > previousMessageCount) {
        const latestMessage = newMessages[newMessages.length - 1]
        if (latestMessage.is_ai || latestMessage.role === 'assistant') {
          // AI responded, clear timeout and stop typing indicator
          if (aiResponseTimeout) {
            clearTimeout(aiResponseTimeout)
            setAiResponseTimeout(null)
          }
          setAiTyping(false)
        }
      }
      
      setMessages(newMessages)
      
      // Auto-generate chat title after first AI response
      if (newMessages.length >= 2 && currentChatId) {
        const currentChat = chats.find(chat => chat.id === currentChatId)
        if (currentChat && (
          currentChat.title === 'New Chat' || 
          currentChat.title.startsWith('Chat ') ||
          currentChat.title.match(/^Chat \d{1,2}:\d{2}$/) // Matches "Chat HH:MM" format
        )) {
          const generatedTitle = generateChatTitle(newMessages)
          if (generatedTitle && generatedTitle !== 'New Chat' && generatedTitle !== currentChat.title) {
            // Update chat title automatically
            updateChatTitle({
              variables: {
                chat_id: currentChatId,
                title: generatedTitle
              }
            }).catch(error => {
              console.error('Failed to auto-update chat title:', error)
            })
          }
        }
      }
    }
  }, [subscriptionData, messages.length, aiResponseTimeout, currentChatId, chats, updateChatTitle])

  // Set messages loading state
  useEffect(() => {
    setMessagesLoading(messagesQueryLoading)
  }, [messagesQueryLoading])

  // Cleanup timeout when chat changes or component unmounts
  useEffect(() => {
    return () => {
      if (aiResponseTimeout) {
        clearTimeout(aiResponseTimeout)
        setAiResponseTimeout(null)
      }
    }
  }, [currentChatId, aiResponseTimeout])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, aiTyping, scrollToBottom])

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!effectiveUserId || !currentChatId || !content.trim()) {
      return
    }

    const trimmedContent = content.trim()

    try {
      // Insert user message
      await insertMessage({
        variables: {
          content: trimmedContent,
          role: 'user',
          chatId: currentChatId,
          isAi: false
        }
      })

      // Set AI typing indicator
      setAiTyping(true)

      // Set up timeout for AI response (10 seconds)
      const timeout = setTimeout(() => {
        setAiTyping(false)
        showError('AI response timeout', 'The AI took too long to respond. Please try again.')
        setAiResponseTimeout(null)
      }, 10000)
      
      setAiResponseTimeout(timeout)

      // Send to AI
      try {
        await sendMessageAction({
          variables: {
            chat_id: currentChatId,
            message: trimmedContent
          }
        })
      } catch (error) {
        // Only handle non-webhook errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (!errorMessage.includes('webhook response') && !errorMessage.includes('field "id" expected')) {
          if (timeout) {
            clearTimeout(timeout)
            setAiResponseTimeout(null)
          }
          setAiTyping(false)
          showError('Failed to send message', 'Please try again')
        }
        // For webhook errors, let the timeout handle it if no response comes
      }
    } catch {
      setAiTyping(false)
      showError('Failed to send message', 'Please try again')
    }
  }, [effectiveUserId, currentChatId, insertMessage, sendMessageAction, showError])

  // Handle message retry
  const handleRetryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      await handleSendMessage(message.content)
    }
  }, [messages, handleSendMessage])

  // Handle sign out
  const handleSignOut = useCallback(() => {
    nhost.auth.signOut()
  }, [])

  // Handle chat selection
  const handleChatSelect = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
  }, [])

  // Handle manual title generation
  const handleGenerateTitle = useCallback(async (chatId: string) => {
    try {
      // Get messages for the specific chat
      const chatMessages = messages.filter(msg => msg.chat_id === chatId)
      if (chatMessages.length === 0) {
        showError('No messages found', 'Cannot generate title for empty chat')
        return
      }

      const generatedTitle = generateChatTitle(chatMessages)
      if (generatedTitle && generatedTitle !== 'New Chat') {
        await updateChatTitle({
          variables: {
            chat_id: chatId,
            title: generatedTitle
          }
        })
        success('Title generated successfully')
      } else {
        showError('Could not generate title', 'Unable to create a meaningful title from the conversation')
      }
    } catch {
      showError('Failed to generate title', 'Please try again')
    }
  }, [messages, updateChatTitle, showError, success])

  // Handle chat rename
  const handleRenameChat = useCallback(async (chatId: string, newTitle: string) => {
    try {
      await updateChatTitle({
        variables: {
          chat_id: chatId,
          title: newTitle
        }
      })
      success('Chat renamed successfully')
    } catch {
      showError('Failed to rename chat', 'Please try again')
    }
  }, [updateChatTitle, showError, success])

  // Handle chat delete
  const handleDeleteChat = useCallback((chatId: string) => {
    setDeleteConfirm({ isOpen: true, chatId })
  }, [])

  const confirmDeleteChat = useCallback(async () => {
    if (!deleteConfirm.chatId) return

    try {
      await deleteChat({
        variables: {
          chat_id: deleteConfirm.chatId
        }
      })

      // If deleting current chat, switch to another chat or create new one
      if (deleteConfirm.chatId === currentChatId) {
        const remainingChats = chats.filter(c => c.id !== deleteConfirm.chatId)
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id)
        } else {
          setCurrentChatId(null)
          handleCreateNewChat()
        }
      }
    } catch {
      showError('Failed to delete chat', 'Please try again')
    } finally {
      setDeleteConfirm({ isOpen: false, chatId: null })
    }
  }, [deleteConfirm.chatId, currentChatId, chats, deleteChat, showError, handleCreateNewChat])

  // Loading state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Check if we have a valid user
  if (!effectiveUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Authentication error. Please try signing in again.</p>
          <button
            onClick={() => nhost.auth.signOut()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Initialization loading
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Setting up your chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex overflow-hidden">
      {/* Fixed Sidebar - Always visible on desktop, toggleable on mobile */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/50 backdrop-blur-md border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0 lg:flex-shrink-0
        flex flex-col
      `}>
        <ChatList
          chats={chats}
          currentChatId={currentChatId}
          isLoading={chatsLoading}
          onChatSelect={handleChatSelect}
          onNewChat={handleCreateNewChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onGenerateTitle={handleGenerateTitle}
        />
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area - Takes remaining space */}
      <div className={`
        flex-1 flex flex-col min-w-0 h-screen
        ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
      `}>
        <ChatHeader 
          user={userProfile || { displayName: 'User', email: effectiveUser?.email || '' }} 
          onSignOut={handleSignOut}
          connectionStatus={connectionStatus}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          showSidebarToggle={true}
        />
        
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
          {messagesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <MessageSkeleton key={index} isAi={index % 2 === 0} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to ChatBot AI</h2>
              <p className="mb-4">Start a conversation by typing a message below.</p>
              {!currentChatId && (
                <button
                  onClick={handleCreateNewChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isAi={message.is_ai || message.role === 'assistant'}
                user={message.user || userProfile}
                onRetry={handleRetryMessage}
              />
            ))
          )}
          
          {aiTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={!currentChatId || !effectiveUserId || aiTyping}
            placeholder={!currentChatId ? "Creating chat..." : aiTyping ? "AI is typing..." : "Type your message..."}
          />
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Chat"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteChat}
        onCancel={() => setDeleteConfirm({ isOpen: false, chatId: null })}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  )
}
