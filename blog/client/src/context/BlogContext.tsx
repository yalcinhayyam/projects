// import React, { createContext, useState, useContext, ReactNode } from "react";
// import { Post, User, AuthData, NewPost } from "../types";

// interface BlogContextType {
//   posts: Post[];
//   users: User[];
//   currentUser: User | null;
//   activeTab: string;
//   selectedPost: Post | null;
//   searchTerm: string;
//   showAuth: boolean;
//   authMode: "login" | "register";
//   authData: AuthData;
//   newPost: NewPost;
//   categories: string[];
//   isEditing: boolean;
//   setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
//   setUsers: React.Dispatch<React.SetStateAction<User[]>>;
//   setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
//   setActiveTab: React.Dispatch<React.SetStateAction<string>>;
//   setSelectedPost: React.Dispatch<React.SetStateAction<Post | null>>;
//   setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
//   setShowAuth: React.Dispatch<React.SetStateAction<boolean>>;
//   setAuthMode: React.Dispatch<React.SetStateAction<"login" | "register">>;
//   setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
//   setNewPost: React.Dispatch<React.SetStateAction<NewPost>>;
//   setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
//   handleLike: (postId: number) => void;
//   handleCreatePost: () => void;
//   handleDeletePost: (postId: number) => void;
//   handleViewPost: (post: Post) => void;
//   handleEditPost: (post: Post) => void;
//   handleAuth: () => void;
//   formatDate: (dateString: string) => string;
// }

// const BlogContext = createContext<BlogContextType | undefined>(undefined);

// export const BlogProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [activeTab, setActiveTab] = useState("home");
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentUser, setCurrentUser] = useState<User | null>({
//     id: 1,
//     name: "John Doe",
//     username: "johndoe",
//     email: "john@example.com",
//   });

//   const [posts, setPosts] = useState<Post[]>([
//     {
//       id: 1,
//       title: "React ile Modern Web Geliştirme",
//       content:
//         "React, kullanıcı arayüzleri oluşturmak için güçlü bir JavaScript kütüphanesidir. Component-based yaklaşımı sayesinde yeniden kullanılabilir kod parçaları yazabilirsiniz.\n\nModern React hooks ile state yönetimi çok daha kolay hale geldi. useState, useEffect gibi hooks'lar ile functional component'lerde de güçlü uygulamalar geliştirebilirsiniz.",
//       author: { id: 1, name: "Ali Veli", username: "aliveli" },
//       createdAt: "2024-12-01T10:00:00Z",
//       likes: 12,
//       comments: 3,
//       views: 156,
//       isLiked: false,
//       tags: ["React", "JavaScript", "Web Development"],
//       category: "Teknoloji",
//     },
//     {
//       id: 2,
//       title: "JavaScript ES6+ Özellikleri",
//       content:
//         "Modern JavaScript'in sunduğu arrow functions, destructuring, async/await gibi özellikler geliştirici deneyimini büyük ölçüde iyileştiriyor.\n\nDestructuring ile objelerden ve arraylerden veri çıkarmak çok kolay. Template literals ile string manipülasyonu da oldukça basit.",
//       author: { id: 2, name: "Ayşe Öz", username: "ayseoz" },
//       createdAt: "2024-11-30T15:30:00Z",
//       likes: 8,
//       comments: 1,
//       views: 89,
//       isLiked: true,
//       tags: ["JavaScript", "ES6", "Programming"],
//       category: "Teknoloji",
//     },
//   ]);

//   const [users, setUsers] = useState<User[]>([
//     {
//       id: 1,
//       name: "Ali Veli",
//       username: "aliveli",
//       followers: 120,
//       following: 45,
//       isFollowing: false,
//       bio: "Frontend Developer & UI/UX Designer",
//       joinDate: "2023-01-15",
//     },
//     {
//       id: 2,
//       name: "Ayşe Öz",
//       username: "ayseoz",
//       followers: 89,
//       following: 32,
//       isFollowing: true,
//       bio: "Full Stack Developer",
//       joinDate: "2023-03-22",
//     },
//     {
//       id: 3,
//       name: "Mehmet Kaya",
//       username: "mehmetkaya",
//       followers: 156,
//       following: 78,
//       isFollowing: false,
//       bio: "Mobile App Developer",
//       joinDate: "2022-11-08",
//     },
//   ]);

//   const [newPost, setNewPost] = useState<NewPost>({
//     title: "",
//     content: "",
//     tags: "",
//     category: "Genel",
//     isDraft: false,
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAuth, setShowAuth] = useState(false);
//   const [authMode, setAuthMode] = useState<"login" | "register">("login");
//   const [authData, setAuthData] = useState<AuthData>({
//     email: "",
//     password: "",
//     username: "",
//   });

//   const categories = [
//     "Genel",
//     "Teknoloji",
//     "Sanat",
//     "Bilim",
//     "Spor",
//     "Seyahat",
//     "Yemek",
//   ];

//   const handleLike = (postId: string) => {
//     setPosts(
//       posts.map((post) =>
//         post.id === postId
//           ? {
//               ...post,
//               likes: post.isLiked ? post.likes - 1 : post.likes + 1,
//               isLiked: !post.isLiked,
//             }
//           : post
//       )
//     );
//   };

//   const handleCreatePost = () => {
//     if (newPost.title.trim() && newPost.content.trim() && currentUser) {
//       if (isEditing && selectedPost) {
//         // Update existing post
//         setPosts(
//           posts.map((post) =>
//             post.id === selectedPost.id
//               ? {
//                   ...post,
//                   title: newPost.title,
//                   content: newPost.content,
//                   tags: newPost.tags
//                     .split(",")
//                     .map((tag) => tag.trim())
//                     .filter((tag) => tag),
//                   category: newPost.category,
//                 }
//               : post
//           )
//         );
//         setIsEditing(false);
//       } else {
//         // Create new post
//         const post: Post = {
//           id: Date.now(),
//           title: newPost.title,
//           content: newPost.content,
//           author: {
//             id: currentUser.id,
//             name: currentUser.name,
//             username: currentUser.username,
//           },
//           createdAt: new Date().toISOString(),
//           likes: 0,
//           comments: 0,
//           views: 0,
//           isLiked: false,
//           tags: newPost.tags
//             .split(",")
//             .map((tag) => tag.trim())
//             .filter((tag) => tag),
//           category: newPost.category,
//         };
//         setPosts([post, ...posts]);
//       }
//       setNewPost({
//         title: "",
//         content: "",
//         tags: "",
//         category: "Genel",
//         isDraft: false,
//       });
//       setSelectedPost(null);
//       setActiveTab("home");
//     }
//   };

//   const handleEditPost = (post: Post) => {
//     setNewPost({
//       title: post.title,
//       content: post.content,
//       tags: post.tags.join(", "),
//       category: post.category,
//       isDraft: false,
//     });
//     setSelectedPost(post);
//     setIsEditing(true);
//     setActiveTab("create");
//   };

//   const handleDeletePost = (postId: number) => {
//     setPosts(posts.filter((post) => post.id !== postId));
//     if (selectedPost && selectedPost.id === postId) {
//       setSelectedPost(null);
//       setActiveTab("home");
//     }
//   };

//   const handleViewPost = (post: Post) => {
//     setPosts(
//       posts.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
//     );
//     setSelectedPost(post);
//     setActiveTab("post-view");
//   };

//   const handleAuth = () => {
//     if (authMode === "login") {
//       console.log("Login:", authData.email, authData.password);
//       if (authData.email && authData.password) {
//         setShowAuth(false);
//         setAuthData({ email: "", password: "", username: "" });
//       }
//     } else {
//       console.log(
//         "Register:",
//         authData.username,
//         authData.email,
//         authData.password
//       );
//       if (authData.username && authData.email && authData.password) {
//         setShowAuth(false);
//         setAuthData({ email: "", password: "", username: "" });
//       }
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("tr-TR", {
//       day: "numeric",
//       month: "short",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const value = {
//     posts,
//     users,
//     currentUser,
//     activeTab,
//     selectedPost,
//     searchTerm,
//     showAuth,
//     authMode,
//     authData,
//     newPost,
//     categories,
//     isEditing,
//     setPosts,
//     setUsers,
//     setCurrentUser,
//     setActiveTab,
//     setSelectedPost,
//     setSearchTerm,
//     setShowAuth,
//     setAuthMode,
//     setAuthData,
//     setNewPost,
//     setIsEditing,
//     handleLike,
//     handleCreatePost,
//     handleDeletePost,
//     handleViewPost,
//     handleEditPost,
//     handleAuth,
//     formatDate,
//   };

//   return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
// };

// export const useBlog = () => {
//   const context = useContext(BlogContext);
//   if (context === undefined) {
//     throw new Error("useBlog must be used within a BlogProvider");
//   }
//   return context;
// };
