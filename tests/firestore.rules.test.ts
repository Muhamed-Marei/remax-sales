// @vitest-environment node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const firestoreRules = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-salestrack-test',
    firestore: {
      rules: firestoreRules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  describe('Admin access', () => {
    it('should allow admin to read and write any document', async () => {
      const adminDb = testEnv.authenticatedContext('admin1', { role: 'admin' }).firestore();
      await assertSucceeds(adminDb.collection('someRandomCollection').doc('testDoc').set({ foo: 'bar' }));
      await assertSucceeds(adminDb.collection('someRandomCollection').doc('testDoc').get());
    });
  });

  describe('Unauthenticated access', () => {
    it('should deny unauthenticated users to read or write', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.collection('organizations').doc('org1').get());
      await assertFails(unauthDb.collection('organizations').doc('org1').collection('users').doc('user1').set({ foo: 'bar' }));
    });
  });

  describe('Salesperson access', () => {
    it('should allow salesperson to read own profile', async () => {
      const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
      await assertSucceeds(db.collection('organizations').doc('org1').collection('users').doc('sales1').get());
    });

    it('should deny salesperson to read other profiles', async () => {
      const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
      await assertFails(db.collection('organizations').doc('org1').collection('users').doc('sales2').get());
    });

    it('should deny salesperson to write to own or other profiles', async () => {
      const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
      await assertFails(db.collection('organizations').doc('org1').collection('users').doc('sales1').set({ foo: 'bar' }));
      await assertFails(db.collection('organizations').doc('org1').collection('users').doc('sales2').set({ foo: 'bar' }));
    });

    it('should deny client access to audit logs', async () => {
      const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
      await assertFails(db.collection('organizations').doc('org1').collection('auditLogs').doc('log1').get());
      await assertFails(db.collection('organizations').doc('org1').collection('auditLogs').doc('log1').set({ action: 'test' }));
    });

    describe('Activities', () => {
      it('should allow salesperson to create activity for themselves', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('activities').doc('act1').set({
          salesId: 'sales1'
        }));
      });

      it('should deny salesperson to create activity for others', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('activities').doc('act1').set({
          salesId: 'sales2'
        }));
      });
      
      // Need to seed data to test read/update via resource.data correctly
      it('should allow salesperson to read and update own activity', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('activities').doc('act1').set({
            salesId: 'sales1'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('activities').doc('act1').get());
        await assertSucceeds(db.collection('organizations').doc('org1').collection('activities').doc('act1').update({ updated: true }));
      });

      it('should deny salesperson to read or update others activity', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('activities').doc('act2').set({
            salesId: 'sales2'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('activities').doc('act2').get());
        await assertFails(db.collection('organizations').doc('org1').collection('activities').doc('act2').update({ updated: true }));
      });
    });

    describe('Deals', () => {
      it('should allow salesperson to create deal assigned to themselves', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('deals').doc('deal1').set({
          assignedSalesId: 'sales1'
        }));
      });

      it('should deny salesperson to create deal assigned to others', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('deals').doc('deal1').set({
          assignedSalesId: 'sales2'
        }));
      });
      
      it('should allow salesperson to read and update own deal', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('deals').doc('deal1').set({
            assignedSalesId: 'sales1'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('deals').doc('deal1').get());
        await assertSucceeds(db.collection('organizations').doc('org1').collection('deals').doc('deal1').update({ updated: true }));
      });

      it('should deny salesperson to read or update others deal', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('deals').doc('deal2').set({
            assignedSalesId: 'sales2'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('deals').doc('deal2').get());
        await assertFails(db.collection('organizations').doc('org1').collection('deals').doc('deal2').update({ updated: true }));
      });
    });

    describe('Leads', () => {
      it('should allow salesperson to create lead assigned to themselves', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('leads').doc('lead1').set({
          assignedSalesId: 'sales1'
        }));
      });

      it('should deny salesperson to create lead assigned to others', async () => {
        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('leads').doc('lead1').set({
          assignedSalesId: 'sales2'
        }));
      });
      
      it('should allow salesperson to read and update own lead', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('leads').doc('lead1').set({
            assignedSalesId: 'sales1'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertSucceeds(db.collection('organizations').doc('org1').collection('leads').doc('lead1').get());
        await assertSucceeds(db.collection('organizations').doc('org1').collection('leads').doc('lead1').update({ updated: true }));
      });

      it('should deny salesperson to read or update others lead', async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          await context.firestore().collection('organizations').doc('org1').collection('leads').doc('lead2').set({
            assignedSalesId: 'sales2'
          });
        });

        const db = testEnv.authenticatedContext('sales1', { role: 'salesperson' }).firestore();
        await assertFails(db.collection('organizations').doc('org1').collection('leads').doc('lead2').get());
        await assertFails(db.collection('organizations').doc('org1').collection('leads').doc('lead2').update({ updated: true }));
      });
    });
  });
});
