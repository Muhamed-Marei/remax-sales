/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema } from '@/lib/schemas';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

type LeadFormValues = z.infer<typeof leadSchema>;

interface Props {
  initialData?: Partial<LeadFormValues>;
  isEditing?: boolean;
  leadId?: string;
  currentUserId: string;
  isAdmin: boolean;
  salespeople?: { id: string, name: string }[];
}

export default function LeadForm({ initialData, isEditing = false, leadId, currentUserId, isAdmin, salespeople = [] }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      source: initialData?.source || '',
      status: initialData?.status || 'new',
      budget: initialData?.budget || 0,
      preferences: initialData?.preferences || '',
      assignedSalesId: initialData?.assignedSalesId || currentUserId,
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const url = isEditing ? `/api/sales/leads/${leadId}` : '/api/sales/leads';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lead');
      }

      router.push('/dashboard/leads');
      router.refresh();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving.';
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
          <label className="input-label" htmlFor="name">Name / الاسم</label>
          <input 
            type="text" 
            id="name" 
            className="input-field" 
            {...register('name')} 
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="phone">Phone / الهاتف</label>
          <input 
            type="text" 
            id="phone" 
            className="input-field" 
            {...register('phone')} 
          />
          {errors.phone && <span className="error-message">{errors.phone.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="email">Email / البريد الإلكتروني</label>
          <input 
            type="email" 
            id="email" 
            className="input-field" 
            {...register('email')} 
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="source">Source / المصدر</label>
          <input 
            type="text" 
            id="source" 
            className="input-field" 
            {...register('source')} 
          />
          {errors.source && <span className="error-message">{errors.source.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="status">Status / الحالة</label>
          <select id="status" className="input-field" {...register('status')}>
            <option value="new">New (جديد)</option>
            <option value="contacted">Contacted (تم التواصل)</option>
            <option value="qualified">Qualified (مؤهل)</option>
            <option value="disqualified">Disqualified (غير مؤهل)</option>
            <option value="won">Won (مكتسب)</option>
            <option value="lost">Lost (مفقود)</option>
          </select>
          {errors.status && <span className="error-message">{errors.status.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="budget">Budget (EGP) / الميزانية</label>
          <input 
            type="number" 
            id="budget" 
            className="input-field" 
            min="0"
            {...register('budget', { valueAsNumber: true })} 
          />
          {errors.budget && <span className="error-message">{errors.budget.message}</span>}
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label" htmlFor="preferences">Preferences / التفضيلات</label>
          <textarea 
            id="preferences" 
            className="input-field" 
            rows={3}
            {...register('preferences')} 
          />
          {errors.preferences && <span className="error-message">{errors.preferences.message}</span>}
        </div>

        {isAdmin && (
          <div className="input-group">
            <label className="input-label" htmlFor="assignedSalesId">Assign To / تعيين إلى</label>
            <select id="assignedSalesId" className="input-field" {...register('assignedSalesId')}>
              <option value={currentUserId}>Self (نفسي)</option>
              {salespeople.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            {errors.assignedSalesId && <span className="error-message">{errors.assignedSalesId.message}</span>}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => router.push('/dashboard/leads')}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
        </button>
      </div>
    </form>
  );
}
