import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Session duration configuration (30 days default)
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '2592000') // 30 days in seconds
const JWT_MAX_AGE = parseInt(process.env.JWT_MAX_AGE || '2592000') // 30 days in seconds

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    // Session will last for the configured duration (default: 30 days)
    maxAge: SESSION_MAX_AGE,
    // Update session every 24 hours if user is active
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    // JWT tokens will expire after the configured duration
    maxAge: JWT_MAX_AGE,
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to dashboard after successful sign in
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        // Set custom expiration time for the token
        token.exp = Math.floor(Date.now() / 1000) + JWT_MAX_AGE
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // Extend session expiry based on configuration
        session.expires = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()
      }
      return session
    },
  },
} 