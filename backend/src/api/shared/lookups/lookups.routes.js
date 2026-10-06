import express from 'express';
import { lookupsController } from './lookups.controller.js';

const router = express.Router();

router.get('/', lookupsController.getAllLookups);
router.get('/:key', lookupsController.getLookupByKey);

export default router;
