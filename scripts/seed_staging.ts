import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (Make sure GOOGLE_APPLICATION_CREDENTIALS is set)
initializeApp({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'remax-sales',
});

const db = getFirestore();
const auth = getAuth();

async function seedStaging() {
  console.log('Seeding staging environment for UAT...');

  // Create an Admin user
  try {
    const adminUser = await auth.createUser({
      email: 'admin@saletrack.local',
      password: 'Password123!',
      displayName: 'Staging Admin',
    });
    
    // Set custom claims
    await auth.setCustomUserClaims(adminUser.uid, { admin: true });
    
    // Create profile
    await db.collection('users').doc(adminUser.uid).set({
      email: 'admin@saletrack.local',
      name: 'Staging Admin',
      role: 'admin',
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log('Admin user created.');
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Admin user already exists. Updating password...');
      const user = await auth.getUserByEmail('admin@saletrack.local');
      await auth.updateUser(user.uid, { password: 'Password123!' });
    } else {
      console.error('Error creating admin user:', error);
    }
  }

  // Create goldenhouse.remax@gmail.com user (from Firestore UI)
  try {
    const ghUser = await auth.createUser({
      uid: 'ndrypuxhFpNXih38PzSMb4MuJp1',
      email: 'goldenhouse.remax@gmail.com',
      password: 'Password123!',
      displayName: 'Golden House Admin',
    });
    await auth.setCustomUserClaims(ghUser.uid, { admin: true });
    await db.collection('users').doc(ghUser.uid).set({
      email: 'goldenhouse.remax@gmail.com',
      name: 'Golden House Admin',
      role: 'admin',
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('Golden House Admin user created.');
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists' || error.code === 'auth/uid-already-exists') {
      console.log('Golden House Admin user already exists in Auth. Updating password...');
      await auth.updateUser('ndrypuxhFpNXih38PzSMb4MuJp1', { password: 'Password123!' });
    } else {
      console.error('Error creating Golden House user:', error);
    }
  }

  // Create a Salesperson user
  let salespersonUid = '';
  try {
    const salesUser = await auth.createUser({
      email: 'sales@saletrack.local',
      password: 'Password123!',
      displayName: 'Staging Salesperson',
    });
    salespersonUid = salesUser.uid;
    
    // Create profile
    await db.collection('users').doc(salespersonUid).set({
      email: 'sales@saletrack.local',
      name: 'Staging Salesperson',
      role: 'salesperson',
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log('Salesperson user created.');
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Salesperson user already exists. Fetching UID...');
      const user = await auth.getUserByEmail('sales@saletrack.local');
      salespersonUid = user.uid;
    } else {
      console.error('Error creating sales user:', error);
    }
  }

  // Seed Deals
  if (salespersonUid) {
    const dealRef = db.collection('deals').doc('sample-deal-1');
    await dealRef.set({
      title: 'Sample Unit 101',
      salespersonId: salespersonUid,
      state: 'prospecting',
      type: 'residential',
      priceEgp: 5000000,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log('Sample deal seeded.');

    // Seed Activity
    const today = new Date().toISOString().split('T')[0];
    const activityRef = db.collection('activities').doc(`${salespersonUid}_${today}`);
    await activityRef.set({
      uid: salespersonUid,
      date: today,
      attendance: 'present',
      leads: 5,
      calls: 20,
      meetings: 2,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log('Sample activity seeded.');
  }

  console.log('Staging seeding complete.');
  process.exit(0);
}

seedStaging().catch(console.error);
