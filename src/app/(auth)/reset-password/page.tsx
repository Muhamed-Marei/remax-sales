'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!oobCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Invalid or missing action code.');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((emailRes) => {
        setEmail(emailRes);
        setIsVerifying(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Invalid or expired action code. Please request a new password reset.');
        setIsVerifying(false);
      });
  }, [oobCode]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!oobCode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying security token...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Logo size="lg" showText={true} text="SaleTrack" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Set New Password</h2>
      </div>
      
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'hsla(354, 75%, 52%, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '1rem', backgroundColor: 'hsla(145, 65%, 42%, 0.12)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Password reset successfully! Redirecting to login...
          </div>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Login Now
          </Link>
        </div>
      ) : (
        <>
          {email && (
            <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Resetting password for: <strong>{email}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label className="input-label" htmlFor="password">New Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className={`input-field ${errors.password ? 'input-error' : ''}`} 
                {...register('password')} 
              />
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••"
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`} 
                {...register('confirmPassword')} 
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={isLoading || !!error}
            >
              {isLoading ? 'Saving...' : 'Save New Password'}
            </button>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
