'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dealSchema } from '@/lib/schemas';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/ui/FileUpload';

type DealFormValues = z.infer<typeof dealSchema>;

interface Props {
  initialData?: Partial<DealFormValues>;
  isEditing?: boolean;
  dealId?: string;
  currentUserId: string;
  isAdmin: boolean;
  salespeople?: { id: string, name: string }[];
  leads?: { id: string, name: string, phone: string }[];
}

export default function DealForm({ initialData, isEditing = false, dealId, currentUserId, isAdmin, salespeople = [], leads = [] }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      unitType: initialData?.unitType || '',
      specifications: initialData?.specifications || '',
      location: initialData?.location || '',
      ownerCooperative: initialData?.ownerCooperative || 'unknown',
      commissionRate: initialData?.commissionRate || 0,
      askingPrice: initialData?.askingPrice || 0,
      notes: initialData?.notes || '',
      dealType: initialData?.dealType || 'easy_to_pay',
      dealState: initialData?.dealState || 'draft',
      assignedSalesId: initialData?.assignedSalesId || currentUserId,
      leadId: initialData?.leadId || '',
      lostReason: initialData?.lostReason || '',
      photoUrls: initialData?.photoUrls || [],
    },
  });

  const dealState = watch('dealState');

  const onSubmit = async (data: DealFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const url = isEditing ? `/api/sales/deals/${dealId}` : '/api/sales/deals';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save deal');
      }

      router.push('/dashboard/deals');
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
          <label className="input-label" htmlFor="unitType">Unit Type / نوع الوحدة</label>
          <input 
            type="text" 
            id="unitType" 
            className="input-field" 
            {...register('unitType')} 
          />
          {errors.unitType && <span className="error-message">{errors.unitType.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="location">Location / الموقع</label>
          <input 
            type="text" 
            id="location" 
            className="input-field" 
            {...register('location')} 
          />
          {errors.location && <span className="error-message">{errors.location.message}</span>}
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label" htmlFor="specifications">Specifications / المواصفات</label>
          <textarea 
            id="specifications" 
            className="input-field" 
            rows={3}
            {...register('specifications')} 
          />
          {errors.specifications && <span className="error-message">{errors.specifications.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="askingPrice">Asking Price (EGP) / السعر المطلوب</label>
          <input 
            type="number" 
            id="askingPrice" 
            className="input-field" 
            min="0"
            {...register('askingPrice', { valueAsNumber: true })} 
          />
          {errors.askingPrice && <span className="error-message">{errors.askingPrice.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="commissionRate">Commission Rate / نسبة العمولة</label>
          <input 
            type="number" 
            id="commissionRate" 
            className="input-field"
            step="0.01"
            min="0"
            max="1"
            {...register('commissionRate', { valueAsNumber: true })} 
          />
          {errors.commissionRate && <span className="error-message">{errors.commissionRate.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="ownerCooperative">Owner Cooperative? / هل المالك متعاون؟</label>
          <select id="ownerCooperative" className="input-field" {...register('ownerCooperative')}>
            <option value="cooperative">Cooperative (متعاون)</option>
            <option value="not_cooperative">Not Cooperative (غير متعاون)</option>
            <option value="unknown">Unknown (غير معروف)</option>
          </select>
          {errors.ownerCooperative && <span className="error-message">{errors.ownerCooperative.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="dealType">Deal Type / نوع الصفقة</label>
          <select id="dealType" className="input-field" {...register('dealType')}>
            <option value="easy_to_pay">Easy to Pay (سهل الدفع)</option>
            <option value="needs_time">Needs Time (يحتاج وقت)</option>
          </select>
          {errors.dealType && <span className="error-message">{errors.dealType.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="dealState">Deal State / حالة الصفقة</label>
          <select id="dealState" className="input-field" {...register('dealState')}>
            <option value="draft">Draft (مسودة)</option>
            <option value="active">Active (نشط)</option>
            <option value="contacted">Contacted (تم التواصل)</option>
            <option value="viewing_scheduled">Viewing Scheduled (تم تحديد معاينة)</option>
            <option value="viewed">Viewed (تمت المعاينة)</option>
            <option value="meeting_scheduled">Meeting Scheduled (تم تحديد اجتماع)</option>
            <option value="negotiating">Negotiating (تفاوض)</option>
            <option value="reserved">Reserved (محجوز)</option>
            <option value="won">Won (مكتسب)</option>
            <option value="lost">Lost (مفقود)</option>
            <option value="archived">Archived (مؤرشف)</option>
          </select>
          {errors.dealState && <span className="error-message">{errors.dealState.message}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="leadId">Customer/Lead / العميل (اختياري)</label>
          <select id="leadId" className="input-field" {...register('leadId')}>
            <option value="">None (لا يوجد)</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name} {lead.phone ? `(${lead.phone})` : ''}</option>
            ))}
          </select>
          {errors.leadId && <span className="error-message">{errors.leadId.message}</span>}
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

        {dealState === 'lost' && (
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" htmlFor="lostReason">Lost Reason / سبب الفقدان</label>
            <input 
              type="text" 
              id="lostReason" 
              className="input-field" 
              {...register('lostReason')} 
            />
            {errors.lostReason && <span className="error-message">{errors.lostReason.message}</span>}
          </div>
        )}
      </div>

      <div className="input-group" style={{ marginTop: '1.5rem' }}>
        <label className="input-label" htmlFor="notes">Notes / ملاحظات</label>
        <textarea 
          id="notes" 
          className="input-field" 
          rows={3}
          {...register('notes')} 
        />
        {errors.notes && <span className="error-message">{errors.notes.message}</span>}
      </div>

      <div style={{ marginTop: '1.5rem', gridColumn: '1 / -1' }}>
        <FileUpload 
          dealId={dealId || 'new'} 
          existingUrls={initialData?.photoUrls || []} 
          onUploadSuccess={(urls) => setValue('photoUrls', urls)} 
        />
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => router.push('/dashboard/deals')}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Deal' : 'Create Deal')}
        </button>
      </div>
    </form>
  );
}
