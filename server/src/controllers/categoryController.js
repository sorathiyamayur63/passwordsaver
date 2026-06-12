import { Category, VaultItem, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';

export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ userId: req.userId })
      .select('-_id -__v')
      .sort({ order: 1, name: 1 });

    // Auto-initialize defaults if account is entirely fresh
    if (categories.length === 0) {
      const defaults = Category.getDefaultsForUser(req.userId);
      await Category.insertMany(defaults);
      categories = await Category.find({ userId: req.userId })
        .select('-_id -__v')
        .sort({ order: 1, name: 1 });
    }

    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    const existing = await Category.findOne({ userId: req.userId, name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }

    const category = await Category.create({
      userId: req.userId,
      name,
      icon: icon || 'folder',
      color: color || '#6b7280',
      isDefault: false
    });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'CATEGORY_CREATE',
      resourceType: 'category',
      resourceUuid: category.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeCategory = category.toObject();
    delete safeCategory._id;
    delete safeCategory.__v;

    res.status(201).json({ success: true, data: { category: safeCategory } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = req.resource;
    const { name, icon, color } = req.body;

    if (category.isDefault && name && name !== category.name) {
      return res.status(403).json({ success: false, message: 'Cannot rename default system categories' });
    }

    if (name) {
      const existing = await Category.findOne({ 
        userId: req.userId, 
        name: new RegExp(`^${name}$`, 'i'), 
        uuid: { $ne: category.uuid } 
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Category name already exists' });
      }
      category.name = name;
    }
    
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    const safeCategory = category.toObject();
    delete safeCategory._id;
    delete safeCategory.__v;

    res.status(200).json({ success: true, data: { category: safeCategory } });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = req.resource;

    if (category.isDefault) {
      return res.status(403).json({ success: false, message: 'Cannot delete default system categories' });
    }

    // Detach category safely from all associated vault items (Soft detachment)
    await VaultItem.updateMany(
      { userId: req.userId, categoryUuid: category.uuid },
      { $unset: { categoryUuid: 1 } }
    );

    await Category.deleteOne({ _id: category._id, userId: req.userId });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'CATEGORY_DELETE',
      resourceType: 'category',
      resourceUuid: category.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req, res, next) => {
  try {
    const { orderings } = req.body; // array of { uuid, order }
    
    if (!Array.isArray(orderings)) {
      return res.status(400).json({ success: false, message: 'orderings must be an array' });
    }

    const bulkOps = orderings.map(item => ({
      updateOne: {
        filter: { uuid: item.uuid, userId: req.userId },
        update: { $set: { order: item.order } }
      }
    }));

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
};