import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { nhost } from './nhost'

const httpLink = createHttpLink({
  uri: `https://${import.meta.env.VITE_NHOST_SUBDOMAIN || 'local'}.hasura.${import.meta.env.VITE_NHOST_REGION || 'us-east-1'}.nhost.run/v1/graphql`
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: `wss://${import.meta.env.VITE_NHOST_SUBDOMAIN || 'local'}.hasura.${import.meta.env.VITE_NHOST_REGION || 'us-east-1'}.nhost.run/v1/graphql`,
    connectionParams: () => ({
      headers: {
        Authorization: `Bearer ${nhost.auth.getAccessToken()}`
      }
    })
  })
)

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()
  console.log('Apollo auth token:', token ? 'Present' : 'Missing')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // Handle specific webhook errors more gracefully
      if (message.includes('webhook response') || message.includes('field "id" expected')) {
        console.warn(
          `[GraphQL webhook warning]: ${message} - This may be expected behavior`
        )
      } else {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    
    // If it's a 401 error, the token might be expired
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      console.log('401 error detected - token might be expired')
    }
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(_, incoming) {
              return incoming
            }
          },
          messages: {
            merge(_, incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    }
  }
})