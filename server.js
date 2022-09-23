import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer, gql } from 'apollo-server'
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core"
import DB from "./controllers/mysql.controller.js"

const qGoods = async () => {
    return await DB.query("SELECT * FROM goods_catalog")
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Good {
    IDgc: Int
    gcName: String
    IDtg: Int
    gcDescription: String
    gcPhoto: String
    gcCost: Float
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    goods: [Good]
  }
`;


// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      goods: async() => await qGoods(),
    },
};


  
  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    /**
     * What's up with this embed: true option?
     * These are our recommended settings for using AS;
     * they aren't the defaults in AS3 for backwards-compatibility reasons but
     * will be the defaults in AS4. For production environments, use
     * ApolloServerPluginLandingPageProductionDefault instead.
    **/
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
});
  
// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});