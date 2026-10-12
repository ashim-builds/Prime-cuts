import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdminMiddleware } from "../auth";

const router = Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype.toLowerCase().startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.originalname);
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, AVIF, GIF) are permitted."));
    }
  },
});

router.post("/", requireAdminMiddleware, upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }

    // Save directly to public/uploads directory
    const uploadsDir = path.resolve(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const rawExt = path.extname(req.file.originalname) || ".jpg";
    const ext = rawExt.startsWith(".") ? rawExt : `.${rawExt}`;
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    // Also mirror to secondary directories if they exist
    const secondaryDirs = [
      path.resolve(process.cwd(), "../web/public/uploads"),
      path.resolve(process.cwd(), "../public/uploads"),
      path.resolve(process.cwd(), "dist/client/uploads"),
    ];

    for (const dir of secondaryDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, filename), req.file.buffer);
      } catch (err) {
        // Ignore secondary directory copy errors
      }
    }

    res.json({ success: true, url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("[Upload Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to upload image." });
  }
});

export default router;
