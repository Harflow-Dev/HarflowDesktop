import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HOST_CHANNEL,
  validateInformation,
  validateRequest,
  validateSender,
} from '../src/shared/bridge.js';

void test('host information channel accepts only an empty request payload', () => {
  assert.equal(HOST_CHANNEL, 'host:information');
  assert.doesNotThrow(() => validateRequest(undefined));
  for (const payload of [null, {}, [], '', 0, false])
    assert.throws(
      () => validateRequest(payload),
      /Unexpected host-information request payload/,
    );
});

void test('host information is validated, copied, and frozen', () => {
  const source = { application: 'Harflow Desktop', version: '0.0.1' };
  const result = validateInformation(source);
  assert.deepEqual(result, source);
  assert.notEqual(result, source);
  assert.ok(Object.isFrozen(result));

  for (const value of [
    null,
    undefined,
    1,
    'host',
    [],
    {},
    { application: 'app' },
    { application: 'app', version: '1', extra: true },
    { application: '', version: '1' },
    { application: 'app', version: '' },
    { application: 1, version: '1' },
    { application: 'a'.repeat(129), version: '1' },
    { application: 'app', version: 'v'.repeat(129) },
  ])
    assert.throws(() => validateInformation(value), /Invalid host information/);
});

void test('sender validation requires the exact trusted main-frame URL', () => {
  assert.doesNotThrow(() =>
    validateSender('file:///app/index.html', 'file:///app/index.html', true),
  );
  assert.throws(
    () =>
      validateSender('https://attacker.test', 'file:///app/index.html', true),
    /Untrusted IPC sender/,
  );
  assert.throws(
    () =>
      validateSender('file:///app/index.html', 'file:///app/index.html', false),
    /Untrusted IPC sender/,
  );
  assert.throws(
    () =>
      validateSender(
        'file:///app/index.html#fragment',
        'file:///app/index.html',
        true,
      ),
    /Untrusted IPC sender/,
  );
});
