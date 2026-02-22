import express from "express";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import cookieParser from "cookie-parser";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

// Extend session type
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      email: string;
      picture: string;
    };
  }
}

const app = express();
const PORT = 3000;

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// API Routes
app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    redirect_uri: redirectUri,
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req: any, res) => {
  const { code } = req.query;
  const redirectUri = `${process.env.APP_URL}/auth/google/callback`;

  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });
    googleClient.setCredentials(tokens);

    const userInfoResponse = await googleClient.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    const user = userInfoResponse.data as any;
    (req.session as any).user = {
      id: user.sub,
      name: user.name,
      email: user.email,
      picture: user.picture,
    };

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/user", (req: any, res) => {
  res.json({ user: (req.session as any).user || null });
});

app.post("/api/logout", (req: any, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
