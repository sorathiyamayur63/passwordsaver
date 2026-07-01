import { AuditLog } from '../models/index.js';

/**
 * GET /api/notifications
 * Returns recent audit log entries formatted as user-facing notifications.
 * Includes IP geolocation alerts for logins from new/different IPs.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const EXCLUDED_ACTIONS = ['VAULT_VIEW'];
    const limit = Math.min(parseInt(req.query.limit) || 25, 50);

    const logs = await AuditLog.find({
      userId: req.userId,
      action: { $nin: EXCLUDED_ACTIONS }
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('action resourceType resourceUuid timestamp success ipAddress userAgent')
      .lean();

    // ── IP Geolocation Alert Logic ─────────────────────────────────────────
    // Collect successful login IPs (chronological order) to detect new IPs
    const loginLogs = await AuditLog.find({
      userId: req.userId,
      action: 'LOGIN_SUCCESS',
      ipAddress: { $exists: true, $ne: null }
    })
      .sort({ timestamp: 1 }) // oldest first to detect "first seen" IPs
      .select('ipAddress timestamp')
      .lean();

    // Build a set of "known" IPs — IPs seen more than once are "familiar"
    const ipSeen = new Map(); // ip -> first seen timestamp
    loginLogs.forEach(log => {
      if (!ipSeen.has(log.ipAddress)) {
        ipSeen.set(log.ipAddress, log.timestamp);
      }
    });

    // Any IP that only appears once (first login from that IP) is "new"
    const ipFirstSeen = new Map();
    loginLogs.forEach(log => {
      if (!ipFirstSeen.has(log.ipAddress)) {
        ipFirstSeen.set(log.ipAddress, log.timestamp);
      }
    });

    // ── Shape into notification objects ───────────────────────────────────
    const notifications = [];

    for (const log of logs) {
      const base = {
        _id: log._id?.toString(),
        action: log.action,
        resourceType: log.resourceType || null,
        resourceUuid: log.resourceUuid || null,
        success: log.success !== false,
        timestamp: log.timestamp
      };

      // For LOGIN_SUCCESS, check if this is a "new" IP alert
      if (log.action === 'LOGIN_SUCCESS' && log.ipAddress) {
        const firstSeenAt = ipFirstSeen.get(log.ipAddress);
        const isFirstTimeFromThisIP =
          firstSeenAt &&
          Math.abs(new Date(firstSeenAt).getTime() - new Date(log.timestamp).getTime()) < 5000;

        // Count how many times this IP has been used
        const timesUsed = loginLogs.filter(l => l.ipAddress === log.ipAddress).length;

        if (isFirstTimeFromThisIP && timesUsed === 1) {
          // First ever login from this IP — flag as geolocation alert
          notifications.push({
            ...base,
            action: 'LOGIN_NEW_LOCATION',
            ipAddress: log.ipAddress,
            userAgent: log.userAgent || null
          });
          continue;
        }

        // Regular login — include but with ip info for context
        notifications.push({
          ...base,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent || null
        });
        continue;
      }

      notifications.push(base);
    }

    res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
};
