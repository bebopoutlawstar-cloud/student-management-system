# Student Management System

A full-stack CRUD web app for managing student records, built with **vanilla JavaScript, Node.js, Express and MySQL**. No frontend framework: every action is a plain `fetch()` call to a REST API I built.

Styled with a cyberpunk look carried over from my other projects: neon cyan and volt-yellow accents, slanted Persona-style buttons, and a flickering glitch title.

![Screenshot](screenshot.png)

## Features

- View all students in a table
- Add, edit and delete students (delete asks for confirmation)
- Live search by name
- Filter by course
- Validation on **both** the frontend and the backend
- Clear error messages and correct HTTP status codes
- Responsive layout that works on phones

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (`fetch`) |
| Backend | Node.js, Express |
| Database | MySQL with `mysql2` (connection pool, parameterized queries) |
| Config | `dotenv` (secrets stay out of the code) |

## How It Works

```
Browser (script.js)
   │   fetch("/api/students", { method: "POST", body: JSON })
   ▼
Express route (app.js)            validates the request, picks a status code
   ▼
Service layer (studentService.js) all SQL lives here
   ▼
mysql2 pool (db.js)  →  MySQL (school_db.students)
   ▼
JSON response  →  the table re-renders
```

| CRUD | HTTP Method | SQL |
|---|---|---|
| Create | POST | INSERT |
| Read | GET | SELECT |
| Update | PUT | UPDATE |
| Delete | DELETE | DELETE |

## API Endpoints

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/api/students` | Get all students | 200 |
| GET | `/api/students/:id` | Get one student (404 if not found) | 200 |
| POST | `/api/students` | Create a student | 201 |
| PUT | `/api/students/:id` | Update a student (404 if not found) | 200 |
| DELETE | `/api/students/:id` | Delete a student (404 if not found) | 200 |
| GET | `/api/students/search?name=jo` | Search by name | 200 |
| GET | `/api/students/filter?course=React` | Filter by course | 200 |

Bad input returns **400** with a message (for example `Email is not valid` or `A student with that email already exists`). Database errors return **500** with a generic message, and the real error is logged on the server only.

## Project Structure

```
student-management-system/
├── backend/
│   ├── app.js              Express server and API routes
│   ├── db.js               MySQL connection pool
│   ├── studentService.js   All database queries
│   └── package.json
├── database/
│   └── schema.sql          Creates the database, table and sample data
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Run It Locally

**You need:** [Node.js](https://nodejs.org) and [MySQL](https://dev.mysql.com/downloads/mysql/).

1. **Clone the repo**
```bash
   git clone https://github.com/bebopoutlawstar-cloud/student-management-system.git
   cd student-management-system
```

2. **Create the database** (with sample students)
```bash
   mysql -u root -p < database/schema.sql
```
   On Windows PowerShell, use: `Get-Content database\schema.sql | mysql -u root -p`

3. **Install the backend packages**
```bash
   cd backend
   npm install
```

4. **Create `backend/.env`** with your own MySQL password:
```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=school_db
   PORT=3000
```

5. **Start the server**
```bash
   npm start
```

6. Open **http://localhost:3000**

> GitHub Pages can't run Node or MySQL, so this app only runs locally for now.

## What I Learned

- **REST API design:** matching each action to the right HTTP method and status code (200, 201, 400, 404, 500)
- **SQL injection protection:** using `?` placeholders so user input is always sent as data, never run as a SQL command
- **Connection pooling:** reusing database connections instead of opening a new one for every request
- **Separation of concerns:** routes handle HTTP, the service layer handles data
- **Never trusting the frontend:** validating again on the server, since anyone can call the API directly
- **Keeping secrets safe:** the database password lives in `.env`, which `.gitignore` keeps off GitHub
- **Debugging:** reading the backend terminal to find the real error behind a "Server error" response

## Author

**Cole Eggly**: [GitHub](https://github.com/bebopoutlawstar-cloud)