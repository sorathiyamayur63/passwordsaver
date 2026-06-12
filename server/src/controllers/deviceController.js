import { Device, Session, AuditLog } from '../models/index.js';
import { getDeviceFingerprint, hashIp } from '../services/deviceService.js';

export const getDevices = async (req, res, next) => {
  try {
    const currentFingerprint = getDeviceFingerprint(req);
    const devices = await Device.find({ userId: req.userId })
      .sort({ lastActiveAt: -1 })
      .select('-_id -__v');

    const mappedDevices = devices.map(device => {
      // const isCurrent = device.deviceFingerprint === currentFingerprint;
      // return { ...device.toObject(), isCurrent };
      const isCurrent =
  device.deviceFingerprint === currentFingerprint &&
  !device.isRevoked;

return { 
  ...device.toObject(), 
  isCurrent 
};
   
   
    });

    res.status(200).json({ success: true, data: { devices: mappedDevices } });
  } catch (error) {
    next(error);
  }
};

export const revokeDevice = async (req, res, next) => {
  try {
    const device = req.resource; // Provided by verifyOwnership
    const currentFingerprint = getDeviceFingerprint(req);

    if (device.deviceFingerprint === currentFingerprint) {
      return res.status(400).json({ success: false, message: 'Cannot revoke your current active device. Please sign out instead.' });
    }

    if (device.isRevoked) {
      return res.status(400).json({ success: false, message: 'Device is already revoked.' });
    }

    device.isRevoked = true;
    device.isCurrent = false;
    device.revokedAt = new Date();
    await device.save();

    // Invalidate all active sessions tied to this device
    // await Session.updateMany(
    //   { userId: req.userId, deviceUuid: device.uuid },
    //   { $set: { isValid: false } }
    // );
    if (device.deviceFingerprint !== currentFingerprint) {
  await Session.updateMany(
    {
      userId: req.userId,
      deviceUuid: device.uuid
    },
    {
      $set: { isValid: false }
    }
  );
}

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'DEVICE_REVOKE',
      resourceType: 'device',
      resourceUuid: device.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Device revoked successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (req, res, next) => {
  try {
    const device = req.resource;

    await Device.deleteOne({
      uuid: device.uuid,
      userId: req.userId
    });

    res.status(200).json({
      success: true,
      message: 'Device removed from history'
    });

  } catch (error) {
    next(error);
  }
};


export const getLoginHistory = async (req, res, next) => {
  try {
    const history = await AuditLog.find({
      userId: req.userId,
      action: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAIL'] }
    })
      .sort({ timestamp: -1 })
      .limit(50)
      //.select('action timestamp userAgent success -_id'); // Exclude _id and ipHash for API clean response (IP is masked in UI)
      .select('action timestamp userAgent ipAddress success -_id');
    res.status(200).json({ success: true, data: { history } });
  } catch (error) {
    next(error);
  }
};