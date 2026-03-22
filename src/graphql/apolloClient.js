import { ApolloClient, InMemoryCache } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { mockSchema } from './schema'

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          incidents: {
            keyArgs: ['filter', 'page', 'pageSize'],
          },
        },
      },
    },
  }),
  link: new SchemaLink({ schema: mockSchema }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
})
