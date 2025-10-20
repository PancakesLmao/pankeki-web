# Elysia + Supabase Backend

A backend API built with [Elysia](https://elysiajs.com/) and [Supabase](https://supabase.com/).

## Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project (create one at [supabase.com](https://supabase.com))

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Update the `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
```

To get your Supabase credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` `secret` key → `SUPABASE_KEY` (use service role for admin access)

### 3. Run the Server

Development mode:

```bash
bun run dev
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET /health
```

Returns server status.

### Authentication (Admin Only)

This is a personal portfolio website, so user registration is disabled. Only the admin can sign in.

#### Sign In

```bash
POST /auth/signin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_admin_password"
}
```

#### Sign Out

```bash
POST /auth/signout
```

#### Get Current User

```bash
GET /auth/me
```

#### Refresh Token

```bash
POST /auth/refresh
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main application entry point
│   ├── libs/
│   │   └── supabase.ts   # Supabase client configuration
│   └── routes/
│       └── authen.ts     # Authentication routes
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- ✅ Admin authentication with Supabase (signin, signout)
- ✅ Cookie-based session management
- ✅ CORS support
- ✅ Type-safe API with Elysia
- ✅ Automatic validation with Elysia's type system
- ✅ Health check endpoint

## Security

- HTTP-only cookies for session tokens
- Service role key for admin operations
- Secure cookie settings in production
- No public user registration (admin-only access)

## Initial Setup

To create your admin user in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add user" → "Create new user"
4. Enter your email and password
5. Confirm the user (make sure email is verified)

Now you can use these credentials to sign in through the API.

## Development

### Adding New Routes

Create a new file in `src/routes/` and import it in `src/index.ts`:

```typescript
// src/routes/example.ts
import { Elysia } from "elysia";

export const exampleRoutes = new Elysia({ prefix: "/example" }).get(
  "/",
  () => ({ message: "Example route" })
);

// src/index.ts
import { exampleRoutes } from "./routes/example";

const app = new Elysia()
  // ...
  .use(exampleRoutes);
// ...
```

## Troubleshooting

### Supabase Connection Issues

- Ensure your `.env` file has the correct credentials
- Check that your Supabase project is active
- Verify network connectivity

### CORS Errors

- Update the `cors` configuration in `src/index.ts` to specify your frontend domain:
  ```typescript
  .use(cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true
  }))
  ```

## License

MIT
