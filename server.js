import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer } from 'apollo-server'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import resolvers from './resolvers.js'
import typeDefs from './schema.js'
import { TimestampTypeDefinition } from 'graphql-scalars'
import { context } from './auth.js'

const server = new ApolloServer({
    typeDefs: [TimestampTypeDefinition, typeDefs],
    resolvers: { ...resolvers },
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    context: context,
})

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})
