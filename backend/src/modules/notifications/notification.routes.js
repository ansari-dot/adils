import express from 'express';
import { Notification } from './notification.model.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const formatted = notifications.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      read: doc.isRead,
      link: doc.link || '',
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    }));

    res.status(200).json(new ApiResponse(200, formatted, 'Notifications fetched successfully'));
  })
);

router.put(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
  })
);

router.put(
  '/read-all',
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  })
);

export default router;
