# Portfolio API Documentation

## Overview

This API provides endpoints for managing a portfolio website with project management and admin authentication.

## Base URL

```
http://localhost:3000
```

## Authentication

This API uses cookie-based authentication. Admin users can sign in to access protected endpoints.

### Authentication Flow

1. Sign in with admin credentials
2. Receive HTTP-only cookies with access and refresh tokens
3. Include cookies in subsequent requests
4. Use refresh endpoint to maintain session

---

## API Endpoints

### Health Check

#### GET /health

Returns server health status.

**Response:**

```json
{
  "status": "ok"
}
```

---

## Authentication Endpoints

### POST /auth/signin

Sign in with email and password.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response (Success):**

```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

**Response (Error):**

```json
{
  "error": "Invalid login credentials"
}
```

### POST /auth/signout

Sign out and clear session cookies.

**Response:**

```json
{
  "message": "Signed out successfully"
}
```

### GET /auth/me

Get current authenticated user information.

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Response (Success):**

```json
{
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Response (Error - Not authenticated):**

```json
{
  "error": "Not authenticated"
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Headers:**

```
Cookie: refresh_token=your_refresh_token
```

**Response (Success):**

```json
{
  "message": "Token refreshed successfully",
  "session": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 3600
  }
}
```

---

## Project Endpoints

### GET /projects

Get all projects (public access).

**Response:**

```json
{
  "projects": [
    {
      "id": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "user_id",
      "project_img": "https://example.com/image.jpg",
      "tag": "web-development",
      "status": "completed"
    }
  ]
}
```

### GET /projects/:id

Get a specific project by ID (public access).

**Parameters:**

- `id` (number) - Project ID

**Response:**

```json
{
  "project": {
    "id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "user_id": "user_id",
    "project_img": "https://example.com/image.jpg",
    "tag": "web-development",
    "status": "completed"
  }
}
```

**Response (Error - Not found):**

```json
{
  "error": "Project not found"
}
```

### POST /projects

Create a new project (admin only).

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Request Body:**

```json
{
  "user_id": "user_id",
  "project_img": "https://example.com/image.jpg",
  "tag": "web-development",
  "status": "in-progress"
}
```

**Response (Success):**

```json
{
  "message": "Project created successfully",
  "project": {
    "id": 2,
    "created_at": "2024-01-01T00:00:00Z",
    "user_id": "user_id",
    "project_img": "https://example.com/image.jpg",
    "tag": "web-development",
    "status": "in-progress"
  }
}
```

### PUT /projects/:id

Update an existing project (admin only).

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Parameters:**

- `id` (number) - Project ID

**Request Body (partial update):**

```json
{
  "status": "completed",
  "tag": "full-stack"
}
```

**Response (Success):**

```json
{
  "message": "Project updated successfully",
  "project": {
    "id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "user_id": "user_id",
    "project_img": "https://example.com/image.jpg",
    "tag": "full-stack",
    "status": "completed"
  }
}
```

### DELETE /projects/:id

Delete a project (admin only).

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Parameters:**

- `id` (number) - Project ID

**Response (Success):**

```json
{
  "message": "Project deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized

```json
{
  "error": "Not authenticated"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Data Types

### Project

```typescript
interface Project {
  id: number;
  created_at: string;
  user_id: string;
  project_img: string;
  tag: string;
  status: string;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
}
```

---

## Development

### API Documentation

When running in development mode (`NODE_ENV !== "production"`), API documentation is automatically available at:

```
http://localhost:3000/swagger
```

This provides an interactive Swagger UI for testing all endpoints.

### Environment Variables

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
```

---

## Security Notes

- All admin endpoints require valid authentication cookies
- Cookies are HTTP-only and secure in production
- CORS is configured to allow credentials
- Service role key provides admin access to Supabase
- No public user registration (admin-only system)
