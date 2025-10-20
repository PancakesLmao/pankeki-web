# Elysia + Supabase + Prisma Backend

A backend API built with [Elysia](https://elysiajs.com/), [Supabase](https://supabase.com/) (for authentication), and [Prisma](https://www.prisma.io/) (for database operations).

## Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project (create one at [supabase.com](https://supabase.com))

## Architecture

- **Supabase**: Authentication only (sign in, token management, user sessions)
- **Prisma ORM**: Database operations with type safety
- **Elysia**: Fast and modern web framework
- **PostgreSQL**: Supabase-hosted database

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create/update the `.env` file with your Supabase and database credentials:

```env
# Supabase Auth (for authentication only)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Database (for Prisma)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Server
PORT=3000
NODE_ENV=development
```

To get your credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. **For Supabase Auth:**
   - Go to Settings → API
   - Copy Project URL → `SUPABASE_URL`
   - Copy `service_role` `secret` key → `SUPABASE_KEY`
4. **For Database URLs:**
   - Go to Settings → Database → Connection String
   - Copy the connection pooler URL (port 6543) → `DATABASE_URL`
   - Copy the direct connection URL (port 5432) → `DIRECT_URL`

### 3. Generate Prisma Client

After pulling the schema from Supabase:

```bash
bun run prisma:generate
```

### 4. Run the Server

Development mode:

```bash
bun run dev
```

The server will start at `http://localhost:3000`

## Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Pull schema from database (if schema changes in Supabase)
npx prisma db pull
# use --force to overwrite local schema if needed

# Push schema to database (only for public schema changes)
npx prisma db push
```

**⚠️ Important:** Never modify tables in the `auth` schema via Prisma. These are managed by Supabase.

**⚠️ Important:** Never modify tables in the `auth` schema via Prisma. These are managed by Supabase.

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
