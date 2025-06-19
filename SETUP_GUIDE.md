# Setup Instructions for Google OAuth

## 1. Create Google OAuth Application

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client IDs'
5. Set Application type to 'Web application'
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## 2. Create .env.local file

Create a `.env.local` file in your project root with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-generate-a-random-string

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
```

## 3. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 4. Test the Application

1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000/login
3. Try the Google login

## 5. Current Features

✅ **Login page** at `/login`  
✅ **Google OAuth** integration (requires setup)  
✅ **Email form** (UI only, backend needed)  
✅ **User profile** component with logout  
✅ **Session management** with NextAuth  
✅ **Responsive design** with Tailwind CSS  

## 6. Next Steps

- Implement email/password authentication backend
- Add user registration
- Add password reset functionality
- Add protected routes
- Add user dashboard 