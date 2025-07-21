import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { SessionStorage } from "./session-storage";


const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_SERVER_DOMAIN}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${import.meta.env.VITE_SERVER_DOMAIN}/graphql/subscriptions`,
    connectionParams: () => ({
      authorization: SessionStorage.get("token")
        ? `Bearer ${SessionStorage.get("token")}`
        : "",
    }),
    shouldRetry: () => true,
    retryAttempts: 5,
    retryWait: async (retries) =>
      new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: SessionStorage.get("token")
      ? `Bearer ${SessionStorage.get("token")}`
      : "",
  },
}));

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache,
  connectToDevTools: import.meta.env.DEV,
});

export default client;