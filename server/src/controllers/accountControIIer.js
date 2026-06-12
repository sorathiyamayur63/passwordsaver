import { User, VaultItem, Category, Template, Device, Session, AuditLog } from '../models/index.js';
import { verifyPassword } from '../services/authService.js';
import { hashIp } from '../services/deviceService.js';
import { securityConfig } from '../config/security.js';

export const getUserProfile = async (req, res, next) => {
  try {
    // Fetch user and include vaultKeySalt specifically so the client can re-derive the key if needed
    const user = await User.findById(req.userId).select('+vaultKeySalt -passwordHash');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = user.toSafeObject();
    safeUser.vaultKeySalt = user.vaultKeySalt; // Attach specifically for Phase 11 profile re-derivation needs

    res.status(200).json({ success: true, data: { user: safeUser } });
  } catch (error) {
    next(error);
  }
};

export const updateUsername = async (req, res, next) => {
  try {
    const { newUsername, currentPassword } = req.body;

    const user = await User.findById(req.userId).select('+passwordHash');

    const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const existing = await User.findOne({ username: new RegExp(`^${newUsername}$`, 'i'), _id: { $ne: user._id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username is already taken' });
    }

    user.username = newUsername;
    await user.save();

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'ACCOUNT_UPDATE',
      details: { field: 'username' },
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Username updated successfully', data: { user: user.toSafeObject() } });
  } catch (error) {
    next(error);
  }
};

export const exportUserData = async (req, res, next) => {
  try {
    const [vaultItems, categories, templates] = await Promise.all([
      VaultItem.find({ userId: req.userId, isDeleted: false }).select('-_id -__v -userId'),
      Category.find({ userId: req.userId }).select('-_id -__v -userId'),
      Template.find({ userId: req.userId }).select('-_id -__v -userId')
    ]);

    const exportData = {
      user: req.user.toSafeObject(),
      encryptedVaultItems: vaultItems, // Encrypted! Only client can decrypt
      categories,
      templates,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'VAULT_EXPORT',
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Disposition', `attachment; filename="passwordsaver-export-${dateStr}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findById(req.userId).select('+passwordHash');

    if (user.username !== username) {
      return res.status(400).json({ success: false, message: 'Username confirmation does not match' });
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'ACCOUNT_DELETE',
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    // Hard delete all associated data
    await Promise.all([
      VaultItem.deleteMany({ userId: req.userId }),
      Category.deleteMany({ userId: req.userId }),
      Template.deleteMany({ userId: req.userId }),
      Device.deleteMany({ userId: req.userId }),
      Session.deleteMany({ userId: req.userId }),
      AuditLog.deleteMany({ userId: req.userId }) // Optionally keep logs for legal reasons, but deleted per spec
    ]);

    await User.deleteOne({ _id: req.userId });

    // Clear cookies
    res.cookie('access_token', '', { ...securityConfig.cookie, maxAge: 0 });
    res.cookie('refresh_token', '', { ...securityConfig.cookie, maxAge: 0 });

    res.status(200).json({ success: true, message: 'Account deleted permanently' });
  } catch (error) {
    next(error);
  }
};