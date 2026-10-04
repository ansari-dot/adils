import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: {
      type: String,
      enum: ['product', 'order', 'custom_request', 'course', 'user', 'calculator', 'media', 'settings'],
      required: true,
    },
    resourceId: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
