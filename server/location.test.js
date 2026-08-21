import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReverseLocation } from './location.js';

test('reverse location prefers a named place and preserves street context', () => {
  const location = formatReverseLocation({
    name: 'Ayegbaju Primary School',
    display_name: 'Ayegbaju Primary School, Ayeni Street, Kwara, Nigeria',
    address: { house_number: '2', road: 'Ayeni Street', town: 'Ilorin' },
  }, 8.5, 4.55);
  assert.equal(location.label, 'Ayegbaju Primary School');
  assert.equal(location.street, '2 Ayeni Street');
  assert.equal(location.locality, 'Ilorin');
});

test('reverse location falls back to coordinates when no address exists', () => {
  const location = formatReverseLocation({}, 8.4799, 4.5418);
  assert.equal(location.label, '8.47990, 4.54180');
});
