# Setup Instructions

## 1. Create Environment Files

### Server Environment (.env)
Create a `.env` file in the `server/` directory with the following content:

```env
# MongoDB - Replace with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/advocate

# JWT Secret - Change this in production
JWT_SECRET=dev-secret-key-change-in-production

# Admin PIN Hash - This is the hash for "123456"
ADMIN_PIN_HASH=$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

# Client URL
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000

# Notification Providers
NOTIFICATION_PROVIDER=console
# Options: console, resend, brevo, alpha-sms, bulk-sms-bd
```

### Client Environment (.env)
Create a `.env` file in the `client/` directory with the following content:

```env
VITE_API_URL=http://localhost:5000/api
```

## 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier is sufficient)
4. Create a database user with read/write permissions
5. Get your connection string from the Atlas dashboard
6. Replace the `MONGODB_URI` in the server `.env` file with your connection string

## 3. Seed the Database

Once your MongoDB connection is configured:

```bash
cd server
npm run seed
```

This will create:
- Default advocate profile
- Sample practice areas
- Admin authentication with default PIN: 123456

## 4. Start the Development Servers

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:5000`

## 5. Admin Login

Default credentials:
- PIN: 123456

⚠️ **Important**: Change the default PIN after first login in production!

## 6. Next Steps

After setup, you can:
- Access the public website at `http://localhost:3000`
- Login to admin at `http://localhost:3000/admin/login`
- Update your profile in the admin dashboard
- Create time slots for appointments
- Add blog posts
