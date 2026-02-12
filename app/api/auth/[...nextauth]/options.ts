import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";

// Extend session with user role
interface ExtendedSession extends NextAuthSession {
  user: {
    id: string;
    name?: string | null;
    email: string | null;
    role?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");
        const user = await prisma.users.findUnique({ where: { email: credentials.email } });
        if (!user) throw new Error("User not found");

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: String(user.id),
          email: user.email ,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        if (user.email) {
          const dbUser = await prisma.users.findUnique({ where: { email: user.email } });

          if (dbUser) {
            token.role = dbUser.role || "student";
          }
        }
      }

      return token;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          email: token.email as string,
        },
      };
    },
  },
};
