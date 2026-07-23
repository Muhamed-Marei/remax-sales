/* eslint-disable @typescript-eslint/no-explicit-any */
import DailyActivityForm from '@/components/forms/DailyActivityForm';
import { verifySession } from '@/lib/auth/session';
import { getActivities } from '@/lib/repositories/activity';
import { redirect, notFound } from 'next/navigation';

interface Props {
  params: Promise<{ date: string }>;
}

export default async function EditActivityPage({ params }: Props) {
  const claims = await verifySession();
  
  if (!claims || !claims.uid) {
    redirect('/login');
  }

  const { date } = await params;
  
  // Validate date param roughly
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const orgId = 'default';
  const activities = await getActivities(orgId, claims.uid, date, date);
  const activity = activities.find(a => a.activityDate === date);

  if (!activity) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Edit Activity ({date})</h1>
      <DailyActivityForm initialData={activity as any} isEditing={true} />
    </div>
  );
}
