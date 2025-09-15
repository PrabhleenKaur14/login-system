# AuthKit – Node.js + PostgreSQL

This is a user registration, login, logout, and session management using Node.js, Express, PostgreSQL (Neon), bcryptjs, client-sessions, and EJS.

## Features
 Register / Login / Logout
 Password hashing with **bcryptjs**
- PostgreSQL schema: `users`, `login_history` (keeps last 8 logins per user)
- Session protection middleware (`ensureLogin`) for protected routes
- EJS views + clean CSS + adaptive navbar
- `.env` config for DB + session secret




