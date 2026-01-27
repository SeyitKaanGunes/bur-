import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Prompt injection koruması - genişletilmiş pattern listesi
const DANGEROUS_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(previous|above|all|prior|earlier)\s+instructions/gi,
  /disregard\s+(all|any|the|previous)?\s*instructions/gi,
  /forget\s+(everything|all|previous)/gi,
  /override\s+(previous|all|system)/gi,
  /bypass\s+(the|all|any)?\s*(filter|restriction|rule)/gi,

  // Role manipulation
  /you\s+are\s+(now|actually|really)\s+/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(if|though|a)/gi,
  /roleplay\s+as/gi,
  /simulate\s+being/gi,
  /impersonate/gi,

  // System prompt extraction
  /what\s+(are|is)\s+your\s+(system|initial)\s+(prompt|instruction)/gi,
  /show\s+(me\s+)?your\s+(system|original)\s+prompt/gi,
  /reveal\s+your\s+(instructions|programming)/gi,
  /print\s+your\s+(system|initial)\s+prompt/gi,

  // Chat format markers
  /system\s*:/gi,
  /assistant\s*:/gi,
  /user\s*:/gi,
  /human\s*:/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /<\|assistant\|>/gi,
  /<<SYS>>/gi,
  /<\/SYS>/gi,

  // Jailbreak attempts
  /jailbreak/gi,
  /dan\s+mode/gi,
  /developer\s+mode/gi,
  /do\s+anything\s+now/gi,

  // Code injection markers
  /```\s*(python|javascript|bash|sh|cmd)/gi,
  /exec\s*\(/gi,
  /eval\s*\(/gi,
];

export function sanitizeUserInput(input: string, maxLength = 500): string {
  let sanitized = input.trim();

  // HTML karakterlerini escape et (XSS koruması)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Tehlikeli prompt injection pattern'leri temizle
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }

  // Null byte'ları temizle
  sanitized = sanitized.replace(/\0/g, '');

  // Maksimum uzunluk
  return sanitized.slice(0, maxLength);
}

// HTML'den tehlikeli içeriği temizle
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Astroloji konusu doğrulama
const VALID_ASTROLOGY_TOPICS = [
  'aşk',
  'ilişki',
  'evlilik',
  'partner',
  'sevgili',
  'kariyer',
  'iş',
  'para',
  'finans',
  'sağlık',
  'enerji',
  'aile',
  'arkadaş',
  'gelecek',
  'burç',
  'gezegen',
  'ay',
  'güneş',
  'yükselen',
  'transit',
  'retro',
  'dolunay',
  'yeniay',
];

export function isValidAstrologyQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  return VALID_ASTROLOGY_TOPICS.some((topic) => lowerQuestion.includes(topic));
}

// Rate limit key oluşturucu
export function createRateLimitKey(identifier: string, action: string): string {
  return `${identifier}:${action}`;
}

// Security headers - API yanıtları için
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Cache-Control': 'no-store, max-age=0',
} as const;

// CSRF token üretimi
export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
