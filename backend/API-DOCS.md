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

- `status` (optional, enum) - Filter projects by status (use lowercase with hyphens). Possible values:
  - `completed-and-published`
  - `ongoing`
  - `deprecated`
  - `completed-and-documenting`
  - `upcoming`
  - `under-maintenance`

**Example:** `GET /projects?status=ongoing`

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
      "time_range": "January 2025 - February 2025",
      "status": "ongoing"
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
    "time_range": "January 2025 - February 2025",
    "status": "ongoing"
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
  "time_range": "January 2025 - February 2025",
  "status": "ongoing"
}
```

**Request Body Schema:**

- `title` (required, string) - Project title
- `description` (optional, string) - Project description
- `tags` (required, array of strings) - Technology tags
- `link` (optional, string) - Project link (GitHub, live demo, etc.)
- `project_img` (optional, string) - Project image URL
- `time_range` (optional, string) - Development time range (e.g., "February 2025 - March 2025")
- `status` (required, enum) - Project status (use lowercase with hyphens). Possible values:
  - `completed-and-published`
  - `ongoing`
  - `deprecated`
  - `completed-and-documenting`
  - `upcoming`
  - `under-maintenance`

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
    "time_range": "January 2025 - February 2025",
    "status": "ongoing"
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
  "time_range": "January 2025 - March 2025",
  "status": "completed-and-published"
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
    "time_range": "January 2025 - March 2025",
    "status": "completed-and-published"
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

## Enum Endpoints

### GET /api/enums/project-statuses

Get all available project statuses (public access).

**Response:**

```json
{
  "data": [
    { "value": "completed-and-published", "label": "Completed & Published" },
    { "value": "ongoing", "label": "Ongoing" },
    { "value": "deprecated", "label": "Deprecated" },
    {
      "value": "completed-and-documenting",
      "label": "Completed & Documenting"
    },
    { "value": "upcoming", "label": "Upcoming" },
    { "value": "under-maintenance", "label": "Under Maintenance" }
  ]
}
```

### GET /api/enums/game-genres

Get all available game genres (public access).

**Response:**

```json
{
  "data": [
    { "value": "gacha", "label": "Gacha" },
    { "value": "sci-fi", "label": "Sci-Fi" },
    { "value": "fantasy", "label": "Fantasy" },
    { "value": "hack-and-slash", "label": "Hack and Slash" },
    { "value": "action-rpg", "label": "Action RPG" },
    { "value": "rpg", "label": "RPG" },
    { "value": "jrpg", "label": "JRPG" },
    { "value": "visual-novel", "label": "Visual Novel" },
    { "value": "turn-based", "label": "Turn-based" },
    { "value": "open-world", "label": "Open World" }
  ]
}
```

### GET /api/enums/game-platforms

Get all available game platforms (public access).

**Response:**

```json
{
  "data": [
    { "value": "pc", "label": "PC" },
    { "value": "mobile", "label": "Mobile" },
    { "value": "playstation", "label": "PlayStation" }
  ]
}
```

---

## Game Endpoints

### GET /api/games

Get all games (public access). Can be filtered by genre or platform.

**Query Parameters:**

- `genre` (optional, enum) - Filter games by genre (use lowercase with hyphens). Possible values:
  - `gacha`, `sci-fi`, `fantasy`, `hack-and-slash`, `action-rpg`, `rpg`, `jrpg`, `visual-novel`, `turn-based`, `open-world`
- `platform` (optional, enum) - Filter games by platform (use lowercase). Possible values:
  - `pc`, `mobile`, `playstation`

**Example:** `GET /api/games?genre=rpg&platform=pc`

**Response:**

```json
{
  "games": [
    {
      "id": "1",
      "created_at": "2024-01-01T00:00:00Z",
      "created_by": "user_uuid",
      "title": "Game Title",
      "description": "Game description",
      "tags": ["Unity", "C#", "3D"],
      "genre": ["rpg", "fantasy"],
      "platform": ["pc"],
      "link": "https://example.com/game",
      "cover_img": "https://example.com/cover.jpg",
      "icon_img": "https://example.com/icon.jpg"
    }
  ]
}
```

### GET /api/games/:id

Get a specific game by ID (public access).

**Parameters:**

- `id` (number) - Game ID

**Response:**

```json
{
  "game": {
    "id": "1",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Game Title",
    "description": "Game description",
    "tags": ["Unity", "C#", "3D"],
    "genre": ["rpg", "fantasy"],
    "platform": ["pc"],
    "link": "https://example.com/game",
    "cover_img": "https://example.com/cover.jpg",
    "icon_img": "https://example.com/icon.jpg"
  }
}
```

**Response (Error - Not found):**

```json
{
  "error": "Game not found"
}
```

### POST /api/games

Create a new game (admin only). The `created_by` field is automatically set from the authenticated user.

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Request Body:**

```json
{
  "title": "Game Title",
  "description": "Game description",
  "tags": ["Unity", "C#", "3D"],
  "genre": ["rpg", "fantasy"],
  "platform": ["pc"],
  "link": "https://example.com/game",
  "cover_img": "https://example.com/cover.jpg",
  "icon_img": "https://example.com/icon.jpg"
}
```

**Request Body Schema:**

- `title` (required, string) - Game title
- `description` (optional, string) - Game description
- `tags` (required, array of strings) - Technology tags
- `genre` (required, array of enums) - Game genres. Possible values: `gacha`, `sci-fi`, `fantasy`, `hack-and-slash`, `action-rpg`, `rpg`, `jrpg`, `visual-novel`, `turn-based`, `open-world`
- `platform` (required, array of enums) - Target platforms. Possible values: `pc`, `mobile`, `playstation`
- `link` (optional, string) - Game link (itch.io, Steam, etc.)
- `cover_img` (optional, string) - Cover image URL
- `icon_img` (optional, string) - Icon image URL

**Response (Success):**

```json
{
  "message": "Game created successfully",
  "game": {
    "id": "2",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Game Title",
    "description": "Game description",
    "tags": ["Unity", "C#", "3D"],
    "genre": ["rpg", "fantasy"],
    "platform": ["pc"],
    "link": "https://example.com/game",
    "cover_img": "https://example.com/cover.jpg",
    "icon_img": "https://example.com/icon.jpg"
  }
}
```

### PUT /api/games/:id

Update an existing game (admin only). All fields are optional.

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Parameters:**

- `id` (number) - Game ID

**Request Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["Updated", "Tags"],
  "genre": ["action-rpg"],
  "platform": ["pc", "mobile"],
  "link": "https://example.com/updated-game",
  "cover_img": "https://example.com/new-cover.jpg",
  "icon_img": "https://example.com/new-icon.jpg"
}
```

**Response (Success):**

```json
{
  "message": "Game updated successfully",
  "game": {
    "id": "1",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "user_uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["Updated", "Tags"],
    "genre": ["action-rpg"],
    "platform": ["pc", "mobile"],
    "link": "https://example.com/updated-game",
    "cover_img": "https://example.com/new-cover.jpg",
    "icon_img": "https://example.com/new-icon.jpg"
  }
}
```

### DELETE /api/games/:id

Delete a game (admin only).

**Headers:**

```
Cookie: access_token=your_jwt_token
```

**Parameters:**

- `id` (number) - Game ID

**Response (Success):**

```json
{
  "message": "Game deleted successfully"
}
```

---

## Debug Endpoints

### GET /debug/tables

List all tables in the database (public access). Useful for debugging database schema.

**Response:**

```json
{
  "tables": [
    "projects",
    "games",
    "users",
    ...
  ]
}
```

**Response (Error):**

```json
{
  "error": "error_code"
}
```

---

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
  time_range: string | null; // Development time range (e.g., "February 2025 - March 2025")
  status: project_status; // Enum: "completed-and-published" | "ongoing" | "deprecated" | "completed-and-documenting" | "upcoming" | "under-maintenance"
}
```

### Project Status Enum

The `project_status` enum represents the current state of a project (use lowercase with hyphens in API requests):

- `completed-and-published` - Project is finished and publicly available
- `ongoing` - Project is currently in active development
- `deprecated` - Project is no longer maintained
- `completed-and-documenting` - Project is complete but documentation is in progress
- `upcoming` - Project is planned but not yet started
- `under-maintenance` - Project is being maintained or updated

### Game

```typescript
interface Game {
  id: string; // BigInt serialized as string
  created_at: Date;
  created_by: string; // UUID
  title: string;
  description: string | null;
  tags: string[]; // Array of technology tags
  genre: game_genre[]; // Array of genres
  platform: game_platform[]; // Array of platforms
  link: string | null;
  cover_img: string | null;
  icon_img: string | null;
}
```

### Game Genre Enum

- `gacha` - Gacha/Loot box mechanic games
- `sci-fi` - Science fiction themed
- `fantasy` - Fantasy themed
- `hack-and-slash` - Hack and slash action
- `action-rpg` - Action RPG hybrid
- `rpg` - Traditional RPG
- `jrpg` - Japanese RPG
- `visual-novel` - Visual novel/story-driven
- `turn-based` - Turn-based combat
- `open-world` - Open world exploration

### Game Platform Enum

- `pc` - Personal Computer (Windows/Mac/Linux)
- `mobile` - Mobile platforms (iOS/Android)
- `playstation` - PlayStation console

### Project Status Enum

The `project_status` enum represents the current state of a project (use lowercase with hyphens in API requests):

- `completed-and-published` - Project is finished and publicly available
- `ongoing` - Project is currently in active development
- `deprecated` - Project is no longer maintained
- `completed-and-documenting` - Project is complete but documentation is in progress
- `upcoming` - Project is planned but not yet started
- `under-maintenance` - Project is being maintained or updated

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
