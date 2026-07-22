'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size="lg" showText={true} text="SaleTrack" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Reset Password</h2>
        </div>

        {error && (
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'hsla(354, 75%, 52%, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '1rem', backgroundColor: 'hsla(145, 65%, 42%, 0.12)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </div>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Enter your registered email address and we will send you a link to reset your password.
            </p>

            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="name@company.com"
                className={`input-field ${errors.email ? 'input-error' : ''}`} 
                {...register('email')} 
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
