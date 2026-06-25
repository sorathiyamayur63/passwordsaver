import { Group, Person, VaultItem, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ userId: req.userId })
      .sort({ order: 1 })
      .select('-_id -__v')
      .lean();

    // Compute memberCount dynamically
    const groupUuids = groups.map(g => g.uuid);
    const counts = await Person.aggregate([
      { $match: { userId: req.userId, groupUuid: { $in: groupUuids } } },
      { $group: { _id: '$groupUuid', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const groupsWithCounts = groups.map(g => ({
      ...g,
      memberCount: countMap[g.uuid] || 0
    }));

    res.status(200).json({ success: true, data: { groups: groupsWithCounts } });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const existing = await Group.findOne({
      userId: req.userId,
      name: new RegExp(`^${escapeRegex(name.trim())}$`, 'i')
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A group with this name already exists' });
    }

    const maxOrder = await Group.findOne({ userId: req.userId }).sort({ order: -1 });
    const group = await Group.create({
      userId: req.userId,
      name: name.trim(),
      icon: icon || 'users',
      color: color || '#6366f1',
      order: maxOrder ? maxOrder.order + 1 : 0
    });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'GROUP_CREATE',
      resourceType: 'group',
      resourceUuid: group.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeGroup = group.toObject();
    delete safeGroup._id;
    delete safeGroup.__v;
    res.status(201).json({ success: true, data: { group: safeGroup } });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = req.resource;
    const { name, icon, color } = req.body;

    if (name && name.trim() !== group.name) {
      const existing = await Group.findOne({
        userId: req.userId,
        name: new RegExp(`^${escapeRegex(name.trim())}$`, 'i'),
        uuid: { $ne: group.uuid }
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A group with this name already exists' });
      }
      group.name = name.trim();
    }

    if (icon !== undefined) group.icon = icon;
    if (color !== undefined) group.color = color;
    group.updatedAt = new Date();
    await group.save();

    const safeGroup = group.toObject();
    delete safeGroup._id;
    delete safeGroup.__v;
    res.status(200).json({ success: true, data: { group: safeGroup } });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const group = req.resource;

    // Soft-delete all vault items belonging to people in this group
    await VaultItem.updateMany(
      { userId: req.userId, groupUuid: group.uuid, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), isFavorite: false } }
    );

    // Delete all people in this group
    await Person.deleteMany({ userId: req.userId, groupUuid: group.uuid });

    // Delete the group itself
    await Group.deleteOne({ _id: group._id, userId: req.userId });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'GROUP_DELETE',
      resourceType: 'group',
      resourceUuid: group.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderGroups = async (req, res, next) => {
  try {
    const { orderings } = req.body;
    if (!Array.isArray(orderings)) {
      return res.status(400).json({ success: false, message: 'Orderings must be an array' });
    }

    const bulkOps = orderings.map(({ uuid, order }) => ({
      updateOne: {
        filter: { uuid, userId: req.userId },
        update: { $set: { order } }
      }
    }));

    await Group.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Groups reordered' });
  } catch (error) {
    next(error);
  }
};
