# Elysia + Supabase Backend

A lightweight backend API built with [Elysia](https://elysiajs.com/) and [Supabase](https://supabase.com/).

## Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project (create one at [supabase.com](https://supabase.com))

## Architecture

- **Supabase Client**: Authentication and direct database operations
- **Elysia**: Fast and modern web framework with TypeScript support
- **PostgreSQL**: Supabase-hosted database with RLS (Row Level Security)

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create/update the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Connection (for direct queries if needed)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Server
PORT=3000
NODE_ENV=development
```

To get your credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`

### 3. Configure RLS Policies

Since we're using the Supabase client directly, you need to set up Row Level Security (RLS) policies in your database:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the RLS policies for your tables (see example policies in the project documentation)
3. Ensure RLS is enabled on all public-facing tables

### 4. Run the Server

Development mode:

```bash
bun run dev
```

The server will start at `http://localhost:3000`

## Running the Backend

### Development Server

Start the development server with hot reload:

```bash
bun run dev
```

The server will start at `http://localhost:3000`

### Build for Production

Build the TypeScript code:

```bash
bun run build
```

### Production Server

Run the production server:

```bash
bun start
```

## API Documentation

### Interactive Documentation (Swagger UI)

When running in development mode (`NODE_ENV !== "production"`), interactive API documentation is automatically available at:

```
http://localhost:3000/swagger
```

This provides a Swagger UI where you can:

- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- Explore authentication requirements

### Static API Documentation

For detailed API documentation including all routes, request/response examples, and error handling, see [`API-DOCS.md`](./API-DOCS.md).

## Initial Setup

To create your admin user in Supabase:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Authentication → Users
3. Click "Add user" → "Create new user"
4. Enter your email and password
5. Confirm the user (make sure email is verified)

Now you can use these credentials to sign in through the API.
