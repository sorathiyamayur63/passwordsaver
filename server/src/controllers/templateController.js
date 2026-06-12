import { Template, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';

export const getTemplates = async (req, res, next) => {
  try {
    let systemTemplatesCount = await Template.countDocuments({ isSystem: true });
    
    if (systemTemplatesCount === 0) {
      const defaults = Template.getSystemTemplates();
      await Template.insertMany(defaults);
    }

    // Fetch both system templates (userId: null) and user's custom templates
    const templates = await Template.find({
      $or: [{ isSystem: true }, { userId: req.userId }]
    }).select('-_id -__v').sort({ isSystem: -1, name: 1 });

    res.status(200).json({ success: true, data: { templates } });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { name, description, fields } = req.body;

    const template = await Template.create({
      userId: req.userId,
      isSystem: false,
      name,
      description,
      fields
    });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'TEMPLATE_CREATE',
      resourceType: 'template',
      resourceUuid: template.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeData = template.toObject();
    delete safeData._id;
    delete safeData.__v;

    res.status(201).json({ success: true, data: { template: safeData } });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = req.resource; // Provided securely by verifyOwnership
    const { name, description, fields } = req.body;

    if (template.isSystem) {
      return res.status(403).json({ success: false, message: 'Cannot modify system templates' });
    }

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (fields) template.fields = fields;

    await template.save();

    const safeData = template.toObject();
    delete safeData._id;
    delete safeData.__v;

    res.status(200).json({ success: true, data: { template: safeData } });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = req.resource;

    if (template.isSystem) {
      return res.status(403).json({ success: false, message: 'Cannot delete system templates' });
    }

    await Template.deleteOne({ _id: template._id });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'TEMPLATE_DELETE',
      resourceType: 'template',
      resourceUuid: template.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};