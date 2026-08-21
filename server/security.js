import { createHash, randomUUID } from 'node:crypto';

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 4000;
const MAX_REQUEST_BODY_BYTES = 20 * 1024 * 1024;

export function sanitizeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  return normalized.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
}

export function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export function validateMediaPayload(media) {
  const items = Array.isArray(media) ? media : [];
  const errors = [];
  if (items.length > 6) errors.push('Too many media items');
  for (const item of items.slice(0, 6)) {
    if (!item || typeof item !== 'object') {
      errors.push('Each media item must be an object');
      continue;
    }
    const type = String(item.type || '').toLowerCase();
    if (!['image', 'video'].includes(type)) {
      errors.push('Unsupported media type');
      continue;
    }
    const data = String(item.data || '');
    const match = data.match(/^data:(image\/(?:png|jpeg|webp)|video\/(?:webm|mp4));base64,([A-Za-z0-9+/]*={0,2})$/);
    if (!match) {
      errors.push('Unsupported or malformed media payload');
      continue;
    }
    const mime = match[1];
    if ((type === 'image') !== mime.startsWith('image/')) {
      errors.push('Declared media type does not match its MIME type');
      continue;
    }
    const payload = match[2];
    const bytes = Buffer.from(payload, 'base64').length;
    if (!bytes) {
      errors.push('Media payload is empty');
      continue;
    }
    if (bytes > MAX_MEDIA_BYTES) {
      errors.push('Media payload is too large');
      continue;
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateChatAttachments(attachments) {
  const items = Array.isArray(attachments) ? attachments : [];
  const errors = [];
  let totalBytes = 0;
  if (items.length > 3) errors.push('A chat message can contain at most 3 attachments');
  const allowedMime = /^(image\/(?:png|jpeg|webp)|video\/(?:webm|mp4)|application\/(?:pdf|msword|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.(?:wordprocessingml\.document|spreadsheetml\.sheet))|text\/(?:plain|csv))$/;
  for (const item of items.slice(0, 3)) {
    if (!item || typeof item !== 'object') { errors.push('Each attachment must be an object'); continue; }
    const type = String(item.type || '').toLowerCase();
    if (!['image', 'video', 'document'].includes(type)) { errors.push('Unsupported attachment type'); continue; }
    const data = String(item.data || '');
    const match = data.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})$/);
    if (!match || !allowedMime.test(match[1])) { errors.push('Unsupported or malformed chat attachment'); continue; }
    const mime = match[1];
    if ((type === 'image') !== mime.startsWith('image/') || (type === 'video') !== mime.startsWith('video/')) {
      if (type !== 'document' || mime.startsWith('image/') || mime.startsWith('video/')) errors.push('Attachment type does not match its MIME type');
    }
    const bytes = Buffer.from(match[2], 'base64').length;
    totalBytes += bytes;
    if (!bytes) errors.push('Attachment is empty');
    if (bytes > 5 * 1024 * 1024) errors.push('Each chat attachment must be 5 MB or smaller');
  }
  if (totalBytes > 7 * 1024 * 1024) errors.push('Chat attachments must be 7 MB or smaller in total');
  return { valid: errors.length === 0, errors, totalBytes };
}

export function isSafeIdentifier(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9._:-]{1,120}$/.test(value);
}

export function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export function createRateLimitState() {
  const map = new Map();
  return {
    hit(key, limit = 20, windowMs = 60_000) {
      const now = Date.now();
      const entry = map.get(key);
      if (!entry) {
        if (map.size > 10_000) {
          for (const [storedKey, value] of map) {
            if (value.resetAt <= now) map.delete(storedKey);
          }
        }
        map.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
      }
      if (now > entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + windowMs;
        return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
      }
      entry.count += 1;
      return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
    },
    clear(key) {
      map.delete(key);
    },
  };
}

export function validateContentLength(bytes) {
  return bytes <= MAX_REQUEST_BODY_BYTES;
}

export function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
}

export function validateEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCoordinates(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function validateExternalUrl(value, protocols = ['https:']) {
  try {
    const url = new URL(String(value));
    return protocols.includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function credentialFingerprint(passwordHash) {
  return createHash('sha256').update(String(passwordHash)).digest('base64url').slice(0, 22);
}
