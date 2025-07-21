import { gql } from "@apollo/client";

// src/graphql/index.js

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      title         
      content       
      likesCount
      createdAt
      updatedAt     
      likes {
        id
        user {
          id
          username
        }
      }
      author {      
        id
        username
      }
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      title
      content
      likesCount
      createdAt
      updatedAt
      likes {
        id
        user {
          id
          username
        }
      }
      author {
        id
        username
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
        createdAt
        updatedAt
      }
    }
  }
`;


export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      likesCount
      createdAt
      updatedAt
      author {
        id
        username
      }
      likes {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: RichText!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
      likesCount
      createdAt
      updatedAt
      author {
        id
        username
      }
      likes {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: RichText) {
    updatePost(id: $id, title: $title, content: $content) {
      id
      title
      content
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      message
      type
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    unreadNotifications {
      id
      message
      type
      read
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      id
      read
    }
  }
`;

export const SUBSCRIBE_TO_PUSH = gql`
  mutation SubscribeToPush($subscription: PushSubscriptionInput!) {
    subscribeToPushNotifications(subscription: $subscription) {
      id
      endpoint
    }
  }
`;

export const UNSUBSCRIBE_FROM_PUSH = gql`
  mutation UnsubscribeFromPush($endpoint: String!) {
    unsubscribeFromPushNotifications(endpoint: $endpoint)
  }
`;

export const NEW_POST_SUBSCRIPTION = gql`
  subscription NewPost($onlyFollowedAuthors: Boolean) {
    newPost(onlyFollowedAuthors: $onlyFollowedAuthors) {
      id
      title
      content
      createdAt
      author {
        id
        username
      }
    }
  }
`;

export const POST_LIKED_SUBSCRIPTION = gql`
  subscription PostLiked {
    postLiked {
      id
      likesCount
    }
  }
`;

export const NEW_FOLLOWER_SUBSCRIPTION = gql`
  subscription NewFollower($userId: ID) {
    newFollower(userId: $userId) {
      id
      username
      followers {
        id
      }
    }
  }
`;

export const NEW_NOTIFICATION_SUBSCRIPTION = gql`
  subscription NewNotification {
    newNotification {
      id
      message
      type
      read
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      followers {
        id
        username
      }
      following {
        id
        username
      }
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followers {
        id
        username
      }
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      username
      email
      followers {
        id
        username
      }
      following {
        id
        username
      }
      posts {
        id
        title
        content
        likesCount
        createdAt
        updatedAt
        likes {
          id
          user {
            id
            username
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

