// Use the fully configured auth instance (with adapter/callbacks) to ensure role is present
import { auth as baseAuth } from "@/auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  adminAreaPrefix,
  candidateAreaPrefix,
  adminRoot,
  candidateRoot,
} from "@/routes";

export default baseAuth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const pathname = nextUrl.pathname;
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminArea = pathname.startsWith(adminAreaPrefix);
  // Candidate area is any dashboard path that is not under admin prefix
  const isCandidateArea =
    pathname.startsWith(candidateAreaPrefix) && !isAdminArea;

  if (isApiAuthRoute) {
    // Do nothing for API auth routes
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Role-based default landing
      const target = role === "ADMIN" ? adminRoot : candidateRoot;
      return Response.redirect(new URL(target, nextUrl));
    }
    // Allow unauthenticated users to access auth routes
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    // Redirect unauthenticated users to the login page
    let callbackUrl = pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // RBAC: prevent accessing other dashboard
  if (isLoggedIn) {
    // Admin should not land on candidate root
    if (role === "ADMIN" && pathname === candidateRoot) {
      return Response.redirect(new URL(adminRoot, nextUrl));
    }
    // Non-admin cannot access admin area
    if (role !== "ADMIN" && isAdminArea) {
      return Response.redirect(new URL(candidateRoot, nextUrl));
    }
    // Optionally, keep candidates under candidate area when hitting arbitrary dashboard paths
    if (role !== "ADMIN" && pathname === adminRoot) {
      return Response.redirect(new URL(candidateRoot, nextUrl));
    }
  }

  // Allow access to public routes or logged-in users
  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
