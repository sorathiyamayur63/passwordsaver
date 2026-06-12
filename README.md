# passwordsaver

[cite_start]passwordsaver  [cite_start]is a professional, production-quality, cybersecurity-focused password manager web application that prioritizes security, privacy, reliability, scalability, and user trust[cite: 4].

## Zero-Knowledge Architecture
[cite_start]This application utilizes a strict zero-knowledge architecture. [cite_start]All vault data must be encrypted on the client using AES-256-GCM before being sent to the server[cite: 94]. The server exclusively manages authentication, encrypted synchronization, and session lifecycles. [cite_start]It must never have the ability to decrypt user secrets[cite: 95].

## Tech Stack
* [cite_start]**Frontend**: React 18, Vite, TailwindCSS [cite: 10, 11, 12]
* [cite_start]**Backend**: Node.js, Express.js [cite: 14, 15, 16]
* [cite_start]**Database**: MongoDB Atlas [cite: 17, 18]
* [cite_start]**Hosting Context**: Vercel (Client) [cite: 19, 20]

## Prerequisites
* Node.js 18+
* npm or yarn
* MongoDB Atlas Account

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd passwordsaver