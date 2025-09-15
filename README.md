# AuthKit – Node.js + PostgreSQL

A polished, resume-ready starter implementing secure **user registration, login, logout, and session management** using **Node.js, Express, PostgreSQL (Neon), bcryptjs, client-sessions, and EJS**.

## Features
- ✅ Register / Login / Logout
- 🔒 Password hashing with **bcryptjs**
- 🗄️ PostgreSQL schema: `users`, `login_history` (keeps last 8 logins per user)
- 🧠 Session protection middleware (`ensureLogin`) for protected routes
- 🧩 EJS views + clean CSS + adaptive navbar
- 🔧 `.env` config for DB + session secret

## Getting Started
1. Copy `.env.example` to `.env` and set your PostgreSQL credentials:
```
DB_USER="SenecaDB_owner"
DB_DATABASE="SenecaDB"
DB_PASSWORD="YOUR_PASSWORD"
DB_HOST="ep-dawn-meadow-a58ojnqw-pooler.us-east-2.aws.neon.tech"
DB_PORT=5432
SESSION_SECRET="a_long_random_string"
PORT=8080
```
2. Install & run:
```
npm install
npm start
```
Open http://localhost:8080

## Project Structure
```
modules/
  auth-service-pg.js   # DB init, registerUser, checkUser
public/
  css/styles.css       # minimal styling
views/
  partials/navbar.ejs
  layout.ejs
  login.ejs
  register.ejs
  userHistory.ejs
  site.ejs             # placeholder for your A5 Sites pages
server.js              # express app, routes, sessions, guards
```

## Resume Bullet Example
- Built a secure web application with **user registration, login/logout, and session management** using Node.js and PostgreSQL.
- Implemented **bcryptjs password hashing** and session-based access control via **client-sessions**.
- Designed relational schema for **users** and **login history** and enforced data retention (last 8 logins).

---

© 2025-09-15
