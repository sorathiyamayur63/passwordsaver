import { VaultItem, Category, Template, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export const createServerBackup = async (req, res, next) => {
  try {
    const [items, categories, templates] = await Promise.all([
      VaultItem.find({ userId: req.userId, isDeleted: false }).select('-_id -__v -userId'),
      Category.find({ userId: req.userId }).select('-_id -__v -userId'),
      Template.find({ userId: req.userId }).select('-_id -__v -userId')
    ]);

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'BACKUP_EXPORT',
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, data: { items, categories, templates } });
  } catch (error) {
    next(error);
  }
};

export const restoreFromBackup = async (req, res, next) => {
  try {
    const { items = [], categories = [], templates = [], mode = 'merge' } = req.body;

    // Security: Limit import sizes to prevent DB flooding
    const MAX_ITEMS = 500, MAX_CATEGORIES = 50, MAX_TEMPLATES = 50;
    if (items.length > MAX_ITEMS) return res.status(400).json({ success: false, message: `Too many items. Maximum is ${MAX_ITEMS}.` });
    if (categories.length > MAX_CATEGORIES) return res.status(400).json({ success: false, message: `Too many categories. Maximum is ${MAX_CATEGORIES}.` });
    if (templates.length > MAX_TEMPLATES) return res.status(400).json({ success: false, message: `Too many templates. Maximum is ${MAX_TEMPLATES}.` });

    // Validate required encrypted fields on each item
    const invalidItem = items.find(i => !i.encryptedData || !i.iv || !i.authTag || !i.itemType);
    if (invalidItem) return res.status(400).json({ success: false, message: 'Invalid item in backup: missing required encrypted fields.' });

    if (mode !== 'merge' && mode !== 'replace') {
      return res.status(400).json({ success: false, message: 'Mode must be "merge" or "replace".' });
    }

    if (mode === 'replace') {
      await Promise.all([
        VaultItem.deleteMany({ userId: req.userId }),
        Category.deleteMany({ userId: req.userId, isDefault: false }),
        Template.deleteMany({ userId: req.userId, isSystem: false })
      ]);
    }

    // Remap UUIDs to prevent collisions on merge, retaining relational integrity
    const categoryUuidMap = new Map();
    const templateUuidMap = new Map();

    const newCategories = categories.filter(c => !c.isDefault).map(cat => {
      const newUuid = uuidv4();
      categoryUuidMap.set(cat.uuid, newUuid);
      return { ...cat, uuid: newUuid, userId: req.userId, _id: new mongoose.Types.ObjectId() };
    });

    const newTemplates = templates.filter(t => !t.isSystem).map(tpl => {
      const newUuid = uuidv4();
      templateUuidMap.set(tpl.uuid, newUuid);
      return { ...tpl, uuid: newUuid, userId: req.userId, _id: new mongoose.Types.ObjectId() };
    });

    const newItems = items.map(item => {
      const mappedCategory = categoryUuidMap.get(item.categoryUuid) || item.categoryUuid;
      const mappedTemplate = templateUuidMap.get(item.templateUuid) || item.templateUuid;
      return {
        ...item,
        uuid: uuidv4(), // Always assign new UUID
        userId: req.userId,
        userUuid: req.userUuid,
        categoryUuid: mappedCategory,
        templateUuid: mappedTemplate,
        _id: new mongoose.Types.ObjectId()
      };
    });

    if (newCategories.length) await Category.insertMany(newCategories);
    if (newTemplates.length) await Template.insertMany(newTemplates);
    if (newItems.length) await VaultItem.insertMany(newItems);

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'BACKUP_IMPORT',
      details: { mode, importedItems: newItems.length, importedCategories: newCategories.length },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ 
      success: true, 
      message: 'Restore complete', 
      data: { imported: newItems.length, skipped: 0 } 
    });
  } catch (error) {
    next(error);
  }
};