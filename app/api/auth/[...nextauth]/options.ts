import type { NextAuthOptions, Session as NextAuthSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Extend session with user role
interface ExtendedSession extends NextAuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    gender?: string | null;
    role?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          image: user.image,
          name: user.name,
          gender: user.gender,
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
        token.image = user.image;

        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.role = dbUser.role || "student";
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
          image: token.image as string,
        },
      };
    },
  },
};
