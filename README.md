# Nhost Chatbot Application

A modern chatbot application built with React, Nhost authentication, and Hasura GraphQL subscriptions.

## Features

- 🔐 Email authentication with Nhost Auth
- 💬 Real-time chat interface
- 🤖 AI chatbot responses
- 📱 Responsive design
- ⚡ GraphQL subscriptions for real-time updates
- 🎨 Modern UI with Tailwind CSS

## Setup Instructions

### 1. Create a Nhost Project

1. Go to [Nhost Console](https://app.nhost.io/)
2. Create a new project
3. Note your project's subdomain and region

### 2. Configure Database

Run this SQL in your Nhost database console to create the messages table:

```sql
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_ai boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Nhost project details:

```env
REACT_APP_NHOST_SUBDOMAIN=your-project-subdomain
REACT_APP_NHOST_REGION=your-region
```

### 4. Install and Run

```bash
npm install
npm run dev
```

## Usage

1. Create an account or sign in
2. Start chatting with the AI assistant
3. Messages are stored in real-time using GraphQL subscriptions
4. All users can see all messages (perfect for a chat room experience)

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: Nhost Auth
- **Database**: PostgreSQL (via Nhost)
- **Real-time**: GraphQL subscriptions via Hasura
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom gradients and animations

## Project Structure

```
src/
├── components/
│   ├── Auth/          # Authentication components
│   └── Chat/          # Chat interface components
├── graphql/           # GraphQL queries and mutations
├── lib/              # Configuration (Nhost, Apollo)
└── App.tsx           # Main application component
```