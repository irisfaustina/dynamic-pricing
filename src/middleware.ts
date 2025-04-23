import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//only protect pages that are private, create function to match list of pages public

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", /* (.*) means what comes after also counts */
  "/sign-in(.*)",
  "/api(.*)",
  "/json/(.*)", // Allow JSON endpoints
])

//protect pages add security, export function takes another function as an argument, passing into it for auth, aka you must be signed in to view this page
export default clerkMiddleware((auth, req) => {
  // Skip authentication for OPTIONS requests and JSON endpoints
  if (req.method === "OPTIONS" || req.nextUrl.pathname.startsWith('/json/')) {
    return;
  }
  
  if (!isPublicRoute(req)){
    auth.protect()
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc|json)(.*)',
  ],
};