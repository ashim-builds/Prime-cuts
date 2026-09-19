import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import { requireAdminMiddleware } from "../auth";

const router = Router();

// Configure Cloudinary if keys exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WebP images are permitted."));
    }
  },
});

router.post("/", requireAdminMiddleware, upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }

    // Check Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_name" &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadPromise = new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "crispychips",
            resource_type: "image",
          },
          (err, result) => {
            if (err || !result) reject(err || new Error("Cloudinary upload failed"));
            else resolve(result.secure_url);
          }
        ).end(req.file!.buffer);
      });

      const secureUrl = await uploadPromise;
      res.json({ success: true, url: secureUrl });
      return;
    }

    // Fallback: save to public/uploads directory
    const uploadsDir = path.resolve(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname) || ".jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    res.json({ success: true, url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("[Upload Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to upload image." });
  }
});

export default router;
