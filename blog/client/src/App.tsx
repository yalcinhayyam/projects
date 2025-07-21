import { BlogProvider } from "./context/BlogContext";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apollo";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostView from "./pages/PostView";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import React, { Suspense } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded components for better performance
// const LoginPage = React.lazy(() => import("./pages/LoginPage"));
// const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
// const PostDetailPage = React.lazy(() => import("./pages/PostDetailPage"));
// const Unauthorized = React.lazy(() => import("./pages/Unauthorized"));
// const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
// const UserManagementPage = React.lazy(() => import("./pages/admin/UserManagementPage"));
// const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

function MainContent() {
  return (
    <div className="page-transition">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} /> */}

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostView />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            {/* <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} /> */}
          </Route>

          {/* Fallback routes */}
          {/* <Route path="/not-found" element={<NotFoundPage />} /> */}
          {/* <Route path="*" element={<Navigate to="/not-found" replace />} /> */}
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          {/* <BlogProvider> */}
            <div className="min-h-screen bg-gray-50">
              <Layout>
                <MainContent />
              </Layout>
            </div>
          {/* </BlogProvider> */}
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;