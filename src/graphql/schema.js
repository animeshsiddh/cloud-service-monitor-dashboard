import { makeExecutableSchema } from '@graphql-tools/schema'
import { mockResolvers } from './mockResolvers'
import { typeDefs } from './typeDefs'

export const mockSchema = makeExecutableSchema({
  typeDefs,
  resolvers: mockResolvers,
})
