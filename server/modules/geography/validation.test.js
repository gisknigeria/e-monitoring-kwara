import test from 'node:test';
import assert from 'node:assert/strict';
import { validateKwaraAssignment } from './validation.js';

test('validateKwaraAssignment resolves a human-typed LGA to the dataset\'s canonical casing', () => {
  const result = validateKwaraAssignment({ state: 'Kwara', lga: 'Ibadan North' });
  assert.equal(result.lga, 'IBADAN NORTH');
});

test('validateKwaraAssignment resolves a hyphenated LGA name regardless of the dataset\'s own inconsistent hyphenation', () => {
  const result = validateKwaraAssignment({ state: 'Kwara', lga: 'Ibadan North-East' });
  assert.equal(result.lga, 'IBADAN NORTH EAST');
});

test('validateKwaraAssignment rejects an LGA that genuinely does not exist', () => {
  assert.throws(() => validateKwaraAssignment({ state: 'Kwara', lga: 'Not A Real LGA' }), /Select a valid Kwara LGA/);
});

test('validateKwaraAssignment resolves ward and polling unit casing once the LGA is resolved', () => {
  const result = validateKwaraAssignment({ state: 'Kwara', lga: 'ibadan north', ward: 'ward i n2' });
  assert.equal(result.lga, 'IBADAN NORTH');
  assert.equal(result.ward, 'WARD I N2');
});

test('validateKwaraAssignment requires an LGA before a ward or polling unit', () => {
  assert.throws(() => validateKwaraAssignment({ state: 'Kwara', ward: 'Ward 1' }), /LGA is required/);
});

test('validateKwaraAssignment with no geography supplied returns empty fields, not an error', () => {
  const result = validateKwaraAssignment({ state: 'Kwara' });
  assert.deepEqual(result, { state: 'Kwara', lga: '', ward: '', pollingUnit: '' });
});
