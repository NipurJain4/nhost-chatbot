import { gql } from '@apollo/client'

// Get messages for a specific chat
export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      chat_id
      content
      role
      created_at
      is_ai
      user_id
      chat {
        id
        title
      }
    }
  }
`

// Subscribe to messages for real-time updates
export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      chat_id
      content
      role
      created_at
      is_ai
      user_id
      chat {
        id
        title
      }
    }
  }
`

// Insert a new message
export const INSERT_MESSAGE = gql`
  mutation InsertMessage(
    $content: String!
    $role: String!
    $chatId: uuid!
    $isAi: Boolean = false
  ) {
    insert_messages_one(object: { 
      content: $content
      role: $role
      chat_id: $chatId
      is_ai: $isAi 
    }) {
      id
      chat_id
      content
      role
      is_ai
      user_id
      created_at
      chat {
        id
        title
      }
    }
  }
`

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String = "New Chat") {
    insert_chats_one(object: { title: $title }) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`

// Get all chats for a user with last message
export const GET_USER_CHATS = gql`
  query GetUserChats($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        content
        role
        created_at
        is_ai
      }
    }
  }
`

// Subscribe to chat list updates
export const CHATS_SUBSCRIPTION = gql`
  subscription ChatsSubscription($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        content
        role
        created_at
        is_ai
      }
    }
  }
`

// Update chat title
export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chat_id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chat_id }, _set: { title: $title }) {
      id
      title
      updated_at
    }
  }
`

// Delete chat
export const DELETE_CHAT = gql`
  mutation DeleteChat($chat_id: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chat_id } }) {
      affected_rows
    }
    delete_chats_by_pk(id: $chat_id) {
      id
    }
  }
`

// Send message action (triggers AI response)
export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      id
      content
      role
      created_at
    }
  }
`

// Get current user profile
export const GET_CURRENT_USER = gql`
  query GetCurrentUser($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      displayName
      email
      createdAt
    }
  }
`
