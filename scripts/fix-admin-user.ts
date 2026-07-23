import 'dotenv/config';
import { adminAuth, adminDb } from '../src/lib/firebase/admin';

async function fixAdminUser() {
  console.log('Searching for user goldenhouse.remax@gmail.com...');
  try {
    const userRecord = await adminAuth.getUserByEmail('goldenhouse.remax@gmail.com');
    console.log(`Found Auth User UID: ${userRecord.uid}`);

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      ...(userRecord.customClaims || {}),
      role: 'admin',
      admin: true,
      orgId: 'default',
    });
    console.log('✅ Updated Auth custom claims: { role: "admin", admin: true, orgId: "default" }');

    // Update Firestore document in root 'users' collection
    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    const existingDoc = await userDocRef.get();
    const existingData = existingDoc.exists ? existingDoc.data() : {};

    await userDocRef.set({
      ...existingData,
      id: userRecord.uid,
      email: 'goldenhouse.remax@gmail.com',
      displayName: existingData?.displayName || existingData?.name || 'Admin',
      role: 'admin',
      status: 'active',
      orgId: existingData?.orgId || 'default',
      updatedAt: new Date(),
    }, { merge: true });

    console.log('✅ Updated Firestore document in users collection:', userRecord.uid);
  } catch (error) {
    console.error('Error fixing admin user:', error);
  }
}

fixAdminUser().then(() => {
  console.log('Done.');
  process.exit(0);
});
