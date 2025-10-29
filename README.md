# 📝 Blog Platform

A modern blogging platform built with **Node.js, Express, MongoDB, and EJS**, featuring secure authentication (JWT + Google OAuth), community engagement, and contact mail functionality.

---

## 🚀 Features

- 🔐 **Authentication System**
  - Email/Password Signup & Login (JWT-based)
  - Google OAuth 2.0 Login Integration
  - Secure password hashing with `bcrypt`

- 📰 **Blog Management**
  - Create, Edit, and Delete Blogs
  - Public and Private Blog Visibility Options
  - User-specific content filtering

- 👥 **Community Page**
  - Join community with one click
  - Displays list of all active community members
  - Auto-creates member profile upon joining

- 💬 **Contact Form**
  - Validates and sends messages using Nodemailer
  - Rate-limited to prevent spam
  - Saves all contact messages to MongoDB

- 🧠 **Smart Session Management**
  - Persistent sessions using `express-session`
  - Unified user handling for both JWT and OAuth logins

- ⚙️ **Environment Configuration**
  - `.env` file used for sensitive credentials
  - Includes setup for email, OAuth, and MongoDB URI

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| Frontend | EJS, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Passport.js (Google OAuth 2.0) |
| Email Service | Nodemailer |
| Other Tools | bcrypt, cookie-parser, dotenv, express-session, validator, express-rate-limit |

---


