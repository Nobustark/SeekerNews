# News Website - System Architecture

## Overview

This is a full-stack news website built with React frontend and Express backend. The system allows admins to create, edit, and manage news articles through a dashboard interface, while providing a clean public-facing article display for visitors. The architecture follows a client-server pattern with a shared schema layer for type safety.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage for article images
- **Session Management**: Express sessions with PostgreSQL storage
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type validation
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Shared TypeScript types between frontend and backend

## Key Components

### Database Schema
```typescript
// Articles table with fields:
- id: Primary key (serial)
- title: Article title (required)
- slug: URL-friendly identifier (unique)
- content: Full article content
- excerpt: Short description
- imageUrl: Optional image URL
- author: Author name (defaults to "Admin")
- published: Publication status (boolean)
- createdAt/updatedAt: Timestamps
```

### API Endpoints
- `GET /api/articles` - Public endpoint for published articles
- `GET /api/articles/:slug` - Single article by slug
- `GET /api/admin/articles` - Admin endpoint for all articles
- `POST /api/admin/articles` - Create new article
- `PUT /api/admin/articles/:id` - Update existing article
- `DELETE /api/admin/articles/:id` - Delete article

### Authentication Flow
1. Admin login through Firebase Authentication
2. Session management via Firebase Auth state
3. Protected routes redirect to login if unauthenticated
4. Admin dashboard accessible only to authenticated users

### Storage Strategy
- **Database**: PostgreSQL database with Drizzle ORM (fully integrated)
- **Articles**: Stored in PostgreSQL with full CRUD operations
- **Images**: Firebase Storage for article images
- **Sessions**: PostgreSQL-backed session storage

## Data Flow

### Public Article Display
1. Homepage fetches published articles via `/api/articles`
2. Articles displayed in responsive card layout
3. Individual articles accessible via slug-based URLs
4. SEO-friendly article pages with meta tags

### Admin Article Management
1. Admin authenticates through Firebase
2. Dashboard displays all articles (published and unpublished)
3. Create/Edit forms with image upload capability
4. Real-time updates using TanStack Query mutations
5. Optimistic UI updates for better user experience

### Image Handling
1. Admin uploads images through Firebase Storage
2. Image URLs stored in article records
3. Fallback to placeholder images for articles without images
4. Responsive image display with proper aspect ratios

## External Dependencies

### Firebase Services
- **Authentication**: Email/password login for admins
- **Storage**: Image hosting and management
- **Configuration**: Environment variables for API keys

### Database Services
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: DATABASE_URL environment variable

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code formatting and linting
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Setup
1. Install dependencies with `npm install`
2. Configure environment variables for Firebase and database
3. Run database migrations with `npm run db:push`
4. Start development server with `npm run dev`

### Production Build
1. Build client assets with `npm run build`
2. Bundle server code with esbuild
3. Serve static files and API from single Express server
4. Environment-specific configuration handling

### Environment Configuration
- **Development**: Hot reloading, source maps, development Firebase project
- **Production**: Optimized builds, production Firebase project, database connection pooling

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Database integration completed - PostgreSQL database fully configured with Drizzle ORM, replaced memory storage with DatabaseStorage, sample articles migrated to database