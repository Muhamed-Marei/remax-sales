import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';

export default async function Home() {
  const claims = await verifySession();

  // Not logged in — go to login
  if (!claims) {
    redirect('/login');
  }

  // Route based on role
  if (claims.role === 'admin' || claims.admin === true) {
    redirect('/admin');
  }

  redirect('/dashboard');
}
