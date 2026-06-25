import { AuditLog } from '../models/index.js';

/**
 * GET /api/notifications
 * Returns recent audit log entries formatted as user-facing notifications.
 * Excludes low-signal events like VAULT_VIEW.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const EXCLUDED_ACTIONS = ['VAULT_VIEW', 'LOGIN_FAIL'];
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const logs = await AuditLog.find({
      userId: req.userId,
      action: { $nin: EXCLUDED_ACTIONS }
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('action resourceType resourceUuid timestamp success')
      .lean();

    // Shape into notification objects — use the Mongo _id as a stable string ID
    const notifications = logs.map(log => ({
      _id: log._id?.toString(),
      action: log.action,
      resourceType: log.resourceType || null,
      resourceUuid: log.resourceUuid || null,
      success: log.success !== false,
      timestamp: log.timestamp
    }));

    res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
};
