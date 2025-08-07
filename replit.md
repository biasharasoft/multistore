# Retail Management System

## Overview
A comprehensive retail management system with Point of Sale (POS), inventory management, customer management, analytics, and multi-store support. Successfully migrated from Lovable to Replit environment.

## Project Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: React Router DOM for client-side navigation
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage for now)
- **State Management**: TanStack Query for server state
- **UI Framework**: Radix UI primitives with custom theming
- **Charts**: Recharts for analytics and data visualization

## Features
- Dashboard with business metrics and analytics
- Point of Sale (POS) system
- Product and inventory management
- Customer relationship management
- Multi-store support with individual store analytics
- Expense tracking and purchase orders
- Sales analytics and reporting
- Settings and team management

## Migration Notes (Aug 7, 2025)
✅ **Successfully migrated from Lovable to Replit**
- Fixed missing dependencies: `react-router-dom`, `sonner`
- Application now runs cleanly on port 5000
- Client/server separation maintained for security
- All components and pages preserved from original project

## Recent Changes
- **2025-08-07**: Completed migration from Lovable to Replit
  - Installed missing dependencies
  - Verified application functionality
  - Maintained existing React Router DOM navigation structure
  - Preserved all UI components and business logic

## User Preferences
- None specified yet

## Technical Notes
- Application serves on port 5000 (both frontend and backend)
- Uses Vite for development with HMR
- Express server handles API routes and static file serving
- Modern TypeScript and React patterns throughout