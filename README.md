# PasswordSaver

A production-ready, cybersecurity-focused password manager built with a zero-knowledge architecture. PasswordSaver prioritizes security, privacy, reliability, scalability, and user trust.

## Live Demo

web: https://saveyourpass.qzz.io

---

## Features

### Security First

* Zero-Knowledge Architecture
* AES-256-GCM Client-Side Encryption
* HttpOnly Secure Cookies
* Session Management
* Device Management
* CSRF Protection
* Rate Limiting
* Security Headers (Helmet)
* MongoDB Injection Protection
* HTTP Parameter Pollution Protection

### Vault Management

* Store passwords securely
* Categories
* Favorites
* Trash & Recovery
* Templates
* Global Search
* Password Generator
* Security Center

### Account Features

* Multi-device sessions
* Profile management
* Password change
* Logout from all devices
* Backup support


## Technology Stack

### Frontend

* React 18
* Vite
* React Router
* Axios
* Zustand
* React Query
* TailwindCSS
* Framer Motion

### Backend

* Node.js
* Express.js
* JWT Authentication
* Argon2 Password Hashing

### Database

* MongoDB Atlas

### Infrastructure

* Vercel (Frontend)
* Render (Backend)
* Cloudflare DNS

---

## Project Structure

```text
passwordsaver/
├── client/
│   ├── public/
│   ├── src/
│   ├── services/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── crypto/
│   └── utils/
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── config/
│   ├── app.js
│   └── server.js
│
└── README.md
```

---

## Local Development

### Prerequisites

* Node.js 18+
* npm
* MongoDB Atlas Account

### Clone Repository

```bash
git clone https://github.com/sorathiyamayur63/passwordsaver.git
cd passwordsaver
```

### Install Dependencies

```bash
npm run install:all
```

### Environment Variables

Create:

```bash
server/.env
```

Example:

```env
NODE_ENV=development

PORT=3001

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

---


## Security Design

### Authentication

* JWT Access Tokens
* Refresh Tokens
* Session Rotation
* Device Tracking

### Password Storage

* Argon2 Password Hashing
* Strong Security Parameters

### API Security

* Helmet
* CORS Protection
* CSRF Protection
* Request Tracking
* Audit Logging
* Rate Limiting

### Encryption

* AES-256-GCM
* Client-Side Encryption
* Zero-Knowledge Design

---

## License

This project is intended for educational, portfolio, and cybersecurity learning purposes.

---

## Author

:- Mayur Sorathiya

GitHub:
https://github.com/sorathiyamayur63
