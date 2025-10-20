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

Get all projects (public access). Can be filtered by status.

**Query Parameters:**

- `status` (optional, enum) - Filter projects by status. Possible values:
  - `Completed_and_Published`
  - `Ongoing`
  - `Deprecated`
  - `Completed_and_Documenting`
  - `Upcoming`
  - `Under_Maintenance`

**Response:**

```json
{
  "projects": [
    {
      "id": "1",
      "created_at": "2024-01-01T00:00:00Z",
      "created_by": "user_uuid",
      "title": "Weather Platform",
      "description": "Centralized IoT platform that build specifically for weather stations",
      "tags": ["Nextjs", "Typescript", "Tailwind"],
      "link": "https://github.com/username/project",
      "project_img": "https://example.com/image.jpg",
      "status": "Ongoing"
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
    "id": "1",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Weather Platform",
    "description": "Centralized IoT platform that build specifically for weather stations",
    "tags": ["Nextjs", "Typescript", "Tailwind"],
    "link": "https://github.com/username/project",
    "project_img": "https://example.com/image.jpg",
    "status": "Ongoing"
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

Create a new project (admin only). The `created_by` field is automatically set from the authenticated user.

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Request Body:**

```json
{
  "title": "Weather Platform",
  "description": "Centralized IoT platform that build specifically for weather stations",
  "tags": ["Nextjs", "Typescript", "Tailwind"],
  "link": "https://github.com/username/project",
  "project_img": "https://example.com/image.jpg",
  "status": "Ongoing"
}
```

**Request Body Schema:**

- `title` (required, string) - Project title
- `description` (optional, string) - Project description
- `tags` (required, array of strings) - Technology tags
- `link` (optional, string) - Project link (GitHub, live demo, etc.)
- `project_img` (optional, string) - Project image URL
- `status` (required, enum) - Project status. Possible values:
  - `Completed_and_Published`
  - `Ongoing`
  - `Deprecated`
  - `Completed_and_Documenting`
  - `Upcoming`
  - `Under_Maintenance`

**Response (Success):**

```json
{
  "message": "Project created successfully",
  "project": {
    "id": "2",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Weather Platform",
    "description": "Centralized IoT platform that build specifically for weather stations",
    "tags": ["Nextjs", "Typescript", "Tailwind"],
    "link": "https://github.com/username/project",
    "project_img": "https://example.com/image.jpg",
    "status": "Ongoing"
  }
}
```

### PUT /projects/:id

Update an existing project (admin only). All fields are optional.

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Parameters:**

- `id` (number) - Project ID

**Request Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["Vue", "TypeScript"],
  "link": "https://github.com/username/updated-project",
  "project_img": "https://example.com/new-image.jpg",
  "status": "Completed_and_Published"
}
```

**Response (Success):**

```json
{
  "message": "Project updated successfully",
  "project": {
    "id": "1",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["Vue", "TypeScript"],
    "link": "https://github.com/username/updated-project",
    "project_img": "https://example.com/new-image.jpg",
    "status": "Completed_and_Published"
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
  id: string; // BigInt serialized as string
  created_at: Date;
  created_by: string; // UUID
  title: string;
  description: string | null;
  tags: string[]; // Array of technology tags
  link: string | null;
  project_img: string | null;
  status: project_status; // Enum: "Completed_and_Published" | "Ongoing" | "Deprecated" | "Completed_and_Documenting" | "Upcoming" | "Under_Maintenance"
}
```

### Project Status Enum

The `project_status` enum represents the current state of a project:

- `Completed_and_Published` - Project is finished and publicly available
- `Ongoing` - Project is currently in active development
- `Deprecated` - Project is no longer maintained
- `Completed_and_Documenting` - Project is complete but documentation is in progress
- `Upcoming` - Project is planned but not yet started
- `Under_Maintenance` - Project is receiving updates or bug fixes

**Note:** When using the API, use the underscore format (e.g., `Completed_and_Published`), not spaces.

### User

```typescript
interface User {
  id: string; // UUID
  email: string;
  created_at: string;
}
```

---

## Interactive API Documentation

When running in development mode (`NODE_ENV !== "production"`), interactive API documentation is automatically available at:

```
http://localhost:3000/swagger
```

This provides an interactive Swagger UI where you can:

- View all available endpoints with detailed schemas
- Test API calls directly from the browser
- See real-time request/response examples
- Explore authentication requirements
- Try out different request parameters and bodies
