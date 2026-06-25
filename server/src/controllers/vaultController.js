import { VaultItem, Category, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';

export const getVaultItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    
    // Base ownership & soft-delete filter
    const query = { userId: req.userId, isDeleted: false };
    
    // Optional filters
    if (req.query.type) query.itemType = req.query.type;
    if (req.query.categoryUuid) query.categoryUuid = req.query.categoryUuid;
    if (req.query.isFavorite !== undefined) query.isFavorite = req.query.isFavorite === 'true';
    if (req.query.isArchived !== undefined) query.isArchived = req.query.isArchived === 'true';
    if (req.query.personUuid) query.personUuid = req.query.personUuid;
    if (req.query.groupUuid) query.groupUuid = req.query.groupUuid;

    // Sorting
    const validSortFields = ['lastModifiedAt', 'createdAt', 'lastUsedAt'];
    const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'lastModifiedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const total = await VaultItem.countDocuments(query);
    const items = await VaultItem.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-_id -__v'); // Never expose internal IDs

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVaultItem = async (req, res, next) => {
  try {
    const item = req.resource;
    
    item.lastUsedAt = new Date();
    await item.save();

    const safeItem = item.toObject();
    delete safeItem._id;
    delete safeItem.__v;

    res.status(200).json({ success: true, data: { item: safeItem } });
  } catch (error) {
    next(error);
  }
};

export const createVaultItem = async (req, res, next) => {
  try {
    const { 
      encryptedData, iv, authTag, itemType, 
      encryptedTitle, titleIv, titleAuthTag, categoryUuid, personUuid, groupUuid, tags 
    } = req.body;

    if (categoryUuid) {
      const category = await Category.findOne({ uuid: categoryUuid, userId: req.userId });
      if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const item = await VaultItem.create({
      userId: req.userId,
      userUuid: req.userUuid,
      encryptedData,
      iv,
      authTag,
      itemType,
      encryptedTitle,
      titleIv,
      titleAuthTag,
      categoryUuid,
      personUuid: personUuid || null,
      groupUuid: groupUuid || null,
      tags: tags || []
    });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_CREATE',
      resourceType: 'vault_item',
      resourceUuid: item.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeItem = item.toObject();
    delete safeItem._id;
    delete safeItem.__v;

    res.status(201).json({ success: true, data: { item: safeItem } });
  } catch (error) {
    next(error);
  }
};

export const updateVaultItem = async (req, res, next) => {
  try {
    const item = req.resource;
    const updates = req.body;

    // Cryptographic cohesion check
    if (updates.encryptedData && (!updates.iv || !updates.authTag)) {
      return res.status(400).json({ success: false, message: 'Partial cryptographic updates are forbidden. Provide data, iv, and authTag.' });
    }

    if (updates.categoryUuid) {
      const category = await Category.findOne({ uuid: updates.categoryUuid, userId: req.userId });
      if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
      item.categoryUuid = updates.categoryUuid;
    }

    const updatableFields = ['encryptedData', 'iv', 'authTag', 'encryptedTitle', 'titleIv', 'titleAuthTag', 'isFavorite', 'isArchived', 'tags', 'personUuid', 'groupUuid'];
    updatableFields.forEach(field => {
      if (updates[field] !== undefined) item[field] = updates[field];
    });

    item.lastModifiedAt = new Date();
    await item.save();

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_UPDATE',
      resourceType: 'vault_item',
      resourceUuid: item.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeItem = item.toObject();
    delete safeItem._id;
    delete safeItem.__v;

    res.status(200).json({ success: true, data: { item: safeItem } });
  } catch (error) {
    next(error);
  }
};

export const deleteVaultItem = async (req, res, next) => {
  try {
    const item = req.resource;
    
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.isFavorite = false; 
    await item.save();

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_DELETE',
      resourceType: 'vault_item',
      resourceUuid: item.uuid,
      details: { soft: true },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Item moved to trash' });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteVaultItem = async (req, res, next) => {
  try {
    const item = req.resource;
    
    // Safety check ensuring it was already in the trash
    if (!item.isDeleted) {
      return res.status(400).json({ success: false, message: 'Item must be moved to trash before permanent deletion' });
    }

    await VaultItem.deleteOne({ _id: item._id, userId: req.userId });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_DELETE',
      resourceType: 'vault_item',
      resourceUuid: item.uuid,
      details: { permanent: true },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Item permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const restoreVaultItem = async (req, res, next) => {
  try {
    const item = req.resource;
    
    if (!item.isDeleted) {
      return res.status(400).json({ success: false, message: 'Item is not in trash' });
    }

    item.isDeleted = false;
    item.deletedAt = undefined;
    item.lastModifiedAt = new Date();
    await item.save();

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_UPDATE',
      resourceType: 'vault_item',
      resourceUuid: item.uuid,
      details: { action: 'restore' },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Item restored successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTrashItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    
    const query = { userId: req.userId, isDeleted: true };
    const total = await VaultItem.countDocuments(query);
    
    const items = await VaultItem.find(query)
      .sort({ deletedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-_id -__v');

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const emptyTrash = async (req, res, next) => {
  try {
    const result = await VaultItem.deleteMany({ userId: req.userId, isDeleted: true });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_DELETE',
      details: { action: 'empty_trash', count: result.deletedCount },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: `${result.deletedCount} items permanently deleted` });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const item = req.resource;
    item.isFavorite = !item.isFavorite;
    item.lastModifiedAt = new Date();
    await item.save();

    const safeItem = item.toObject();
    delete safeItem._id;
    delete safeItem.__v;

    res.status(200).json({ success: true, data: { item: safeItem } });
  } catch (error) {
    next(error);
  }
};

export const duplicateVaultItem = async (req, res, next) => {
  try {
    const sourceItem = req.resource;
    
    const duplicate = await VaultItem.create({
      userId: req.userId,
      userUuid: req.userUuid,
      encryptedData: sourceItem.encryptedData,
      iv: sourceItem.iv,
      authTag: sourceItem.authTag,
      itemType: sourceItem.itemType,
      encryptedTitle: sourceItem.encryptedTitle,
      titleIv: sourceItem.titleIv,
      categoryUuid: sourceItem.categoryUuid,
      tags: sourceItem.tags,
      isFavorite: false,
      isArchived: false
    });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_CREATE',
      resourceType: 'vault_item',
      resourceUuid: duplicate.uuid,
      details: { duplicatedFrom: sourceItem.uuid },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeItem = duplicate.toObject();
    delete safeItem._id;
    delete safeItem.__v;

    res.status(201).json({ success: true, data: { item: safeItem } });
  } catch (error) {
    next(error);
  }
};

export const getRecentItems = async (req, res, next) => {
  try {
    const [recentlyUsed, recentlyCreated, recentlyModified] = await Promise.all([
      VaultItem.find({ userId: req.userId, isDeleted: false, lastUsedAt: { $ne: null } })
        .sort({ lastUsedAt: -1 }).limit(10).select('-_id -__v'),
      VaultItem.find({ userId: req.userId, isDeleted: false })
        .sort({ createdAt: -1 }).limit(10).select('-_id -__v'),
      VaultItem.find({ userId: req.userId, isDeleted: false })
        .sort({ lastModifiedAt: -1 }).limit(10).select('-_id -__v')
    ]);

    res.status(200).json({
      success: true,
      data: { recentlyUsed, recentlyCreated, recentlyModified }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateVaultItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items must be an array' });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { uuid: item.uuid, userId: req.userId },
        update: {
          $set: {
            encryptedData: item.encryptedData,
            iv: item.iv,
            authTag: item.authTag,
            encryptedTitle: item.encryptedTitle,
            titleIv: item.titleIv,
            titleAuthTag: item.titleAuthTag,
            lastModifiedAt: new Date()
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await VaultItem.bulkWrite(bulkOps);
    }
    
    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_UPDATE',
      details: { action: 'bulk_reencrypt', count: items.length },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Items updated successfully' });
  } catch (error) {
    next(error);
  }
};