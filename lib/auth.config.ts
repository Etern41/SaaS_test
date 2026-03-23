import type { NextAuthConfig } from "next-auth";

/**
 * Конфиг без Node-only зависимостей (bcrypt, prisma) — для Edge / middleware.
 * Полный NextAuth с Credentials в lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
