# Retail Management System

## Overview
A comprehensive retail management system with Point of Sale (POS), inventory management, customer management, analytics, and multi-store support. Features complete authentication system with OTP verification and modern cover page designs.

## Project Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: React Router DOM for client-side navigation
- **Database**: PostgreSQL with Drizzle ORM (fully configured and in use)
- **Authentication**: JWT-based with bcrypt password hashing and OTP verification
- **State Management**: TanStack Query for server state
- **UI Framework**: Radix UI primitives with custom theming
- **Charts**: Recharts for analytics and data visualization
- **Email Service**: Nodemailer for OTP delivery

## Features
- **Authentication System**:
  - Login with email and password
  - Registration with OTP email verification
  - Password reset with OTP verification
  - JWT-based session management
  - Protected routes and public routes
  - User profile management
- **Business Management**:
  - Dashboard with business metrics and analytics
  - Point of Sale (POS) system
  - Product and inventory management
  - Customer relationship management
  - Multi-store support with individual store analytics
  - Expense tracking and purchase orders
  - Sales analytics and reporting
  - Settings and team management

## Authentication Implementation (Aug 7, 2025)
✅ **Complete authentication system implemented**
- Database schema with users, OTP verification, and password reset tables
- Backend authentication service with bcrypt and JWT
- Email service for OTP delivery (development mode logs to console)
- Authentication middleware for protected routes
- Cover page designs for Login, Register, and Reset Password
- Protected route wrappers for React Router
- User context and authentication hooks
- Header component with user dropdown and logout functionality

## Migration Notes (Aug 7, 2025)
✅ **Successfully migrated from Lovable to Replit**
- Fixed missing dependencies: `react-router-dom`, `sonner`
- Application now runs cleanly on port 5000
- Client/server separation maintained for security
- All components and pages preserved from original project

## Recent Changes
- **2025-08-07**: Implemented store management with database persistence
  - Enhanced stores database schema with detailed fields (manager, address, contact info, hours)
  - Created backend API endpoints for store CRUD operations with user ownership validation
  - Implemented frontend store registration form with proper validation and form handling
  - Added authentication integration ensuring stores belong to authenticated users
  - Store registration form saves data to database when "Add Store" button is pressed
  - Integrated real-time data fetching and cache invalidation using React Query
- **2025-08-07**: Implemented complete authentication system
  - Created database schema for users, OTP verification, and password reset
  - Built authentication service with JWT tokens and bcrypt password hashing
  - Implemented OTP verification system for registration and password reset
  - Created cover page designs for all authentication pages
  - Added protected route wrappers and authentication context
  - Updated header with user profile and logout functionality
  - Set up email service for OTP delivery (console logging in development)
- **2025-08-07**: Completed migration from Lovable to Replit
  - Installed missing dependencies
  - Verified application functionality
  - Maintained existing React Router DOM navigation structure
  - Preserved all UI components and business logic

## User Preferences
- Complete authentication system with OTP verification
- Cover page designs for authentication pages
- PostgreSQL database for data persistence

## Technical Notes
- Application serves on port 5000 (both frontend and backend)
- Uses Vite for development with HMR
- Express server handles API routes and static file serving
- PostgreSQL database with Drizzle ORM for all data operations
- JWT tokens for authentication with 7-day expiration
- OTP codes expire in 10 minutes for security
- Password reset tokens expire in 30 minutes
- Modern TypeScript and React patterns throughout
- Email service configured for OTP delivery (requires email credentials in production)