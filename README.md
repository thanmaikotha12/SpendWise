# SpendWise — Smart Expense & Finance Management System

A major-project-ready personal finance web application built with React, Node.js, Express and MongoDB Atlas.

## What is functional
- JWT + bcrypt authentication
- User-specific transactions
- Income and expense recording
- Dashboard totals and recent activity
- Category spending analysis
- Monthly budgets with threshold notifications
- Financial goals with progress
- Recurring expenses and due-item processing
- Analytics charts
- In-app notifications
- Data-aware Financial Assistant using the user's actual transaction data
- Responsive premium 3D money-flow authentication experience

## Run locally
### Backend
```bash
cd backend
npm install
cp .env.example .env
# Put your MongoDB Atlas URI and JWT secret in .env
npm run dev
```
Backend: http://localhost:5000

### Frontend
Open a second terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend: http://localhost:5173

## MongoDB Atlas
Create a database named `spendwise` (MongoDB will create collections automatically). Your Atlas network access must allow the machine running the backend to connect.

## Important
The Financial Assistant intentionally uses real application data with deterministic backend logic instead of pretending to be an AI model. A real LLM can be added later without changing the core architecture.
