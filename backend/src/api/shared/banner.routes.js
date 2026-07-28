import express from 'express';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../services/banner.service.js';
import { uploadBanners } from '../../core/middlewares/upload.middleware.js';

const router = express.Router();

// POST /api/banners/upload
router.post('/upload', uploadBanners.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${process.env.CDN_URL}/banners/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// GET /api/banners
// Optional query param: ?all=true to fetch inactive ones as well (for admin)
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const banners = await getAllBanners(includeInactive);
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// POST /api/banners (Admin only - basic implementation without auth middleware for now, just matching other shared routes)
router.post('/', async (req, res) => {
  try {
    const { image_url, target_link, sort_order, is_active } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }
    const newBanner = await createBanner({ image_url, target_link, sort_order, is_active });
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// PUT /api/banners/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, target_link, sort_order, is_active } = req.body;
    const updatedBanner = await updateBanner(id, { image_url, target_link, sort_order, is_active });
    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// DELETE /api/banners/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteBanner(id);
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

export default router;