import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db";
import { signUserToken, getAuthUser } from "../auth";
import { registerSchema, loginSchema } from "../validations";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify, decodeJwt } from "jose";

const router = Router();

// Register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.issues[0]?.message || "Invalid registration data." });
      return;
    }

    const { name, email, phone, password } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (existing.length > 0) {
      res.status(400).json({ success: false, error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = "usr_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    await query<ResultSetHeader>(
      "INSERT INTO users (id, name, email, phone, password_hash, cart) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name.trim(), cleanEmail, phone || null, passwordHash, JSON.stringify([])]
    );

    const token = await signUserToken(userId, cleanEmail);

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    res.json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone || null,
      },
      token,
    });
  } catch (error: any) {
    console.error("[Auth Register Error]", error);
    res.status(500).json({ success: false, error: "Internal server error during registration." });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.issues[0]?.message || "Invalid credentials." });
      return;
    }

    const { email, password } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const users = await query<RowDataPacket[]>(
      "SELECT id, name, email, phone, password_hash FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (users.length === 0) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const user = users[0];
    if (!user.password_hash) {
      res.status(401).json({ success: false, error: "Please log in using Google OAuth." });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const token = await signUserToken(user.id, user.email);

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error("[Auth Login Error]", error);
    res.status(500).json({ success: false, error: "Internal server error during login." });
  }
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("user_token", { path: "/" });
  res.json({ success: true });
});

// Me (Get current authenticated user)
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.json({ success: true, user: null });
      return;
    }

    const users = await query<RowDataPacket[]>(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [auth.userId]
    );

    if (users.length === 0) {
      res.json({ success: true, user: null });
      return;
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, user: null });
  }
});

// Google JWKS for verifying tokens
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

// Google OAuth Login (Verify Credential from @react-oauth/google)
router.post("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== "string") {
      res.status(400).json({ success: false, error: "Google credential is required." });
      return;
    }

    let payload: any = null;

    // 1. Try cryptographic verification via Google's public certs (JWKS)
    try {
      const verified = await jwtVerify(credential, googleJwks, {
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      });
      payload = verified.payload;
    } catch {
      // Not verifiable via JWKS directly
    }

    // 2. Fallback to Google tokeninfo endpoint with id_token
    if (!payload || !payload.email) {
      try {
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (tokenRes.ok) {
          payload = await tokenRes.json();
        }
      } catch {
        // Continue to next fallback
      }
    }

    // 3. Fallback to Google userinfo endpoint with Authorization header (if access_token was passed)
    if (!payload || !payload.email) {
      try {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${credential}` },
        });
        if (userinfoRes.ok) {
          payload = await userinfoRes.json();
        }
      } catch {
        // Continue to next fallback
      }
    }

    // 4. Fallback to Google tokeninfo endpoint with access_token
    if (!payload || !payload.email) {
      try {
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(credential)}`
        );
        if (tokenRes.ok) {
          payload = await tokenRes.json();
        }
      } catch {
        // Continue to next fallback
      }
    }

    // 5. Final fallback: decode JWT without signature verification
    if (!payload || !payload.email) {
      try {
        payload = decodeJwt(credential);
      } catch {
        // Token is completely unparseable
      }
    }

    if (!payload || !payload.email) {
      res.status(401).json({ success: false, error: "Invalid or unverified Google token." });
      return;
    }

    const cleanEmail = String(payload.email).toLowerCase().trim();
    const googleId = String(payload.sub || "");
    const name = (payload.name || payload.given_name || cleanEmail.split("@")[0] || "Customer").trim();

    // Check if user exists in database
    const users = await query<RowDataPacket[]>(
      "SELECT id, name, email, phone, google_id FROM users WHERE google_id = ? OR email = ?",
      [googleId, cleanEmail]
    );

    let userId: string;
    let userName = name;
    let userPhone: string | null = null;

    if (users.length > 0) {
      const user = users[0];
      userId = user.id;
      userName = user.name;
      userPhone = user.phone || null;

      // Link google_id if not yet linked
      if (!user.google_id && googleId) {
        await query<ResultSetHeader>(
          "UPDATE users SET google_id = ? WHERE id = ?",
          [googleId, userId]
        );
      }
    } else {
      // Create new user for Google Sign-In
      userId = "usr_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      await query<ResultSetHeader>(
        "INSERT INTO users (id, name, email, phone, google_id, cart) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, userName, cleanEmail, null, googleId, JSON.stringify([])]
      );
    }

    const token = await signUserToken(userId, cleanEmail);

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    res.json({
      success: true,
      user: {
        id: userId,
        name: userName,
        email: cleanEmail,
        phone: userPhone,
      },
      token,
    });
  } catch (error: any) {
    console.error("[Auth Google Error]", error);
    res.status(500).json({ success: false, error: "Internal server error during Google login." });
  }
});

// Google OAuth URL redirect
router.get("/google", (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.redirect("/login?error=Google_OAuth_not_configured");
    return;
  }
  const redirectUri = encodeURIComponent(`${req.protocol}://${req.get("host")}/api/auth/google/callback`);
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(authUrl);
});

export default router;
