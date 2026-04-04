import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";

const providers: NextAuthOptions["providers"] = [
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
        image: user.profilePhotoUrl ?? undefined,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      const { prisma } = await import("./prisma");
      const email = user.email.trim().toLowerCase();
      const displayName = user.name?.trim() || email.split("@")[0] || "User";
      const placeholderPasswordHash = await hash(randomBytes(32).toString("hex"), 10);

      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {
          name: displayName,
          emailVerified: true,
          profilePhotoUrl: user.image ?? undefined,
        },
        create: {
          name: displayName,
          email,
          passwordHash: placeholderPasswordHash,
          emailVerified: true,
          profilePhotoUrl: user.image ?? null,
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePhotoUrl: true,
        },
      });

      user.id = dbUser.id;
      user.name = dbUser.name;
      user.email = dbUser.email;
      user.role = dbUser.role;
      user.image = dbUser.profilePhotoUrl ?? user.image ?? null;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.role = (user as { role?: string }).role;
        token.picture = user.image ?? undefined;
      }

      if (!token.id) {
        return token;
      }

      const { prisma } = await import("./prisma");
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, email: true, name: true, role: true, profilePhotoUrl: true },
      });

      if (!dbUser) {
        delete token.id;
        delete token.email;
        delete token.name;
        delete token.role;
        delete token.picture;
        token.invalid = true;
        return token;
      }

      token.id = dbUser.id;
      token.email = dbUser.email;
      token.name = dbUser.name;
      token.role = dbUser.role;
      token.picture = dbUser.profilePhotoUrl ?? undefined;
      delete token.invalid;

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && !token.invalid) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};
