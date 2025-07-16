const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();

  // ✅ Use express.json() instead of body-parser
  app.use(express.json());

  // ✅ Global CORS config
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.options('*', cors());

  // ✅ Start Apollo Server
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  // ✅ Use expressMiddleware without body-parser
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.authorization })
    })
  );

  app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });
}

startServer();
