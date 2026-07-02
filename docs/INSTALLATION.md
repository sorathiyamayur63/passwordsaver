# Installation & Local Setup

This guide walks you through setting up PasswordSaver for local development.

## Prerequisites

1. **Node.js**: v18.x or higher recommended.
2. **MongoDB**: A running MongoDB instance (either local or MongoDB Atlas).
3. **Git**: To clone the repository.

## Step-by-Step Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/passwordsaver.git
cd passwordsaver
```

### 2. Install Dependencies
You can install both server and client dependencies simultaneously using the provided npm script:
```bash
npm run install:all
```

Alternatively, install them manually:
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory. Use the `.env.example` as a template:

```bash
cd server
cp .env.example .env
```

**Required Variables in `server/.env`**:
- `PORT=5000` (Default API port)
- `MONGODB_URI=mongodb://localhost:27017/passwordsaver` (Or your Atlas connection string)
- `JWT_SECRET=` (A long, random cryptographic string)
- `JWT_REFRESH_SECRET=` (A different long, random cryptographic string)
- `NODE_ENV=development`
- `CLIENT_URL=http://localhost:5173`

Create a `.env` file in the `client` directory:
```bash
cd ../client
touch .env
```
Add the following to `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the Development Servers
From the root of the project, you can start both the Node.js backend and the Vite frontend concurrently:
```bash
npm run dev
```

- The **Frontend** will be available at: `http://localhost:5173`
- The **Backend API** will be available at: `http://localhost:5000`

### 5. Troubleshooting
- **CORS Errors:** Ensure your `CLIENT_URL` matches the frontend Vite port exactly (no trailing slashes).
- **MongoDB Connection:** Ensure your MongoDB service is running if using a local database.
- **Vite Plugin React Babel Errors:** Ensure there are no dangling JSX brackets or syntax errors in the React files.
