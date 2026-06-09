# Employee Directory Search System

A full-stack employee directory search system built for the Restaverse SDE assignment.

**Stack:** React + Vite (Frontend) | FastAPI + SQLAlchemy + MySQL (Backend)

---

## Screenshots

![Dashboard Screenshot](./screenshots/dashboard.png)
*(Please place your screenshot at `screenshots/dashboard.png` or update the path above)*

---

## Deployment

The application is deployed across the following cloud platforms:

- **Frontend:** Deployed on [Vercel](https://restaverse-assignment.vercel.app/)
- **Backend API:** Deployed on [Render](https://restaverse-backend.onrender.com)
- **Database:** MySQL database hosted on [Railway](https://railway.com)

---

## Project Structure

```
Restaverse assignment/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── employee.py        # SQLAlchemy ORM model + DB indexes
│   │   ├── schemas/
│   │   │   └── employee.py        # Pydantic request/response schemas
│   │   ├── repositories/
│   │   │   └── employee.py        # Raw database query layer
│   │   ├── services/
│   │   │   └── employee.py        # Business logic layer
│   │   ├── routers/
│   │   │   └── employee.py        # FastAPI route handlers
│   │   ├── config.py              # Settings loaded from .env
│   │   ├── database.py            # DB engine + connection pool + session
│   │   └── main.py                # FastAPI app entry point
│   ├── tests/
│   │   └── test_api.py            # Integration tests (pytest + SQLite)
│   ├── seed.py                    # Seeds DB with 50+ realistic employees
│   ├── run.py                     # Convenience server starter
│   ├── requirements.txt
│   └── .env.example               # Template — copy to .env and fill in credentials
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EmployeeCard.jsx    # Individual employee card (collapsible)
    │   │   ├── EmployeeList.jsx    # Grid renderer with all UI states
    │   │   ├── EmployeeTable.jsx   # Table view renderer
    │   │   ├── ProfileDrawer.jsx   # Full profile dialog/modal
    │   │   ├── AddEmployeeModal.jsx# Add employee form modal
    │   │   └── ui/                 # Reusable shadcn/ui base components
    │   ├── hooks/
    │   │   └── useEmployeeSearch.js # Debounced fetch hook with AbortController
    │   ├── lib/
    │   │   └── utils.js            # Shared utility functions
    │   ├── App.jsx                 # Root layout, search bar, state management
    │   ├── main.jsx
    │   └── index.css               # Design system (CSS variables, animations)
    ├── .env.example                # VITE_API_BASE_URL template
    └── vite.config.js
```

---

## Database Setup (MySQL)

**Why MySQL?**
MySQL was chosen because it supports B-tree indexes natively, which makes `LIKE 'prefix%'` queries on the `name` and `department` columns extremely fast even as the employee table grows to millions of rows. It is also the most widely deployed relational database in production web applications, making it a safe and scalable choice.

### Steps

1. Install and start **MySQL Community Server**.
2. Open the MySQL shell and create the database:
   ```sql
   CREATE DATABASE employee_db;
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp backend/.env.example backend/.env
   ```
   ```env
   DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/employee_db
   ```

---

## Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with 50+ employees
python seed.py

# Start the FastAPI server (http://127.0.0.1:8000)
python run.py
```

Interactive API docs are available at: **http://127.0.0.1:8000/docs**

---

## Frontend Setup

```bash
cd frontend

# Install Node dependencies (first time only)
npm install

# Copy env template and set the backend URL
cp .env.example .env

# Start the Vite dev server (http://localhost:5173)
npm run dev
```

> The `VITE_API_BASE_URL` variable in `frontend/.env` must point to where the backend is running. Default is `http://127.0.0.1:8000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLAlchemy DB connection string | `mysql+pymysql://root:password@localhost:3306/employee_db` |
| `HOST` | Server bind host | `127.0.0.1` |
| `PORT` | Server bind port | `8000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8000` |

No credentials or secrets are hardcoded anywhere in the codebase.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — confirms the API is online |
| `GET` | `/employees/all` | Fetch all employees (up to 100) |
| `GET` | `/employees?search=<term>` | Search employees by name or department |
| `POST` | `/employees` | Create a new employee record |
| `DELETE` | `/employees/{id}` | Delete an employee by ID |

### GET /employees?search=rahul

```
GET /employees?search=Rahul
```

**Success 200**
```json
[
  {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul.sharma@company.com",
    "department": "Engineering",
    "designation": "Senior Software Engineer",
    "date_of_joining": "2021-03-15"
  }
]
```

**400 Bad Request** — missing or empty `search` param
```json
{ "detail": "Search query cannot be empty or contain only whitespace." }
```

**500 Internal Server Error** — database unreachable
```json
{ "detail": "Database connection failure. Please ensure the database server is running." }
```

### POST /employees

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "department": "Engineering",
  "designation": "Software Engineer",
  "date_of_joining": "2024-06-01"
}
```

**201 Created** — returns the created employee with `id`.  
**400 Bad Request** — email already exists.  
**422 Unprocessable Entity** — invalid field format.

---

## Running Tests

Tests use an **in-memory SQLite database** — they are completely isolated from your MySQL data and require no extra setup.

```bash
cd backend
pytest tests/ -v
```

---

## How Search Performance is Optimized

### Backend

- **Database Indexes:** B-tree indexes (`idx_employee_name`, `idx_employee_department`) are created on the `name` and `department` columns. This means `LIKE 'rahul%'` queries hit an index instead of scanning the full table — performance stays fast even with hundreds of thousands of rows.
- **Prefix Matching:** The search is anchored as `LIKE 'term%'` (prefix, not `%term%`) so the B-tree index is fully utilized. Full-text mid-string matching would bypass the index.
- **Result Capping:** Queries are limited to 100 results to prevent unbounded memory usage regardless of table size.
- **Connection Pooling:** SQLAlchemy is configured with `pool_size=10`, `max_overflow=20`, and `pool_pre_ping=True` — connections are reused rather than opened per request, reducing latency under load.

### Frontend

- **300ms Debounce:** The `useEmployeeSearch` hook waits 300 ms after the user stops typing before firing an API request. Typing "Rahul" (5 characters) produces **1 API call**, not 5.
- **AbortController:** When the user types again before the previous request completes, the old request is cancelled immediately. This prevents stale responses from overwriting newer results (race condition protection).
- **Instant Loading State:** The loading skeleton appears as soon as the user starts typing (before the debounce fires), so the UI never feels frozen.

### Clean Architecture (Backend Task 4)

```
Route Handler  →  Service Layer  →  Repository Layer  →  Database
   (HTTP)         (business logic)    (SQL queries)       (MySQL)
```

Each layer has a single responsibility. Adding new operations (e.g., update, bulk import) only requires changes in the relevant layer — no other layers need to be touched.

---

## Design Decisions

| Decision | Reason |
|----------|--------|
| MySQL over SQLite | Production-grade, supports B-tree indexes, widely deployed |
| Pydantic schemas | Automatic request validation and serialization, clear API contracts |
| Repository pattern | Decouples SQL queries from business logic — easy to swap DB engine |
| Vite + React | Fast HMR, minimal config, industry standard for modern frontends |
| CSS Variables design system | No runtime overhead, full theming control, dark/light mode support |
