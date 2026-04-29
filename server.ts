import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes (Add your backend logic here later)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "RHU-CARE", version: "1.0.0" });
  });

  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 RHU-CARE System Active
📍 URL: http://localhost:${PORT}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
📱 For Mobile access: Use your Computer's IP address on the same Wi-Fi.
    `);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
