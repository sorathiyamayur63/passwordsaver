# Deployment Guide

Deploying PasswordSaver requires hosting the Node.js backend, the React frontend, and a MongoDB database. Because this is a security-focused application, **HTTPS is absolutely mandatory** for both the frontend and the backend.

## 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist the IP addresses of your backend server (or allow all `0.0.0.0/0` if deploying on serverless/ephemeral environments like Render/Heroku).
3. Get the connection string and replace `<password>` with your database user password.

## 2. Backend Deployment (Render / Heroku / Railway)

### Environment Variables Required
Ensure you set the following in your hosting provider's dashboard:
- `NODE_ENV=production`
- `PORT` (usually auto-assigned by the provider)
- `MONGODB_URI` (Your Atlas Connection String)
- `JWT_SECRET` (Generate a secure 64-character hex string)
- `JWT_REFRESH_SECRET` (Generate a different secure 64-character hex string)
- `CLIENT_URL` (The final deployed URL of your frontend, e.g., `https://passwordsaver.app`)

### Build Command
For platforms like Render:
- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && npm start`

*Note: The backend relies on HTTP-only, Secure cookies for JWT transmission. Your backend must be served over HTTPS, and `CLIENT_URL` must exactly match the frontend's origin.*

## 3. Frontend Deployment (Vercel / Netlify)

The frontend is built with Vite.

### Environment Variables
Set the following in Vercel/Netlify:
- `VITE_API_URL` = `https://your-backend-url.onrender.com` (No trailing slash)

### Build Settings
- **Framework Preset:** Vite
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/dist`

### Note on Client-Side Routing
If you deploy to a static host (like Netlify or Nginx), you must configure rewrites to serve `index.html` for all paths so that React Router can take over.
- **Netlify:** Add a `_redirects` file in `client/public` with: `/* /index.html 200`
- **Vercel:** Vercel handles this automatically for Vite/React apps if configured correctly.

## 4. Security Verification Post-Deployment
Once deployed:
1. Try to log in. Ensure that the `accessToken` and `refreshToken` cookies are successfully set. (Check DevTools -> Application -> Cookies).
2. Ensure they are marked `Secure` and `HttpOnly`.
3. Try changing the theme and exporting a backup to ensure client-side crypto functions correctly in the production build.
