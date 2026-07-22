// @vitest-environment node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const storageRules = readFileSync(resolve(__dirname, '../storage.rules'), 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-salestrack-test',
    storage: {
      rules: storageRules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

describe('Storage Security Rules', () => {
  describe('Admin access', () => {
    it('should allow admin to read and write any file', async () => {
      const adminStorage = testEnv.authenticatedContext('admin1', { role: 'admin' }).storage();
      const testRef = adminStorage.ref('some/random/path/test.png');
      
      await assertSucceeds(Promise.resolve(testRef.putString('test', 'raw', { contentType: 'text/plain' })));
      await assertSucceeds(Promise.resolve(testRef.getDownloadURL()));
    });
  });

  describe('Unauthenticated access', () => {
    it('should deny unauthenticated users to read or write', async () => {
      const unauthStorage = testEnv.unauthenticatedContext().storage();
      const testRef = unauthStorage.ref('deals/deal1/test.png');
      
      await assertFails(Promise.resolve(testRef.putString('test', 'raw', { contentType: 'image/png' })));
      await assertFails(Promise.resolve(testRef.getDownloadURL()));
    });
  });

  describe('Salesperson access', () => {
    it('should allow authenticated salesperson to write valid image to deal folder', async () => {
      const storage = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).storage();
      const testRef = storage.ref('deals/deal1/test.png');
      
      await assertSucceeds(Promise.resolve(testRef.putString('test', 'raw', { contentType: 'image/png' })));
    });

    it('should deny authenticated salesperson to write invalid type', async () => {
      const storage = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).storage();
      const testRef = storage.ref('deals/deal1/test.txt');
      
      await assertFails(Promise.resolve(testRef.putString('test', 'raw', { contentType: 'text/plain' })));
    });

    it('should allow authenticated salesperson to read from deal folder', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const testRef = context.storage().ref('deals/deal1/test.png');
        await testRef.putString('test', 'raw', { contentType: 'image/png' });
      });

      const storage = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).storage();
      const testRef = storage.ref('deals/deal1/test.png');
      
      await assertSucceeds(Promise.resolve(testRef.getDownloadURL()));
    });

    it('should deny salesperson to write to other folders', async () => {
      const storage = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).storage();
      const testRef = storage.ref('organizations/org1/users/sales1/profile.png');
      
      await assertFails(Promise.resolve(testRef.putString('test', 'raw', { contentType: 'image/png' })));
    });
  });
});
