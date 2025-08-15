import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider, useAuthenticationStatus } from '@nhost/react'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { AuthScreen } from './components/Auth/AuthScreen'
import { ChatInterface } from './components/Chat/ChatInterface'
import { Loader2 } from 'lucide-react'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <ChatInterface />
}

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppContent />
      </ApolloProvider>
    </NhostProvider>
  )
}

export default App