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
    const baseUploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../../uploads');
    const uploadPath = path.join(baseUploadDir, folderName);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid-timestamp.ext
    let ext = path.extname(file.originalname);
    
    // Fallback if no extension in originalname
    if (!ext) {
      const mimeMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'video/mp4': '.mp4',
        'video/quicktime': '.mov',
        'application/pdf': '.pdf',
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'audio/aac': '.aac',
        'audio/ogg': '.ogg',
        'audio/webm': '.webm',
        'audio/mp4': '.m4a',
        'audio/x-m4a': '.m4a'
      };
      ext = mimeMap[file.mimetype];
      if (!ext) {
        const mimeLower = file.mimetype.toLowerCase();
        if (mimeLower.includes('audio')) ext = '.mp3';
        else if (mimeLower.includes('video')) ext = '.mp4';
        else if (mimeLower.includes('image')) ext = '.jpg';
        else ext = '';
      }
    }

    const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype.toLowerCase();
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isAudio = mime.startsWith('audio/') || mime.includes('audio');
  const isPdf = mime === 'application/pdf';

  if (isImage || isVideo || isAudio || isPdf) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: Images, Videos, Audio, PDF.`), false);
  }
};

const createUploader = (folderName) => {
  return multer({
    storage: storage(folderName),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB max limit
    },
    fileFilter: fileFilter
  });
};

export const uploadArtistMedia = createUploader('artist');
export const uploadHiringDocs = createUploader('hiring');
export const uploadBanners = createUploader('banners');
