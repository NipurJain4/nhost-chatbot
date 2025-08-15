import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { Bot } from 'lucide-react'
import { GET_MESSAGES, MESSAGES_SUBSCRIPTION, INSERT_MESSAGE, CREATE_CHAT, GET_USER_CHATS, SEND_MESSAGE_ACTION } from '../../graphql/queries'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { TypingIndicator } from './TypingIndicator'
import { nhost } from '../../lib/nhost'

interface Message {
  id: string
  chat_id: string
  content: string
  role: string
  created_at: string
  is_ai?: boolean
  user_id: string
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

interface Chat {
  id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
}

export const ChatInterface: React.FC = () => {
  const { user, isAuthenticated } = useAuthenticationStatus()
  const apolloClient = useApolloClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [aiTyping, setAiTyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('connected')
  const [lastError, setLastError] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get user's chats
  const { data: chatsData } = useQuery(GET_USER_CHATS, {
    variables: { user_id: user?.id },
    skip: !user?.id || !isAuthenticated,
    onCompleted: (data) => {
      console.log('✅ Chats loaded:', data)
      setConnectionStatus('connected')
      if (data.chats.length > 0 && !currentChatId) {
        setCurrentChatId(data.chats[0].id)
      }
    },
    onError: (error) => {
      console.error('❌ Error loading chats:', error)
      setConnectionStatus('error')
      setLastError(`Chats error: ${error.message}`)
    }
  })

  // Get messages for current chat
  const { data: messagesData, loading: messagesLoading, error: messagesError } = useQuery(GET_MESSAGES, {
    variables: { chatId: currentChatId },
    skip: !currentChatId,
    onCompleted: (data) => {
      console.log('✅ Messages loaded successfully:', data)
      setConnectionStatus('connected')
    },
    onError: (error) => {
      console.error('❌ Error loading messages:', error)
      setConnectionStatus('error')
      setLastError(`Query error: ${error.message}`)
    }
  })

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      console.log('✅ Chat created successfully:', data)
      setCurrentChatId(data.insert_chats_one.id)
      setConnectionStatus('connected')
    },
    onError: (error) => {
      console.error('❌ Error creating chat:', error)
      setLastError(`Create chat error: ${error.message}`)
      setConnectionStatus('error')
    }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    onCompleted: (data) => {
      console.log('✅ Message inserted successfully:', data)
    },
    onError: (error) => {
      console.error('❌ Error inserting message:', error)
      setLastError(`Insert error: ${error.message}`)
    }
  })

  const [sendMessage] = useMutation(SEND_MESSAGE_ACTION, {
    onCompleted: (data) => {
      console.log('✅ AI message sent successfully:', data)
    },
    onError: (error) => {
      console.error('❌ Error sending AI message:', error)
      setLastError(`AI action error: ${error.message}`)
    }
  })

  useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: currentChatId },
    skip: !currentChatId,
    onData: ({ data }) => {
      console.log('📡 Subscription data received:', data)
      if (data.data?.messages?.[0]) {
        const newMessage = data.data.messages[0]
        // Only add messages from current chat
        if (newMessage.chat_id === currentChatId) {
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev
            }
            return [newMessage, ...prev]
          })
        }
      }
    },
    onError: (error) => {
      console.error('❌ Subscription error:', error)
      setLastError(`Subscription error: ${error.message}`)
    }
  })

  // Simple authentication check
  useEffect(() => {
    const testConnection = async () => {
    if (user && isAuthenticated) {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      })
      setConnectionStatus('connected')
    } else {
      console.log('❌ User not authenticated:', { user: !!user, isAuthenticated })
      setConnectionStatus('no-user')
    }
    }
    testConnection()
  }, [user, isAuthenticated, apolloClient])

  // Create initial chat if user has no chats
  useEffect(() => {
    if (user?.id && isAuthenticated && chatsData && chatsData.chats.length === 0 && !currentChatId) {
      console.log('🆕 Creating initial chat for user')
      createChat({
        variables: {
          user_id: user.id,
          title: 'New Chat'
        }
      })
    }
  }, [user?.id, isAuthenticated, chatsData, currentChatId, createChat])

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages.reverse())
    }
  }, [messagesData])

  useEffect(() => {
    scrollToBottom()
  }, [messages, aiTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !isAuthenticated || !currentChatId) return

    console.log('📤 Sending message:', { content, userId: user.id, chatId: currentChatId })
    setLastError('')

    try {
      // Insert user message
      await insertMessage({
        variables: {
          content,
          user_id: user.id,
          role: 'user',
          chatId: currentChatId,
          userId: user.id,
          isAi: false
        }
      })
      console.log('✅ User message inserted')

      // Show AI typing indicator
      setAiTyping(true)

      try {
        // Try to send message to AI using the action
        await sendMessage({
          variables: {
            chat_id: currentChatId,
            message: content
          }
        })
        console.log('✅ AI action completed')
      } catch (actionError) {
        console.log('AI action not available, using fallback response')
        
        // Fallback: Generate a simple AI response
        const aiResponses = [
          "Hello! How can I help you today?",
          "That's interesting! Tell me more.",
          "I understand. What would you like to know?",
          "Thanks for your message! I'm here to assist you.",
          "Great question! Let me think about that.",
          "I'm an AI assistant. How can I be of service?"
        ]
        
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
        
        // Insert AI response after a short delay
        setTimeout(async () => {
          await insertMessage({
            variables: {
              content: randomResponse,
              user_id: user.id,
              role: 'assistant',
              chatId: currentChatId,
              userId: user.id,
              isAi: true
            }
          })
        }, 1000)
      }

      setAiTyping(false)
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error)
      setAiTyping(false)
      setLastError(`Send message error: ${error}`)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <ChatHeader />
      
      {/* Debug Panel */}
      <div className="bg-black/20 p-2 text-xs text-white border-b border-white/10">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded text-xs ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
            connectionStatus === 'checking' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {connectionStatus === 'connected' ? '🟢 Connected' :
             connectionStatus === 'checking' ? '🟡 Checking...' :
             connectionStatus === 'no-user' ? '🔴 No User' :
             '🔴 Error'}
          </span>
          <span className="text-gray-300">
            User: {user?.displayName || user?.email || 'Unknown'} {user?.id ? `(${user.id.slice(0, 8)}...)` : ''}
          </span>
          {(user || nhost.auth.getUser()) && (
            <span className="text-gray-300">
              User: {user?.displayName || user?.email} ({user?.id.slice(0, 8)}...)
            </span>
          )}
          {currentChatId && (
            <span className="text-blue-300">
              Chat: {currentChatId.slice(0, 8)}...
            </span>
          )}
          {messagesLoading && <span className="text-blue-300">Loading messages...</span>}
          {messagesError && <span className="text-red-300">Query Error!</span>}
        </div>
        <div className="mt-1 text-gray-400 text-xs">
          Endpoint: {import.meta.env.VITE_NHOST_SUBDOMAIN || 'local'}.hasura.{import.meta.env.VITE_NHOST_REGION || 'us-east-1'}.nhost.run
          {nhost.auth.getAccessToken() && <span className="ml-2 text-green-300">🔑 Authenticated</span>}
        </div>
        {lastError && (
          <div className="mt-1 text-red-300 text-xs">
            Error: {lastError}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentChatId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Creating your chat...</h3>
              <p className="text-gray-300">Please wait while we set up your conversation</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {messagesLoading ? 'Loading messages...' : 'Start a conversation'}
              </h3>
              <p className="text-gray-300">
                {messagesLoading ? 'Please wait while we load your chat history' : 
                 messagesError ? 'There was an error loading messages. Check the debug panel above.' :
                 'Send a message to begin chatting with the AI assistant'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user?.id || ''}
              />
            ))}
            {aiTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} loading={aiTyping || !currentChatId} />
    </div>
  )
}