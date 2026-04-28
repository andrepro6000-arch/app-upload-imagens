import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure Multer for memory storage
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // API Route for ImgBB Upload Proxy
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        console.error("IMGBB_API_KEY is missing in environment variables");
        return res.status(500).json({ error: "Server configuration error: Missing API Key" });
      }

      // Prepare FormData for ImgBB
      const formData = new FormData();
      const base64Image = req.file.buffer.toString("base64");
      formData.append("image", base64Image);

      // Send to ImgBB
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        res.json({ url: data.data.url });
      } else {
        console.error("ImgBB Error:", data);
        res.status(500).json({ error: "ImgBB upload failed", details: data });
      }
    } catch (error) {
      console.error("Server Upload Error:", error);
      res.status(500).json({ error: "Internal server error during upload" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
