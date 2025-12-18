import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email und Passwort sind erforderlich')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            player: true,
            recruiter: true,
            clubManager: true,
          }
        })

        if (!user || !user.password) {
          throw new Error('Ungültige Anmeldedaten')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Ungültige Anmeldedaten')
        }

        // Block login if email is not verified
        if (!user.emailVerified) {
          throw new Error('Bitte Verifizier Zerscht Dini E-Mail-Adresse. Lueg I Dim Postfach.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          playerId: user.player?.id,
          recruiterId: user.recruiter?.id,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.playerId = (user as any).playerId
        token.recruiterId = (user as any).recruiterId
      }
      // If token doesn't have playerId/recruiterId, fetch from database
      if (token.id && (!token.playerId && !token.recruiterId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            player: true,
            recruiter: true,
          }
        })
        if (dbUser?.player) {
          token.playerId = dbUser.player.id
        }
        if (dbUser?.recruiter) {
          token.recruiterId = dbUser.recruiter.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.playerId = token.playerId as string
        session.user.recruiterId = token.recruiterId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
