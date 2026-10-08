# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack CRUD app for student records: vanilla JS frontend (no framework, no build step), Node.js + Express 5 backend, MySQL via `mysql2/promise`. The Express server serves both the REST API and the static frontend, so the app runs at a single origin (http://localhost:3000).

## Commands

All npm commands run from `backend/`:

```bash
npm install
npm start        # node app.js
npm run dev      # node --watch app.js (auto-restart on change)
```

Database setup (drops and recreates `school_db.students` with sample rows — destructive):

```bash
mysql -u root -p < database/schema.sql
# PowerShell: Get-Content database\schema.sql | mysql -u root -p
```

`backend/.env` (gitignored) must define `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=school_db`, `PORT`.

There is no test suite, linter, or build step. Verify changes by running the server and exercising the API (e.g. `curl http://localhost:3000/api/students`) or the UI.

## Architecture

Request flow: `frontend/script.js` (`fetch`) → `backend/app.js` (routes, validation, status codes) → `backend/studentService.js` (all SQL) → `backend/db.js` (pool) → MySQL.

Layering conventions to preserve:
- **`app.js` owns HTTP concerns**: input validation (`validateStudent`, `isValidId`), status codes, and error mapping. Errors are always `{ message }` JSON. MySQL `ER_DUP_ENTRY` (unique email) maps to 400; other DB errors log server-side and return a generic 500 `"Server error"`.
- **`studentService.js` owns SQL** and knows nothing about HTTP. Always use `?` placeholders with `db.execute`. Not-found is signaled by returning `undefined` (get/update) or `false` (delete); the route translates that to 404.
- **Route order matters**: `/api/students/search` and `/api/students/filter` must be registered before `/api/students/:id`.
- Validation is duplicated intentionally: `validateForm` in `script.js` mirrors `validateStudent` in `app.js`. Keep both in sync when changing field rules.

Frontend notes:
- The add/edit form is a single form; the hidden `studentId` input determines whether submit does POST or PUT.
- `refreshList()` re-applies whichever of search or course filter is active; search and filter are mutually exclusive (setting one clears the other).
- Table cells are written with `textContent` (not `innerHTML`) to avoid XSS — keep it that way for user data.
- The course list is hardcoded in two `<select>` elements in `index.html` (form and filter); the DB has no courses table. Adding a course means updating both.
