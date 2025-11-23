// Simple guest user system for initial launch
// Users get a temporary ID and can set their name
import { randomUUID } from "crypto";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function setupSimpleAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "lumen-secret-" + randomUUID(),
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));
}

// Middleware to ensure user exists (creates guest if needed)
export const ensureUser: RequestHandler = async (req: any, res, next) => {
  if (!req.session.userId) {
    // Create a new guest user
    const guestNumber = Math.floor(Math.random() * 10000);
    const user = await storage.createUser({
      name: `Guest${guestNumber}`,
      isLumen: false,
      role: "member",
    });
    req.session.userId = user.id;
  }
  
  // Fetch user data
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    // User was deleted, create new one
    const guestNumber = Math.floor(Math.random() * 10000);
    const newUser = await storage.createUser({
      name: `Guest${guestNumber}`,
      isLumen: false,
      role: "member",
    });
    req.session.userId = newUser.id;
    req.user = newUser;
  } else {
    req.user = user;
  }
  
  next();
};
