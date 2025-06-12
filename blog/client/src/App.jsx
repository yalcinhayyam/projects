import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql/subscriptions',
  connectionParams: () => {
    const token = localStorage.getItem("token");
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
  shouldRetry: () => true,
  retryAttempts: 5, 
  retryWait: async (retries) => {
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    return true;
  },
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Post: {
      fields: {
        likes: {
          merge(existing = [], incoming) {
            const merged = existing ? existing.slice(0) : [];
            incoming.forEach(incomingLike => {
              const existingIndex = merged.findIndex(
                existingLike => existingLike.__ref === incomingLike.__ref
              );

              if (existingIndex !== -1) {
                merged[existingIndex] = incomingLike;
              } else {
                merged.push(incomingLike);
              }
            });

            return incoming; 
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache, 
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100 font-sans leading-relaxed text-gray-800">
            <Navbar />
            <Toaster position="top-center" />
            <div className="container mx-auto p-4 max-w-screen-xl">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;