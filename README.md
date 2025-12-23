# Neon PostgreSQL CRUD Project

A full-stack CRUD application built with Next.js and Neon PostgreSQL.

## Overview
This project demonstrates a production-grade CRUD application allowing users to view, create, update, and delete records in a PostgreSQL database managed by Neon. The application uses Next.js App Router for both the frontend UI and the backend API routes.

## Architecture
- **Frontend**: Next.js (React) using Tailwind CSS (minimal/no-framework approach was requested but simplified inline styles used).
- **Backend**: Next.js API Routes (Serverless) handling REST requests.
- **Database**: Neon Serverless PostgreSQL.
- **Hosting**: Designed for Vercel deployment.

### Why Neon PostgreSQL?
Neon was chosen for its serverless architecture, which scales to zero when not in use (perfect for cost-efficiency) and provides instant branching for development workflows. It offers a generous free tier suitable for this project.

## API Endpoints
- `GET /api/tables`: List all public tables.
- `GET /api/table/[name]`: Fetch rows for a table.
- `POST /api/table/[name]`: Insert a new row. (JSON body required)
- `PUT /api/table/[name]/[id]`: Update a row. (JSON body required)
- `DELETE /api/table/[name]/[id]`: Delete a row.
- `GET /api/table/[name]/schema`: Fetch table schema metadata.

## Setup and Deployment

### 1. Prerequisites
- Node.js (v18+)
- Neon Account

### 2. Database Setup
1. Create a project in Neon Console.
2. Run the SQL commands in `crud_database.sql` via the Neon SQL Editor to create initial tables.
3. Get the Connection String from Neon Dashboard.

### 3. Local Installation
```bash
git clone <repo-url>
cd permissions
npm install
```
4. Create `.env.local` file:
```env
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
```
5. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Vercel Deployment
1. Push to GitHub.
2. Import project in Vercel.
3. Add `DATABASE_URL` in Vercel Environment Variables.
4. Deploy!

## Live Demo
[Insert Vercel URL Here]
