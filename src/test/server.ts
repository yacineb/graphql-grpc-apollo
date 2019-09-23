import { GraphqlGrpcServer } from "../GraphqlGrpcServer";
import { schema, typeDefs, resolvers } from "./exampleSchema";

(async () => {
  await new GraphqlGrpcServer({
    endpoint: "localhost:50051",
    schema,
  }).start();
})();

/**
 * 
/*
/*
 * 
 query GetPosts {
  posts {
    title
    author {
      firstName
      lastName
    }
  }
}
 */

/*
const { ApolloServer, gql } = require("apollo-server");
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

*/
