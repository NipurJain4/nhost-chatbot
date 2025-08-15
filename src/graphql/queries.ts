import { gql } from '@apollo/client'

export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      chat_id
      content
      role
      created_at
      is_ai
      user_id
      chat_id
      user {
        id
        displayName
        email
      }
      chat {
        id
        title
      }
    }
  }
`

export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      chat_id
      content
      role
      created_at
      is_ai
      user_id
      chat_id
      user {
        id
        displayName
        email
      }
      chat {
        id
        title
      }
    }
  }
`

export const INSERT_MESSAGE = gql`
  mutation InsertMessage($content: String!, $role: String!, $chatId: uuid!, $userId: uuid!, $isAi: Boolean) {
    insert_messages_one(object: { content: $content, role: $role, chat_id: $chatId, user_id: $userId, is_ai: $isAi }) {
      id
      chat_id
      content
      role
      is_ai
      user_id
      chat_id
      created_at
      user {
        id
        displayName
        email
      }
      chat {
        id
        title
      }
    }
  }
`

export const CREATE_CHAT = gql`
  mutation CreateChat($user_id: uuid!, $title: String = "New Chat") {
    insert_chats_one(object: { user_id: $user_id, title: $title }) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`

export const GET_USER_CHATS = gql`
  query GetUserChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }, order_by: { updated_at: desc }) {
      id
      title
      user_id
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

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