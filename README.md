# AI Chatbot

A production-ready AI chatbot built with React, TypeScript, Nhost, and Hasura GraphQL.

## Features

- 🤖 **AI-Powered Conversations** - Integrated with OpenRouter API for intelligent responses
- 🔐 **Secure Authentication** - User authentication powered by Nhost
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates** - Live message updates using GraphQL subscriptions
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 🔒 **Row-Level Security** - Secure data access with Hasura permissions
- 📊 **Production Ready** - Optimized for performance and scalability

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Nhost (PostgreSQL + Hasura GraphQL)
- **Authentication**: Nhost Auth
- **AI Integration**: OpenRouter API via n8n workflow
- **Real-time**: GraphQL Subscriptions
- **Icons**: Lucide React

## Architecture

```
Frontend (React) → Hasura GraphQL → n8n Workflow → OpenRouter API
                ↓
            PostgreSQL Database
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Nhost account and project
- n8n instance (for AI workflow)
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nhost-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Nhost configuration:
   ```env
   VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
   VITE_NHOST_REGION=your-nhost-region
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Database Schema

### Tables

- **users** - User profiles (managed by Nhost Auth)
- **chats** - Chat conversations
- **messages** - Individual messages with AI/user roles

### Key Fields

```sql
-- messages table
id: uuid (primary key)
chat_id: uuid (foreign key)
content: text (message content)
role: text ('user' | 'assistant')
is_ai: boolean
user_id: uuid (foreign key)
created_at: timestamp
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## Configuration

### Hasura Permissions

The app requires proper row-level security permissions:

- **chats**: Users can only access their own chats
- **messages**: Users can only access messages from their chats
- **users**: Users can read their own profile data

### n8n Workflow

The AI integration requires an n8n workflow with:

1. **Webhook Trigger** - Receives requests from Hasura Actions
2. **Data Processing** - Extracts message and chat information
3. **OpenRouter API Call** - Sends message to AI model
4. **Database Insert** - Saves AI response to messages table
5. **Response** - Returns message ID to Hasura

## API Integration

### Hasura Actions

The app uses a Hasura Action called `sendMessage`:

```graphql
mutation SendMessage($chat_id: uuid!, $message: String!) {
  sendMessage(chat_id: $chat_id, message: $message) {
    id
    content
    role
    created_at
  }
}
```

### OpenRouter Models

Supported AI models (configurable in n8n):
- `openai/gpt-oss-20b:free`
- `z-ai/glm-4.5-air:free`
- `qwen/qwen3-coder:free`
- And many more...

## Performance Optimizations

- **React.memo** - Prevents unnecessary re-renders
- **useCallback** - Optimizes function references
- **GraphQL Subscriptions** - Efficient real-time updates
- **Lazy Loading** - Components loaded on demand
- **Error Boundaries** - Graceful error handling
- **Connection Status** - Real-time connection monitoring

## Security Features

- **JWT Authentication** - Secure user sessions
- **Row-Level Security** - Database-level access control
- **Input Validation** - Prevents malicious input
- **CORS Protection** - Secure API access
- **Rate Limiting** - Prevents abuse (via Hasura)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

you can checkout the project by clicking on link : [ https://chatbot-dfkjh.netlify.app/ ]

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using modern web technologies
