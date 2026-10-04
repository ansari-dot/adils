import { UploadService } from './upload.service.js';
import { Media } from './media.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuditLog } from '../admin/auditLog.model.js';

export const getAllMedia = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category && category !== 'all') {
    filter.category = category;
  }

  const mediaItems = await Media.find(filter).sort({ createdAt: -1 });

  const formattedItems = mediaItems.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    url: doc.url,
    sizeBytes: doc.sizeBytes,
    category: doc.category,
    uploadedAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
  }));

  res.status(200).json(new ApiResponse(200, formattedItems, 'Media assets retrieved successfully'));
});

export const uploadSingle = asyncHandler(async (req, res) => {
  let fileUrl = '';
  let fileName = req.body.name || 'Uploaded Media Asset';
  let sizeBytes = req.body.sizeBytes || 0;

  if (req.file) {
    const fileData = await UploadService.uploadFile(req.file);
    fileUrl = fileData.url || fileData.secure_url;
    fileName = req.file.originalname || fileName;
    sizeBytes = req.file.size || sizeBytes;
  } else if (req.body.url) {
    fileUrl = req.body.url;
  } else {
    throw new ApiError(400, 'Image file or asset URL is required');
  }

  const mediaDoc = await Media.create({
    name: fileName,
    type: req.body.type || (fileUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
    url: fileUrl,
    sizeBytes,
    category: req.body.category || 'product',
    uploader: req.user?._id,
  });

  if (req.user) {
    await AuditLog.create({
      adminName: req.user.name || 'Administrator',
      adminEmail: req.user.email || 'admin@bakery.com',
      action: `Uploaded new media asset: ${fileName}`,
      resourceType: 'media',
      resourceId: mediaDoc._id.toString(),
    });
  }

  const formatted = {
    id: mediaDoc._id.toString(),
    name: mediaDoc.name,
    type: mediaDoc.type,
    url: mediaDoc.url,
    sizeBytes: mediaDoc.sizeBytes,
    category: mediaDoc.category,
    uploadedAt: mediaDoc.createdAt.toISOString(),
  };

  res.status(201).json(new ApiResponse(201, formatted, 'Media asset created successfully'));
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const mediaDoc = await Media.findByIdAndDelete(req.params.id);
  if (!mediaDoc) {
    throw new ApiError(404, 'Media asset not found');
  }

  if (req.user) {
    await AuditLog.create({
      adminName: req.user.name || 'Administrator',
      adminEmail: req.user.email || 'admin@bakery.com',
      action: `Deleted media asset: ${mediaDoc.name}`,
      resourceType: 'media',
      resourceId: mediaDoc._id.toString(),
    });
  }

  res.status(200).json(new ApiResponse(200, null, 'Media asset deleted successfully'));
});

export const updateMedia = asyncHandler(async (req, res) => {
  const { name, category, url, type } = req.body;
  const updateFields = {};
  if (name) updateFields.name = name;
  if (category) updateFields.category = category;
  if (url) updateFields.url = url;
  if (type) updateFields.type = type;

  const mediaDoc = await Media.findByIdAndUpdate(req.params.id, updateFields, { new: true });
  if (!mediaDoc) {
    throw new ApiError(404, 'Media asset not found');
  }

  const formatted = {
    id: mediaDoc._id.toString(),
    name: mediaDoc.name,
    type: mediaDoc.type,
    url: mediaDoc.url,
    sizeBytes: mediaDoc.sizeBytes,
    category: mediaDoc.category,
    uploadedAt: mediaDoc.createdAt ? mediaDoc.createdAt.toISOString() : new Date().toISOString(),
  };

  res.status(200).json(new ApiResponse(200, formatted, 'Media asset updated successfully'));
});
