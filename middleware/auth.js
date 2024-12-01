const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    try {
      const data = jwt.verify(token, "ishuashu");
      req.user = data; // Attach user data to request object
      next(); // Continue to the next middleware or route
    } catch (err) {
      console.error("JWT verification failed:", err);
      res.clearCookie("token");
      return res.redirect("/auth/login"); // Redirect to login if token is invalid
    }
  } else {
    // No token present
    if (
      (req.originalUrl.startsWith("/auth") || req.originalUrl === "/") &&
      req.originalUrl !== "/uploadPhoto" // Allow access to home
    ) {
      console.log("checked");

      return next(); // Allow public routes
    } else {
      // For other protected routes, redirect to login
      return res.redirect("/auth/login");
    }
  }
}

module.exports = authenticateUser;
