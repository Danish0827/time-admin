// Import NextResponse and NextRequest
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Define arrays for authenticated and protected routes
const authRoutes = ["/login"];
// const protectedRoutes = ['/'];
const protectedRoutes = [
  "/",
  "/dashboard",
  "/trustee",
  "/masjid",
  "/feature",
  "/subscription",
  "/hadeeth",
  "/adhkar",
  "/usersubscription",
  "/test",
];

// Define the middleware function
export function middleware(request) {
  // Check if the 'authToken' cookie exists
  const authToken = request.cookies.get("authToken");

  // console.log(authToken, "hello");

  if (authToken) {
    const token = authToken.value;
    // console.log(token);
    try {
      // Decode the JWT token to extract the user ID
      const decodedToken = jwt.decode(authToken.value);
      // console.log(token);
      // console.log(decodedToken);
      const userId = decodedToken ? decodedToken.id : null;
      // console.log(token);
      // console.log(userId);
      if (!userId) {
        const expiredCookie = `${authToken.name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;

        // Return a response with the expired cookie to remove it
        return NextResponse.next({
          headers: {
            "Set-Cookie": expiredCookie,
          },
        });
      }
      // Send a request to the backend to validate the user
      const response = fetch(
        "https://backend.salahpulse.com/api/validateUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );
      if (response.status === 401) {
        const expiredCookie = `${authToken.name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;

        // Return a response with the expired cookie to remove it
        return NextResponse.next({
          headers: {
            "Set-Cookie": expiredCookie,
          },
        });
        // document.cookie =
        //   "jwtauth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      if (response.status === 200) {
        // console.log("VALID");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  }

  const isAuthenticated = authToken !== undefined;

  // Check the request path against the arrays to decide the action
  if (authRoutes.includes(request.nextUrl.pathname)) {
    // If the request is for an authenticated route and the cookie exists, redirect to the first protected route
    if (authToken) {
      // Construct an absolute URL for the redirect, excluding the port in production
      const redirectUrl =
        request.nextUrl.protocol +
        "//" +
        request.nextUrl.hostname +
        (request.nextUrl.port ? `:${request.nextUrl.port}` : "") +
        protectedRoutes[0];
      return NextResponse.redirect(redirectUrl);
    } else {
      // If the cookie does not exist, continue with the request
      return NextResponse.next();
    }
  } else if (protectedRoutes.includes(request.nextUrl.pathname)) {
    // If the request is for a protected route and the cookie exists, continue with the request
    if (authToken) {
      return NextResponse.next();
    } else {
      // Construct an absolute URL for the redirect to the admin login page, excluding the port in production
      const redirectUrl =
        request.nextUrl.protocol +
        "//" +
        request.nextUrl.hostname +
        (request.nextUrl.port ? `:${request.nextUrl.port}` : "") +
        "/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Default action if the request does not match any of the defined routes
  return NextResponse.next();
}
