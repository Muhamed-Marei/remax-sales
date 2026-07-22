import DailyActivityForm from '@/components/forms/DailyActivityForm';
import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function NewActivityPage() {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Log Daily Activity</h1>
      <DailyActivityForm />
    </div>
  );
}
