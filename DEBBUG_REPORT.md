# Debug Report - MyShifters 401 Unauthorized Issue

## 🔍 Diagnosis
The `401 (Unauthorized)` error you were seeing during login was primarily caused by how the backend was handling password validation and database connections.

### 1. Database Connectivity (Potential)
The project is configured to use **MongoDB Atlas**. If the backend cannot connect to the database (due to IP whitelisting or incorrect credentials), it returns a `500` error, which might be interpreted as a failure in the login flow.

### 2. Password Hashing Inconsistency
The backend uses `bcrypt` for password hashing. However, the login route had a fallback for plain-text passwords which was slightly fragile. I've improved the login logic to:
- Properly log when a user is not found.
- Handle cases where a user might exist but lacks a `password_hash` field.
- Provide clearer error logging on the server side.

### 3. Registration Data Flow
There were inconsistencies in how registration data was being sent and processed:
- **Worker Registration**: The frontend sends `FormData` (including a PDF CV), but the backend was expecting strict boolean/integer types for some fields. In `multipart/form-data`, everything is received as a string. I've updated the backend to handle these conversions (`"true"`/`"false"` to `True`/`False`).
- **Hotel Registration**: The frontend sends a nested object. I've updated the backend `register` route to flatten this data and store it correctly in MongoDB.

## 🛠️ Fixes Implemented

### Backend (`server.py`)
- **Login Route**: Added robust checks for `password_hash` and improved logging to help identify if a user exists or if the password check is failing.
- **Worker Registration**: Updated to handle string-to-boolean and string-to-integer conversions for fields like `has_ae_status` and `experience_years`.
- **General Registration**: Added logic to clean up `None` values before inserting into MongoDB to avoid database clutter.
- **CORS**: Verified that `CORS_ORIGINS` includes both your Netlify production URL and `localhost:3000`.

### Frontend
- **AuthContext**: Verified that tokens are being stored and sent correctly in the `Authorization` header.
- **RegisterPage**: Verified that it correctly distinguishes between `FormData` (for workers) and JSON (for hotels).

## 🚀 Next Steps for You

### 1. MongoDB Atlas Whitelisting
The most common reason for `401` or `500` errors on Render when using MongoDB Atlas is that **Render's IP addresses are not whitelisted**.
- Go to your MongoDB Atlas Dashboard.
- Go to **Network Access**.
- Add `0.0.0.0/0` (Allow access from anywhere) or find Render's specific IP ranges (though `0.0.0.0/0` is often necessary for Render's dynamic IPs).

### 2. Environment Variables on Render
Ensure the following variables are set in your **Render Dashboard**:
- `MONGO_URL`: Your full MongoDB connection string.
- `JWT_SECRET`: A strong secret key (must match what you use locally if you want tokens to persist).
- `CORS_ORIGINS`: `https://your-netlify-app.netlify.app,http://localhost:3000`
- `DB_NAME`: `myshifters`

### 3. Environment Variables on Netlify
Ensure your Netlify site has:
- `REACT_APP_BACKEND_URL`: `https://myshifterswebapp.onrender.com`

## 🧪 Testing Locally
To test the fixes locally:
1. Start the backend: `cd backend && ./start.sh`
2. Start the frontend: `cd frontend && ./start.sh`
3. Try registering a new user first to ensure the hashing and storage work correctly with the new fixes.
