import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResultEntries } from './validation.js';
import { validateKwaraAssignment } from '../geography/validation.js';
import { requireKwaraState } from '../../config/deployment.js';
import { getRegistrationLocationOptions } from '../../../shared/electionData.js';

test('result validation preserves zero and rejects missing, duplicate and invalid votes', () => {
  assert.deepEqual(validateResultEntries([{party:'A',votes:0},{party:'B',votes:'12'}],['A','B']),[{party:'A',votes:0},{party:'B',votes:12}]);
  for(const votes of [null,undefined,'',false,-1,1.5,Infinity,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>validateResultEntries([{party:'A',votes}],['A']));
  assert.throws(()=>validateResultEntries([{party:'A',votes:2},{party:'A',votes:3}],['A']));
  assert.throws(()=>validateResultEntries([{party:'Unknown',votes:2}],['A']));
});
test('Kwara deployment rejects other states and geography from a different parent', () => {
  assert.equal(requireKwaraState(' kwara '),'Kwara');
  for(const state of ['Osun','Lagos','Unknown'])assert.throws(()=>requireKwaraState(state));
  const lga=getRegistrationLocationOptions('Kwara').lgas[0];
  const ward=getRegistrationLocationOptions('Kwara',lga).wards[0];
  const pollingUnit=getRegistrationLocationOptions('Kwara',lga,ward).pollingUnits[0];
  assert.equal(validateKwaraAssignment({state:'Kwara',lga,ward,pollingUnit}).pollingUnit,pollingUnit);
  assert.throws(()=>validateKwaraAssignment({state:'Osun',lga,ward,pollingUnit}));
  assert.throws(()=>validateKwaraAssignment({state:'Kwara',lga,ward:'Unknown ward'}));
  assert.throws(()=>validateKwaraAssignment({state:'Kwara',lga,ward,pollingUnit:'Unknown unit'}));
  assert.throws(()=>validateKwaraAssignment({state:'Kwara',ward}));
});
