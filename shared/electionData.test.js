import test from 'node:test';
import assert from 'node:assert/strict';
import { NIGERIA_STATES, getRegistrationLocationOptions } from './electionData.js';

test('registration location data includes Nigeria states and real polling-unit options', () => {
  assert.ok(NIGERIA_STATES.includes('Oyo'));
  assert.ok(NIGERIA_STATES.includes('Abia'));
  const kwaraOptions = getRegistrationLocationOptions('Kwara');
  assert.ok(kwaraOptions.lgas.includes('ASA'));
  const asaOptions = getRegistrationLocationOptions('Kwara', 'ASA');
  assert.ok(asaOptions.wards.includes('ADIGBONGBO/AWE/ORIMARO'));
  const kwaraPollingUnits = getRegistrationLocationOptions('Kwara', 'ASA', 'ADIGBONGBO/AWE/ORIMARO');
  assert.ok(kwaraPollingUnits.pollingUnits.includes('ADIGBONGBO L.G.E.A SCH'));

  const abiaOptions = getRegistrationLocationOptions('Abia', 'ABA NORTH', 'EZIAMA');
  assert.ok(abiaOptions.lgas.includes('ABA NORTH'));
  assert.ok(abiaOptions.wards.includes('EZIAMA'));
  assert.ok(abiaOptions.pollingUnits.some((unit) => unit.includes('RAILWAY QUARTERS')));
  assert.equal(abiaOptions.lgas.every((lga) => lga !== 'Afijio'), true);
  assert.equal(abiaOptions.wards.every((ward) => ward !== 'Ward 01'), true);
});
