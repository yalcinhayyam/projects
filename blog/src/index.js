require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const { authenticate } = require("./utils/auth");
const { expressMiddleware } = require("@as-integrations/express5");
const rateLimit = require("express-rate-limit");
const pubsub = require("./utils/pubsub");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 100 istek
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express();
  const httpServer = createServer(app);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    })
  );

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql/subscriptions",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        return {
          prisma,
          pubsub,
          user: ctx.extra.user,
        };
      },
      onConnect: async (ctx) => {
        const token = ctx.connectionParams?.authorization;

        if (!token) throw new Error("Authentication required");

        try {
          const user = await authenticate(token);
          ctx.extra.user = user;
          return true;
        } catch (error) {
          console.error("WebSocket auth error:", error);
          throw new Error("Invalid token");
        }
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (error) => {
      console.error(error);
      return {
        message: error.message,
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
      };
    },
  });

  await server.start();

  app.use(
    "/graphql",
    limiter,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization;
        let user = null;

        if (token) {
          try {
            user = await authenticate(token);
          } catch (error) {
            console.error("Authentication error:", error);
          }
        }

        return { prisma, user, pubsub };
      },
    })
  );

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  httpServer.listen(PORT, () => {
    const networkInterfaces = require("os").networkInterfaces();
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);

    Object.keys(networkInterfaces).forEach((iface) => {
      networkInterfaces[iface].forEach((details) => {
        if (details.family === "IPv4" && !details.internal) {
          console.log(
            `🚀 Server ready at http://${details.address}:${PORT}/graphql`
          );
        }
      });
    });

    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}/graphql/subscriptions`
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
