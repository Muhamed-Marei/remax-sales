/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dailyActivitySchema } from '@/lib/schemas';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

type ActivityFormValues = z.infer<typeof dailyActivitySchema>;

interface Props {
  activityId: string;
  initialData: Partial<ActivityFormValues>;
}

export default function AdminActivityEditForm({ activityId, initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(dailyActivitySchema) as any,
    defaultValues: {
      activityDate: initialData.activityDate,
      attendance: initialData.attendance,
      primarySource: initialData.primarySource,
      leads: initialData.leads,
      followUps: initialData.followUps,
      responses: initialData.responses,
      calls: initialData.calls,
      siteVisits: initialData.siteVisits,
      viewings: initialData.viewings,
      meetings: initialData.meetings,
      dealsCount: initialData.dealsCount,
      newUnits: initialData.newUnits,
      portfolioCount: initialData.portfolioCount,
      facebookCount: initialData.facebookCount,
      marketplaceCount: initialData.marketplaceCount,
      mohamedCount: initialData.mohamedCount,
      notes: initialData.notes,
    },
  });

  const onSubmit = async (data: ActivityFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity');
      }

      router.push('/admin/activities');
      router.refresh();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger)', color: 'white', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="activityDate">Date / التاريخ</label>
          <input 
            type="date" 
            id="activityDate" 
            className="input-field" 
            {...register('activityDate')} 
            disabled 
          />
          {errors.activityDate && <span className="error-message">{errors.activityDate.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="attendance">Attendance / الحضور</label>
          <select id="attendance" className="input-field" {...register('attendance')}>
            <option value="present">Present (حاضر)</option>
            <option value="late">Late (متأخر)</option>
            <option value="absent">Absent (غائب)</option>
            <option value="leave">Leave (إجازة)</option>
            <option value="remote">Remote (عن بعد)</option>
          </select>
          {errors.attendance && <span className="error-message">{errors.attendance.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="primarySource">Primary Source / المصدر الرئيسي</label>
          <input 
            type="text" 
            id="primarySource" 
            className="input-field" 
            placeholder="e.g. Facebook, Referral..."
            {...register('primarySource')} 
          />
          {errors.primarySource && <span className="error-message">{errors.primarySource.message}</span>}
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="leads">New Leads / عملاء جدد</label>
          <input 
            type="number" 
            id="leads" 
            className="input-field" 
            min="0"
            {...register('leads', { valueAsNumber: true })} 
          />
          {errors.leads && <span className="error-message">{errors.leads.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="calls">Calls / مكالمات</label>
          <input 
            type="number" 
            id="calls" 
            className="input-field" 
            min="0"
            {...register('calls', { valueAsNumber: true })} 
          />
          {errors.calls && <span className="error-message">{errors.calls.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="meetings">Meetings / اجتماعات</label>
          <input 
            type="number" 
            id="meetings" 
            className="input-field" 
            min="0"
            {...register('meetings', { valueAsNumber: true })} 
          />
          {errors.meetings && <span className="error-message">{errors.meetings.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="siteVisits">Site Visits / زيارات الموقع</label>
          <input 
            type="number" 
            id="siteVisits" 
            className="input-field" 
            min="0"
            {...register('siteVisits', { valueAsNumber: true })} 
          />
          {errors.siteVisits && <span className="error-message">{errors.siteVisits.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="viewings">Viewings / معاينات</label>
          <input 
            type="number" 
            id="viewings" 
            className="input-field" 
            min="0"
            {...register('viewings', { valueAsNumber: true })} 
          />
          {errors.viewings && <span className="error-message">{errors.viewings.message}</span>}
        </div>
      </div>

      <div className="input-group" style={{ marginTop: '1.5rem' }}>
        <label className="input-label" htmlFor="notes">Notes / ملاحظات</label>
        <textarea 
          id="notes" 
          className="input-field" 
          rows={4}
          {...register('notes')} 
        />
        {errors.notes && <span className="error-message">{errors.notes.message}</span>}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => router.push('/admin/activities')}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Activity'}
        </button>
      </div>
    </form>
  );
}
