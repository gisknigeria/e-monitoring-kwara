import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeString, validateChatAttachments, validatePassword, validateMediaPayload } from './security.js';

test('sanitizeString removes control characters and trims input', () => {
  assert.equal(sanitizeString('  Hello\nWorld  '), 'Hello World');
  assert.equal(sanitizeString('  '), '');
});

test('validatePassword enforces a minimum strength', () => {
  assert.equal(validatePassword('weak'), false);
  assert.equal(validatePassword('StrongPass123!'), true);
});

test('validateMediaPayload rejects oversized or invalid media input', () => {
  assert.equal(validateMediaPayload([{ type: 'image', data: 'data:image/png;base64,abc' }]).valid, true);
  assert.equal(validateMediaPayload([{ type: 'image', data: 'not-a-data-url' }]).valid, false);
  const oversizedPayload = Buffer.from('a'.repeat(13 * 1024 * 1024)).toString('base64');
  assert.equal(validateMediaPayload([{ type: 'image', data: 'data:image/png;base64,' + oversizedPayload }]).valid, false);
});

test('validateChatAttachments accepts documents and rejects mismatched files', () => {
  const pdf = Buffer.from('small pdf').toString('base64');
  assert.equal(validateChatAttachments([{ type: 'document', name: 'report.pdf', data: `data:application/pdf;base64,${pdf}` }]).valid, true);
  assert.equal(validateChatAttachments([{ type: 'image', name: 'fake.png', data: `data:application/pdf;base64,${pdf}` }]).valid, false);
  assert.equal(validateChatAttachments(Array.from({ length: 4 }, () => ({ type: 'document', data: `data:application/pdf;base64,${pdf}` }))).valid, false);
});
