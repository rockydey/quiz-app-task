/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to the appropriate dashboard
 * based on role (admin → `adminRoot`, candidate → `candidateRoot`).
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in (candidate root)
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Admin and Candidate area prefixes and roots
 */
export const adminAreaPrefix = "/dashboard/admin";
export const candidateAreaPrefix = "/dashboard"; // non-admin dashboard
export const adminRoot = "/dashboard/admin";
export const candidateRoot = "/dashboard";

/**
 * Optional explicit route allowlists for admin navigation structure
 * These can be used by middleware/UI to validate links or highlight nav.
 */
export const adminNavRoutes = [
  "/dashboard/admin", // Dashboard
  "/dashboard/admin/assign", // Assign User Test (placeholder)
  "/dashboard/admin/positions",
  "/dashboard/admin/groups",
  "/dashboard/admin/questions",
  "/dashboard/admin/quizzes",
  "/dashboard/admin/users", // User Management
  "/dashboard/admin/grading",
  "/dashboard/admin/analytics",
];
