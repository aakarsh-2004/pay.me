import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import db from '../../../../../packages/db/index';

// Extend the built-in session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: "Phone number", type: "text", placeholder: '91xxxxxxxx' },
        password: { label: "Password", type: "password", placeholder: 'password...' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        
        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        const existingUser = await db.user.findFirst({
          where: {
            number: credentials.phone
          }
        });

        if (existingUser) {
          const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
          if (passwordValidation) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email
            };
          }
          return null;
        }

        try {
          const user = await db.user.create({
            data: {
              number: credentials.phone,
              password: hashedPassword
            }
          });

          return {
            id: user.id,
            name: user.name,
            email: user.number
          };
        } catch (error) {
          console.log("error while creating user " + error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'secret',
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    }
  }
};