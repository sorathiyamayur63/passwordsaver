import { calculateStrength } from './passwordUtils';
import { parse, isAfter, isBefore, addDays, differenceInDays, isValid, parseISO } from 'date-fns';

const extractPasswordField = (item) => {
  const data = item.decryptedData || {};
  return data.password || data.licenseKey || data.apiKey || null;
};

const parseExpiryDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle MM/YY format (Cards)
  if (/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(dateStr)) {
    const [month, year] = dateStr.includes('/') ? dateStr.split('/') : [dateStr.slice(0, 2), dateStr.slice(2, 4)];
    const parsed = parse(`01/${month}/20${year}`, 'dd/MM/yyyy', new Date());
    // Move to end of the month
    if (isValid(parsed)) return addDays(parsed, 30);
  }
  // Handle YYYY-MM-DD format (Passports, Licenses)
  const parsedIso = parseISO(dateStr);
  if (isValid(parsedIso)) return parsedIso;
  return null;
};

export const analyzePasswordStrength = (items) => {
  const weak = [];
  const fair = [];
  const strong = [];
  
  items.forEach(item => {
    const pass = extractPasswordField(item);
    if (!pass) return;
    
    const strength = calculateStrength(pass);
    const itemData = { uuid: item.uuid, title: item.decryptedData?.title || 'Untitled', score: strength.score };
    
    if (strength.score <= 1) weak.push(itemData);
    else if (strength.score === 2) fair.push(itemData);
    else strong.push(itemData);
  });

  return { 
    weak, fair, strong, 
    summary: { total: weak.length + fair.length + strong.length, weakCount: weak.length, fairCount: fair.length, strongCount: strong.length } 
  };
};

export const findReusedPasswords = (items) => {
  const passMap = new Map();

  items.forEach(item => {
    const pass = extractPasswordField(item);
    if (!pass) return;
    
    if (!passMap.has(pass)) passMap.set(pass, []);
    passMap.get(pass).push({ uuid: item.uuid, title: item.decryptedData?.title || 'Untitled' });
  });

  const reused = [];
  passMap.forEach((groupItems, pass) => {
    if (groupItems.length > 1) {
      reused.push({ 
        count: groupItems.length, 
        items: groupItems 
      });
    }
  });

  // Sort by highest reuse count
  return reused.sort((a, b) => b.count - a.count);
};

export const findOldPasswords = (items, thresholdDays = 90) => {
  const old = [];
  const now = new Date();

  items.forEach(item => {
    const pass = extractPasswordField(item);
    if (!pass || !item.lastModifiedAt) return;
    
    const daysSince = differenceInDays(now, new Date(item.lastModifiedAt));
    if (daysSince >= thresholdDays) {
      old.push({ uuid: item.uuid, title: item.decryptedData?.title || 'Untitled', daysOld: daysSince });
    }
  });

  return old.sort((a, b) => b.daysOld - a.daysOld);
};

export const findExpiringItems = (items) => {
  const expiringSoon = [];
  const expired = [];
  const now = new Date();
  const warningThreshold = addDays(now, 30);

  items.forEach(item => {
    const data = item.decryptedData || {};
    const expiryStr = data.expiryDate || data.expirationDate;
    if (!expiryStr) return;

    const expiryDate = parseExpiryDate(expiryStr);
    if (!expiryDate) return;

    const itemData = { uuid: item.uuid, title: data.title || 'Untitled', type: item.itemType, dateStr: expiryStr };

    if (isBefore(expiryDate, now)) {
      expired.push(itemData);
    } else if (isBefore(expiryDate, warningThreshold)) {
      expiringSoon.push({ ...itemData, daysLeft: differenceInDays(expiryDate, now) });
    }
  });

  return { expiringSoon, expired };
};

export const calculateVaultHealthScore = (items) => {
  if (!items || items.length === 0) {
    return { score: 0, grade: 'N/A', breakdown: {}, recommendations: ["Add items to your vault to generate a security score."] };
  }

  const passStrength = analyzePasswordStrength(items);
  const reused = findReusedPasswords(items);
  const old = findOldPasswords(items);
  const expiring = findExpiringItems(items);

  const totalPasswords = passStrength.summary.total;
  let score = 0;

  // 1. Weak Passwords (30 points)
  const weakPoints = totalPasswords === 0 ? 30 : 30 * (1 - (passStrength.summary.weakCount / totalPasswords));
  score += weakPoints;

  // 2. Reused Passwords (25 points)
  const reusedCount = reused.reduce((acc, group) => acc + group.count, 0);
  const reusedPoints = totalPasswords === 0 ? 25 : 25 * Math.max(0, (1 - (reusedCount / totalPasswords)));
  score += reusedPoints;

  // 3. Old Passwords (20 points)
  const oldPoints = totalPasswords === 0 ? 20 : 20 * Math.max(0, (1 - (old.length / totalPasswords)));
  score += oldPoints;

  // 4. Has Items (10 points)
  score += 10;

  // 5. Expiring Items (15 points)
  const totalExpiring = expiring.expired.length + expiring.expiringSoon.length;
  const expiryPoints = totalExpiring === 0 ? 15 : 15 * Math.max(0, (1 - (totalExpiring / 10))); // Arbitrary denominator to scale penalty
  score += expiryPoints;

  score = Math.round(score);

  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';

  const recommendations = [];
  if (passStrength.summary.weakCount > 0) {
    recommendations.push(`You have ${passStrength.summary.weakCount} weak password(s). Use the generator to create stronger ones.`);
  }
  if (reused.length > 0) {
    recommendations.push(`You are reusing passwords across ${reusedCount} accounts. Each account should have a unique password.`);
  }
  if (old.length > 0) {
    recommendations.push(`You have ${old.length} password(s) older than 90 days. Consider rotating them.`);
  }
  if (expiring.expired.length > 0) {
    recommendations.push(`You have ${expiring.expired.length} expired item(s). Please update or archive them.`);
  }
  if (expiring.expiringSoon.length > 0) {
    recommendations.push(`You have ${expiring.expiringSoon.length} item(s) expiring within 30 days.`);
  }

  if (recommendations.length === 0) {
    recommendations.push("Your vault is in excellent shape! Keep up the good work.");
  }

  return {
    score,
    grade,
    breakdown: { weak: Math.round(weakPoints), reused: Math.round(reusedPoints), old: Math.round(oldPoints), expiry: Math.round(expiryPoints) },
    recommendations,
    raw: { passStrength, reused, old, expiring }
  };
};