import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/",
    "/post",
    "/my-posts",
    "/notifications",
    "/profile",
    "/item/:path*",
    "/user/:path*",
  ],
};
