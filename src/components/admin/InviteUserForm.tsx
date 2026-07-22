'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function InviteUserForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to invite user');
      }

      setSuccess('Invitation sent successfully!');
      reset();
      router.refresh(); // Refresh the page to show the new user
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

      <div className="input-group">
        <label className="input-label" htmlFor="displayName">Name (Arabic or English)</label>
        <input 
          id="displayName"
          type="text" 
          className={`input-field ${errors.displayName ? 'input-error' : ''}`}
          placeholder="Salesperson name"
          {...register('displayName')}
        />
        {errors.displayName && <span className="error-message">{errors.displayName.message}</span>}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          className={`input-field ${errors.email ? 'input-error' : ''}`}
          placeholder="email@example.com"
          {...register('email')}
        />
        {errors.email && <span className="error-message">{errors.email.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
        {isLoading ? 'Inviting...' : 'Send Invitation'}
      </button>
    </form>
  );
}
