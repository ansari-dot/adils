import express from 'express';
import { getAllMedia, uploadSingle, updateMedia, deleteMedia } from './upload.controller.js';
import { upload } from './upload.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllMedia);
router.post('/', upload.single('image'), uploadSingle);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

export default router;
