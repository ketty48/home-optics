import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'safehome-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  res.send(req.file?.path);
});

export default router;