# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
```bash
# Start both frontend and backend concurrently from root
yarn start

# Or start individually:
# Backend (Strapi CMS)
cd server && yarn d

# Frontend (Next.js)
cd client && yarn dev
```

### Building and Testing
```bash
# Frontend build and lint
cd client && yarn build
cd client && yarn lint

# Backend build
cd server && yarn build

# End-to-End Testing (Cypress)
cd client && npx cypress run
```

### Development Setup
```bash
# Install all dependencies from root
yarn update
```

## Architecture Overview

This is a monorepo e-commerce application for comic books ("Quadrinhos Rei") with:

### Backend (server/)
- **Framework**: Strapi 5.10.0 CMS with PostgreSQL
- **Main API Entities**: 
  - Products (comics with detailed metadata: author, publisher, year, ISBN, stock, pricing)
  - Clients (users with addresses, cards, cart, purchase history)
  - Purchases (orders with cart items, status tracking)
  - Cart (shopping cart with product relations)
  - Trade (customer trade-in system)
  - Operation (business operations and services)
- **Custom Services**: Located in `src/api/operation/services/` for business logic (cart, purchase, dashboard, user management)

### Frontend (client/)
- **Framework**: Next.js 14 with TypeScript and styled-components
- **Key Technologies**:
  - React Query (@tanstack/react-query) for server state
  - styled-components for styling with theme system
  - react-hook-form with Yup validation
  - Cypress for E2E testing
- **Authentication**: JWT-based with refresh token handling in `services/api.ts`
- **State Management**: React Query + local state, AuthProvider context

### Application Structure
- **Pages**: App router structure with business modules (estoque, clientes, vendas, trocas, carrinho)
- **Components**: Organized by type (Forms, Tables, Modals, Inputs, Buttons) with consistent styling patterns
- **Services**: API layer with centralized error handling and auth interceptors
- **Validation**: Schema-based validation using Yup for forms

## Key Patterns

### API Integration
- Base API URL configured via `NEXT_PUBLIC_API_URL` environment variable
- Automatic token refresh and error handling in axios interceptors
- Strapi v5 with documentId-based entity references

### Styling System
- Centralized theme in `src/styles/theme.ts` with comprehensive color palette
- Consistent component styling patterns using styled-components
- Responsive design with mobile-first approach

### Form Handling
- Standardized form components with react-hook-form and Yup validation
- Consistent error handling and toast notifications
- Reusable input components with theme integration

### E-commerce Features
- Shopping cart with product quantity management
- Multi-step checkout process (cart → payment → confirmation)
- Customer management with addresses and payment methods
- Inventory management with stock tracking
- Trade-in system for customer exchanges

## Environment Setup

### Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXT_PUBLIC_CHAT_ENABLED=true

# Backend (.env)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
JWT_SECRET=your-jwt-secret

# Chat AI Configuration (Google Gemini)
GEMINI_API_KEY=your_free_gemini_api_key_here
CHAT_ENABLED=true
```

### Development Database
The backend uses PostgreSQL. Ensure database is running and configured before starting the server.

### Chat IA Setup (Google Gemini)

The application includes an AI-powered chat system that helps customers with questions about products, orders, and store operations.

#### Getting a Free Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the generated API key
5. Add it to your server `.env` file: `GEMINI_API_KEY=your_api_key_here`

#### Features:
- **Free Usage**: 15 requests per minute, completely free
- **Contextual Responses**: AI knows about your products, orders, and store policies
- **Scope Filtering**: Only responds to questions related to the comic book store
- **Conversation History**: Stores chat conversations in the database
- **Rate Limiting**: Prevents API abuse with 15 messages/minute limit per user
- **Error Handling**: Graceful error handling with retry mechanisms

#### Database Schema:
- `chat-conversation`: Stores user conversations
- `chat-message`: Individual messages within conversations
- Relationships: `client -> conversations -> messages`

The AI assistant is designed to help customers with:
- Product information and availability
- Order status and tracking
- Trade-in system questions
- Store policies and procedures
- General comic book recommendations