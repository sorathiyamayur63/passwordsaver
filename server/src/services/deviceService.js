import crypto from 'crypto';
import { Device } from '../models/index.js';

export const getDeviceFingerprint = (req) => {
  const ua = req.headers['user-agent'] || '';
 // const ip = req.ip || '';
 const ip = (req.ip || '').replace('::1','127.0.0.1');
  const lang = req.headers['accept-language'] || '';
  const enc = req.headers['accept-encoding'] || '';

  const rawFingerprint = `${ua}|${ip}|${lang}|${enc}`;
  return crypto.createHash('sha256').update(rawFingerprint).digest('hex');
};

// export const parseUserAgent = (uaString) => {
//   if (!uaString) return { browser: 'Unknown', os: 'Unknown', deviceType: 'unknown' };

//   let browser = 'Unknown';
//   if (/Edg/i.test(uaString)) browser = 'Edge';
//   else if (/Chrome/i.test(uaString)) browser = 'Chrome';
//   else if (/Firefox/i.test(uaString)) browser = 'Firefox';
//   else if (/Safari/i.test(uaString) && !/Chrome/i.test(uaString)) browser = 'Safari';

//   let os = 'Unknown';
//   if (/Windows NT 10.0/i.test(uaString)) os = 'Windows 10/11';
//   else if (/Windows NT/i.test(uaString)) os = 'Windows';
//   else if (/Mac OS X/i.test(uaString)) os = 'macOS';
//   else if (/Android/i.test(uaString)) os = 'Android';
//   else if (/iPhone|iPad|iPod/i.test(uaString)) os = 'iOS';
//   else if (/Linux/i.test(uaString)) os = 'Linux';

//   const deviceType = /Mobile|Android|iP(hone|od|ad)/i.test(uaString) ? 'mobile' : 'desktop';

//   return { browser, os, deviceType };
// };

export const parseUserAgent = (uaString) => {
  if (!uaString) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      deviceType: 'unknown'
    };
  }

  let browser = 'Unknown';
  let browserVersion = '';

  const chrome = uaString.match(/Chrome\/([\d.]+)/i);
  const firefox = uaString.match(/Firefox\/([\d.]+)/i);
  const edge = uaString.match(/Edg\/([\d.]+)/i);
  const safari = uaString.match(/Version\/([\d.]+).*Safari/i);
  const opera = uaString.match(/OPR\/([\d.]+)/i);

if (edge) {
  browser = 'Edge';
  browserVersion = edge[1];

} else if (opera) {
  browser = 'Opera';
  browserVersion = opera[1];

} else if (chrome) {
  browser = 'Chrome';
  browserVersion = chrome[1];

} else if (firefox) {
  browser = 'Firefox';
  browserVersion = firefox[1];

} else if (safari) {
  browser = 'Safari';
  browserVersion = safari[1];
}


  let os = 'Unknown';
  let osVersion = '';

  const windows = uaString.match(/Windows NT ([\d.]+)/i);
  const android = uaString.match(/Android ([\d.]+)/i);
  const ios = uaString.match(/OS ([\d_]+)/i);

  if (windows) {
    os = 'Windows';
    osVersion = windows[1];
  } else if (/Mac OS X/i.test(uaString)) {
    os = 'macOS';
  } else if (android) {
    os = 'Android';
    osVersion = android[1];
  } else if (ios) {
    os = 'iOS';
    osVersion = ios[1].replace(/_/g, '.');
  } else if (/Linux/i.test(uaString)) {
    os = 'Linux';
  }

  const deviceType =
    /Mobile|Android|iP(hone|od|ad)/i.test(uaString)
      ? 'mobile'
      : 'desktop';

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType
  };
};


export const hashIp = (ip) => {
  if (!ip) return null;
  const cleanIp = ip.replace(/^::ffff:/, ''); // Remove IPv6 prefix if IPv4-mapped
  return crypto.createHash('sha256').update(cleanIp).digest('hex');
};


const getClientIp = (req) => {
  let ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.ip;

  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  if (ip?.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
};

export const getOrCreateDevice = async (userId, req) => {
  const deviceFingerprint = getDeviceFingerprint(req);
  const uaString = req.headers['user-agent'] || '';
  //const { browser, os } = parseUserAgent(uaString);
  const {
    browser,
    browserVersion,
    os,
    osVersion
  } = parseUserAgent(uaString);

  // const ipHash = hashIp(req.ip);
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);


  // const device = await Device.findOneAndUpdate(
  //   { userId, deviceFingerprint },
  //   {
  //     // $set: {
  //     //   lastActiveAt: new Date(),
  //     //   ipHash
  //     // },
  //     $set: {
  //       lastActiveAt: new Date(),ip,ipHash},

  //     $setOnInsert: {
  //       //deviceName: `${browser} on ${os}`,
  //       deviceName: `${browser} ${browserVersion} on ${os} ${osVersion}`.trim(),
  //       browser,
  //       os,
  //       isTrusted: false,
  //       isCurrent: true,
  //       isRevoked: false
  //     }
  //   },
  //   { new: true, upsert: true }
  // );

  const device = await Device.findOneAndUpdate(
  { 
    userId, 
    deviceFingerprint 
  },
  {
$set: {
  lastActiveAt: new Date(),
  ip,
  ipHash,
  isRevoked: false,
  revokedAt: null,
  isCurrent: true,

  browser,
  browserVersion,
  os,
  osVersion,
  deviceName: `${browser} ${browserVersion} on ${os} ${osVersion}`.trim()
},
$setOnInsert: {
  isTrusted: false
}
  },
  {
    new:true,
    upsert:true
  }
);

  return device;
};