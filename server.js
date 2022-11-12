import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
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

await server.start()

const app = express()
app.use(graphqlUploadExpress())
app.use(express.static('public'))
server.applyMiddleware({ app })
await new Promise((r) => app.listen({ port: 4000 }, r))

console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)

// server.listen().then(({ url }) => {
//     console.log(`🚀  Server ready at ${url}`)
// })
