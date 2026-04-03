import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();
        const { prisma } = await import("./prisma");
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !(await compare(password, user.passwordHash)))
          return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.role = (user as { role?: string }).role;
      }

      if (!token.id) {
        return token;
      }

      const { prisma } = await import("./prisma");
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!dbUser) {
        delete token.id;
        delete token.email;
        delete token.name;
        delete token.role;
        token.invalid = true;
        return token;
      }

      token.id = dbUser.id;
      token.email = dbUser.email;
      token.name = dbUser.name;
      token.role = dbUser.role;
      delete token.invalid;

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && !token.invalid) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};
