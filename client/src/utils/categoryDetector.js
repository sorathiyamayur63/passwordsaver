// Category auto-detection based on item data keywords
const CATEGORY_KEYWORDS = {
  'Social Media': [
    'instagram', 'facebook', 'twitter', 'x.com', 'tiktok', 'snapchat',
    'discord', 'linkedin', 'reddit', 'whatsapp', 'telegram', 'threads',
    'pinterest', 'tumblr', 'mastodon', 'social'
  ],
  'Finance': [
    'bank', 'paypal', 'stripe', 'crypto', 'wallet', 'investment',
    'trading', 'razorpay', 'paytm', 'gpay', 'phonepe', 'upi',
    'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'finance', 'stock',
    'mutual fund', 'zerodha', 'groww', 'upstox', 'binance', 'coinbase'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'ebay', 'walmart', 'shopify', 'aliexpress',
    'myntra', 'ajio', 'meesho', 'nykaa', 'shop', 'store', 'cart',
    'buy', 'order', 'ecommerce'
  ],
  'Entertainment': [
    'netflix', 'spotify', 'youtube', 'twitch', 'steam', 'disney',
    'hulu', 'prime video', 'hotstar', 'gaming', 'playstation', 'xbox',
    'epic games', 'music', 'movie', 'jiocinema', 'sonyliv', 'zee5',
    'crunchyroll', 'anime'
  ],
  'Development': [
    'github', 'gitlab', 'bitbucket', 'aws', 'azure', 'docker',
    'vercel', 'netlify', 'heroku', 'digitalocean', 'api', 'hosting',
    'stackoverflow', 'npm', 'dev.to', 'codepen', 'replit', 'render',
    'supabase', 'firebase', 'mongodb', 'redis', 'cloudflare',
    'developer', 'coding', 'programming'
  ],
  'Education': [
    'school', 'university', 'college', 'coursera', 'udemy', 'khan',
    'edx', 'classroom', 'lms', 'erp', 'student', 'academic',
    'byju', 'unacademy', 'skillshare', 'pluralsight', 'leetcode',
    'hackerrank', 'codeforces', 'learn'
  ],
  'Travel': [
    'airline', 'hotel', 'booking', 'airbnb', 'makemytrip', 'goibibo',
    'trip', 'flight', 'travel', 'expedia', 'trivago', 'irctc',
    'ola', 'uber', 'rapido'
  ],
  'Health': [
    'medical', 'fitness', 'health', 'hospital', 'pharmacy', 'doctor',
    'practo', 'apollo', 'pharmeasy', 'netmeds', 'gym', 'yoga',
    'meditation', 'wellness', 'healthcare'
  ],
  'Government': [
    'gov', 'aadhaar', 'passport', 'digilocker', 'nic.in', 'india.gov',
    'umang', 'epfo', 'income tax', 'gst', 'pan card', 'voter',
    'ration', 'municipality', 'government', 'official'
  ],
  'Business': [
    'slack', 'jira', 'notion', 'asana', 'trello', 'confluence',
    'zoom', 'teams', 'office', 'salesforce', 'hubspot', 'freshdesk',
    'monday', 'clickup', 'basecamp', 'work', 'company', 'corporate',
    'enterprise'
  ],
  'Personal': [
    'gmail', 'outlook', 'yahoo', 'proton', 'icloud', 'personal',
    'email', 'mail', 'hotmail', 'aol'
  ]
};

/**
 * Detect the best matching category for a vault item.
 * @param {Object} itemData - The decrypted vault item data (title, website, username, notes, etc.)
 * @param {Array} categories - Array of category objects from the store
 * @returns {string|null} - The UUID of the matched category, or UUID of "Other", or null
 */
export const detectCategory = (itemData, categories) => {
  if (!itemData || !categories || categories.length === 0) return null;

  let searchTokens = [];

  // Extract domain from website/url
  const extractDomainTokens = (urlStr) => {
    if (!urlStr) return [];
    try {
      let cleanedUrl = urlStr;
      if (!cleanedUrl.startsWith('http')) {
        cleanedUrl = 'https://' + cleanedUrl;
      }
      const urlObj = new URL(cleanedUrl);
      const hostname = urlObj.hostname; // e.g., onlinesbi.sbi.bank.in
      // Split by '.' and filter common TLDs to just get keywords like 'sbi', 'bank', 'instagram'
      return hostname.split('.').filter(part => part.length > 2 && !['com', 'org', 'net', 'edu', 'gov', 'co', 'www'].includes(part.toLowerCase()));
    } catch (e) {
      return [];
    }
  };

  const domainTokens = extractDomainTokens(itemData.website || itemData.url);
  
  // Combine all strings for generic search
  const textContent = [
    itemData.title,
    itemData.website,
    itemData.username,
    itemData.notes,
    itemData.url
  ].filter(Boolean).join(' ').toLowerCase();

  searchTokens = [...domainTokens.map(t => t.toLowerCase()), ...textContent.split(/[\s,.-_]+/)];

  if (searchTokens.length === 0 && !textContent.trim()) {
    const other = categories.find(c => c.name === 'Other');
    return other?.uuid || null;
  }

  // Score each category
  let bestMatch = null;
  let bestScore = 0;

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      // If the domain exactly contains the keyword (e.g. 'instagram' or 'bank')
      if (domainTokens.some(dt => dt.toLowerCase() === lowerKeyword)) {
        score += 3; // higher weight for domain matches
      }
      if (textContent.includes(lowerKeyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = categoryName;
    }
  }

  if (bestMatch) {
    const matched = categories.find(
      c => c.name.toLowerCase() === bestMatch.toLowerCase()
    );
    if (matched) return matched.uuid;
  }

  // Fallback to "Other"
  const other = categories.find(c => c.name === 'Other');
  return other?.uuid || null;
};
