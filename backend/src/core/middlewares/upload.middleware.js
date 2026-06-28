import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = (folderName) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads', folderName);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid-timestamp.ext
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', // Images
    'video/mp4', 'video/quicktime',          // Videos
    'application/pdf'                        // Resumes/KYC
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, MP4, MOV, PDF.`), false);
  }
};

const createUploader = (folderName) => {
  return multer({
    storage: storage(folderName),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100 MB max for videos
    },
    fileFilter: fileFilter
  });
};

export const uploadArtistMedia = createUploader('artist');
export const uploadHiringDocs = createUploader('hiring');
