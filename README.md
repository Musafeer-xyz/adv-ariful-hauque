# Advocate Website - Professional Legal Services

A bilingual (Bengali/English) advocate website with appointment booking, blog CMS, and admin dashboard.

## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Tailwind CSS v3
- lucide-react (icons)

### Backend
- Node.js
- Express
- MongoDB (MongoDB Atlas compatible)

### Features
- Public website with bilingual content
- Appointment booking with manual payment (bKash/Nagad)
- Time slot management
- Blog CMS with YouTube video embedding
- Admin dashboard with authentication
- WhatsApp integration
- Responsive design
- Professional law-firm visual design

## Project Structure

```
advTayef/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── context/          # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── styles/           # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── src/
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic
│   │   └── config/           # Configuration
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd advTayef
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Environment Setup

### Server Environment Variables

Create a `.env` file in the `server/` directory:

```env
# MongoDB - Replace with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/advocate

# JWT Secret - Change this in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

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

### Client Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier is sufficient)
4. Create a database user with read/write permissions
5. Get your connection string from the Atlas dashboard
6. Replace the `MONGODB_URI` in the server `.env` file with your connection string

## Database Seeding

Once your MongoDB connection is configured:

```bash
cd server
npm run seed
```

This will create:
- Default advocate profile
- Sample practice areas
- Admin authentication with default PIN: 123456

## Running the Application

### Development Mode

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:5000`

### Production Build

Build the frontend:
```bash
cd client
npm run build
```

The built files will be in the `client/dist/` directory.

## Admin Access

Default credentials:
- PIN: 123456

⚠️ **Important**: Change the default PIN after first login in production!

Admin URL: `http://localhost:3000/admin/login`

## API Endpoints

### Public API
- `GET /api/health` - Health check
- `GET /api/slots?date=` - Get available slots for a date
- `POST /api/appointments` - Create appointment
- `GET /api/blog` - Get published blog posts
- `GET /api/blog/:slug` - Get single blog post
- `GET /api/profile` - Get advocate profile
- `GET /api/practice-areas` - Get practice areas

### Admin API
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/appointments` - Get appointments
- `PATCH /api/admin/appointments/:id/confirm` - Confirm appointment
- `PATCH /api/admin/appointments/:id/cancel` - Cancel appointment
- `GET /api/admin/slots` - Get all slot days
- `POST /api/admin/slots` - Create slot day
- `PATCH /api/admin/slots/:date/:time/toggle` - Toggle slot availability
- `DELETE /api/admin/slots/:date/:time` - Delete slot
- `GET /api/admin/blog` - Get all blog posts
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/:slug` - Update blog post
- `DELETE /api/admin/blog/:slug` - Delete blog post
- `PUT /api/admin/profile` - Update profile

## Design System

### Colors
- Navy: #0B1B33, #0F2140, #16294A, #1F3A63
- Brass: #A9812F, #C9A448, #8A6A26
- Background: #F7F4EC, #EFE8D8
- Body text: #1C1D21

### Typography
- Bengali: Noto Serif Bengali (headings), Hind Siliguri (body)
- English: Source Serif 4 (headings), Work Sans (body)

## Payment Flow

The system uses a manual payment flow:
1. Customer books appointment
2. Customer sends payment via bKash or Nagad
3. Admin verifies payment manually
4. Admin confirms appointment
5. Customer receives confirmation notification

## Notification System

The system supports multiple notification providers:
- Console (for development)
- Resend (email)
- Brevo (email + SMS)
- Alpha SMS (SMS)
- Bulk SMS BD (SMS)

Configure the provider in server `.env`:
```env
NOTIFICATION_PROVIDER=resend
RESEND_API_KEY=your-api-key
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set root directory to `server`
3. Add environment variables from `.env.example`
4. Deploy

### Domain Configuration
1. Point your domain to Vercel (frontend)
2. Configure CORS in backend to allow your domain
3. Update `CLIENT_URL` in backend environment variables

## Security Notes

- Never commit `.env` files
- Change default PIN in production
- Use strong JWT secrets
- Enable HTTPS in production
- Configure proper CORS settings
- Keep dependencies updated

## Future Enhancements

- Automated payment gateway integration (SSLCommerz, bKash Merchant API)
- SMS notifications for appointment reminders
- File upload for blog images
- Advanced analytics dashboard
- Multi-language support beyond Bengali/English

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB Atlas connection string
- Check IP whitelist in Atlas settings
- Ensure database user has correct permissions

### CORS Errors
- Verify `CLIENT_URL` in backend `.env`
- Check CORS configuration in `server.js`

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires v18+)

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.
