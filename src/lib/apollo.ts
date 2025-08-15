import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
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
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
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
  link: splitLink,
  cache: new InMemoryCache()
})