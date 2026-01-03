# DSA and LLD Learning Platform

A comprehensive learning platform for Data Structures & Algorithms (DSA) and Low-Level Design (LLD) practice, built with Bun + Hono backend and Next.js frontend.

## Features

### DSA Module
- **Custom Lists**: Create custom problem lists with custom names
- **Problem Management**: Add/remove problems from multiple lists
- **Progress Tracking**: Check/uncheck problems to mark them as done/undone
- **Company-Based Search**: Search for top 50 most asked questions for specific companies and roles using AI embeddings
- **Public Lists**: Share your lists publicly or keep them private

### LLD Module
- **Machine Coding Questions**: Practice scenario-based LLD questions
- **AI-Powered Rating**: Get AI ratings (1-10) and detailed feedback on your solutions
- **Theory Section**: Learn LLD principles, design patterns, and best practices
- **Answer History**: View your submitted answers and ratings

### Authentication
- Email/Password authentication
- Google OAuth (ready for integration)
- JWT-based session management

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: MongoDB
- **AI**: OpenAI API (for embeddings and answer rating)
- **Validation**: Zod
- **Authentication**: JWT, bcrypt

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Project Structure

```
leetcode_and_lld/
├── backend/              # Bun + Hono backend
│   ├── src/
│   │   ├── config/      # Configuration (env, database)
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Data access layer
│   │   ├── models/      # Data models
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utilities
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── lib/             # Utilities, API clients
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
└── README.md
```

## Setup Instructions

### Prerequisites
- Bun (latest version)
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
bun install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
OPENAI_API_KEY=sk-proj-your-api-key-here
JWT_SECRET=your-secret-key-here-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=3001
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
bun run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth authentication

### DSA
- `GET /api/dsa/lists/public` - Get public lists (public)
- `POST /api/dsa/search/company` - Search problems by company (protected)
- `POST /api/dsa/lists` - Create list (protected)
- `GET /api/dsa/lists` - Get user's lists (protected)
- `GET /api/dsa/lists/:id` - Get list with problems (protected)
- `PUT /api/dsa/lists/:id` - Update list (protected)
- `DELETE /api/dsa/lists/:id` - Delete list (protected)
- `POST /api/dsa/lists/:id/problems` - Add problem to list (protected)
- `DELETE /api/dsa/lists/:id/problems/:problemId` - Remove problem from list (protected)
- `POST /api/dsa/lists/:id/problems/:problemId/toggle` - Toggle problem status (protected)

### LLD
- `GET /api/lld/questions` - Get questions (public)
- `GET /api/lld/questions/:id` - Get question details (public)
- `POST /api/lld/questions/:id/rate` - Submit answer for rating (protected)
- `GET /api/lld/answers` - Get user's answers (protected)

## Database Schema

### Collections
- `users` - User accounts
- `dsa_problems` - DSA problems with embeddings
- `dsa_lists` - User-created problem lists
- `user_problem_status` - Problem completion status
- `lld_questions` - LLD questions
- `lld_answers` - User-submitted answers with ratings

## Architecture

The project follows clean architecture principles with separate layers:

1. **Routes Layer**: Define API endpoints
2. **Controllers Layer**: Handle HTTP requests/responses
3. **Services Layer**: Business logic (embedding search, LLM rating)
4. **Repositories Layer**: Database operations
5. **Models Layer**: Data schemas

## Development

### Backend
- Uses Bun for fast TypeScript execution
- Hono for lightweight, fast HTTP framework
- MongoDB native driver for database operations
- OpenAI SDK for AI features

### Frontend
- Next.js App Router for modern React development
- Tailwind CSS for styling
- Zustand for state management
- React Hook Form for form handling

## Notes

- The embedding search uses OpenAI's `text-embedding-3-small` model
- LLD answer rating uses GPT-4 for detailed feedback
- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt with 10 rounds

## License

MIT

